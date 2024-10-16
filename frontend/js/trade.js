let ws = new WebSocket('ws://localhost:3001')
let orderPairs = new Set()
let portfolioPairs = new Set()
let orderList = document.getElementById('orderList')
let historyList = document.getElementById('historyList')
let portfolioList = document.getElementById('portfolioList')
let modalHistoryList = document.getElementById('modalHistoryList')
let historyData = []
let allOrders = []

ws.onopen = () => {
    const message = {
        action: 'subscribeTradeUpdates'
    }
    ws.send(JSON.stringify(message))
}

ws.onmessage = (event) => {
    const responseArray = JSON.parse(event.data)
    if (responseArray.action === 'orderUpdates'){
        responseArray.data.forEach(orderData => {
            const {id, coin, order_type, order_volume, order_price, order_value} = orderData

            if (orderPairs.has(id)) {
                updateOrderRow(id, coin, order_type, order_volume, order_price, order_value)
            } else {
                createOrderRow(id, coin, order_type, order_volume, order_price, order_value)
                orderPairs.add(id)
            }
        })
    }

    if (responseArray.action === 'orderRemoved'){
        responseArray.data.forEach(orderId => { 
            if (orderPairs.has(orderId)) {
                removeOrderRow(orderId)
                orderPairs.delete(orderId)
            }
        })
    }

    if (responseArray.action === 'historyUpdates'){
        historyData = []
        responseArray.data.forEach(historyData => {
            const {id, coin, order_type, trade_volume, trade_price, trade_value, timestamp} = historyData
            createHistoryRow(id, coin, order_type, trade_volume, trade_price, trade_value, timestamp)
        })
    }

    if (responseArray.action === 'portfolioUpdates'){
        responseArray.data.forEach(portfolioData => {
            const { id, coin, total_volume, average_cost, total_cost, current_value, profit_loss } = portfolioData
            if (portfolioPairs.has(id)) {
                updatePortfolioRow(id, coin, total_volume, average_cost, total_cost, current_value, profit_loss)
            } else {
                createPortfolioRow(id, coin, total_volume, average_cost, total_cost, current_value, profit_loss)
                portfolioPairs.add(id)
            }
        })
    }

    if (responseArray.action === 'portfolioRemoved'){
        console.log(responseArray)
        responseArray.data.forEach(portfolioId => { 
            if (portfolioPairs.has(portfolioId)) {
                removePortfolioRow(portfolioId)
                portfolioPairs.delete(portfolioId)
            }
        })
    }

    if (responseArray.action === 'assetUpdates'){
        const { cash_balance, holdings_value } = responseArray.data
        updateAssetRow(cash_balance, holdings_value)
    }

    if (responseArray.action === 'topPlayerUpdates'){
        const topPlayers = responseArray.data;

        // 找到表格的 tbody
        const topPlayersTableBody = document.getElementById('topPlayersTable').querySelector('tbody')
        
        // 清空現有的資料
        topPlayersTableBody.innerHTML = ''

        // 遍歷收到的前十名資料，依次插入表格
        topPlayers.forEach((player, index) => {
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${index + 1}</td> 
                <td>${player.name}</td> 
                <td>${player.asset.toFixed(2)} USDT</td> 
            `
            topPlayersTableBody.appendChild(row)
        })
    }
}


document.getElementById('priceNow').addEventListener('click',typePrice)

document.getElementById('price').addEventListener('input',typeValue)

document.getElementById('amount').addEventListener('input',typeValue)

document.getElementById('value').addEventListener('input',typeAmount)

document.getElementById('cryptoForm').addEventListener('submit',placeOrder)

document.getElementById('resetAsset').addEventListener('click',resetAsset)

document.getElementById('historySearch').addEventListener('click',historySearch)

async function typePrice(){
    const coin = document.querySelector('#cryptoSelect').value
    try{
        const response = await axios.post('http://localhost:3001/trade/typePrice',{coin},{withCredentials: true})
        if(response.data === '無效的交易對或不支援的幣種'){
            return alert('交易對輸入錯誤')
        }
        document.getElementById('price').value = response.data.price
        const price = document.getElementById('price').value
        const amount = document.getElementById('amount').value
        document.getElementById('value').value = (amount * price).toFixed(4)
    }catch(error){
        alert(error.response.data)
        window.location.href = '/memberPage'
    }
}

function typeValue(){
    const amount = document.getElementById('amount').value
    const price = document.getElementById('price').value   
    document.getElementById('value').value = (amount * price).toFixed(4)
}

function typeAmount(){
    const price = document.getElementById('price').value
    const value = document.getElementById('value').value
    document.getElementById('amount').value = (value/price).toFixed(4)
}

async function placeOrder(event){
    event.preventDefault()
    // 獲取表單數據
    const cryptoSelect = document.getElementById('cryptoSelect').value
    const order_price = parseFloat(document.getElementById('price').value)
    const order_volume = parseFloat(document.getElementById('amount').value)
    const order_value = parseFloat(document.getElementById('value').value)
    
    // 判斷是點擊買或賣
    const clickedButton = event.submitter; // HTML5 提供的 `event.submitter` 可取得觸發 submit 的按鈕
    const order_type = clickedButton.id === 'placeBuyOrder' ? 'BUY' : 'SELL'
    
    const orderTypeClass = order_type === 'BUY' ? 'text-bright-red fw-bold' : 'text-bright-green fw-bold'


    // 構建確認視窗的交易資訊
    document.getElementById('modalTransactionInfo').innerHTML = `
        <tr>
            <td>${cryptoSelect.replace("USDT", "")}</td>
            <td class="${orderTypeClass}">${order_type}</td>
            <td>${order_volume}</td>
            <td>${order_price}</td>
            <td>${order_value.toFixed(2)}</td>
        </tr>
    `  

    // 顯示確認視窗
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'))
    confirmModal.show();

    // 等待用戶確認交易
    const confirmed = await getUserConfirmation()

    if (confirmed) {
        // 確認後發送到後端
        const order = {
            cryptoSelect: cryptoSelect,
            order_type: order_type,
            order_volume: order_volume,
            order_price: order_price,
            order_value: order_value,
        }

        try {
            const response = await axios.post('http://localhost:3001/trade/placeOrder', 
                { order }, 
                { withCredentials: true }
            )
            if (response.status === 200) {
                confirmModal.hide()
                return alert(response.data)
            }
            if (response.status === 201) {
                confirmModal.hide()
                return alert(`成功下單 ${cryptoSelect}`)
            }
        } catch (error) {
            alert(error.response.data)
            window.location.href = '/memberPage'
        }
    } else {
        // 如果取消交易，重置表單或其他操作
        alert('交易已取消')
        confirmModal.hide()
    }
}

function getUserConfirmation(){
    return new Promise((resolve) => {
        const confirmButton = document.getElementById('confirmTransaction')
        const cancelButton = document.getElementById('cancelTransaction')

        // 確認按鈕點擊時解決 Promise
        confirmButton.onclick = function () {
            resolve(true)
        }

        // 取消按鈕點擊時解決 Promise
        cancelButton.onclick = function () {
            resolve(false)
        }
    })
}

async function resetAsset(){
    const resetModal = new bootstrap.Modal(document.getElementById('resetModal'))
    resetModal.show()

    const confirmed = await confirmResetAsset()
    
    if (confirmed) {
        try {
            const response = await axios.post('http://localhost:3001/trade/resetAsset', 
                {}, 
                { withCredentials: true }
            )
            if (response.status === 201) {
                resetModal.hide()
                alert(`${response.data.message}`)
                return window.location.href = '/trade'
            }
        } catch (error) {
            alert(error.response.data)
            window.location.href = '/memberPage'
        }
    }   
}

async function confirmResetAsset(){
    return new Promise((resolve) => {
        const confirmButton = document.getElementById('confirmResetAsset')
        const cancelButton = document.getElementById('cancelResetAsset')

        // 確認按鈕點擊時解決 Promise
        confirmButton.onclick = function () {
            resolve(true)
        }

        // 取消按鈕點擊時解決 Promise
        cancelButton.onclick = function () {
            resolve(false)
        }
    })
}

async function removeOrder(id){
    try {
        const response = await axios.post('http://localhost:3001/trade/removeOrder', { id }, {
            withCredentials: true
        })
        alert(response.data)
    } catch (error) {
        alert(error.response.data)
        window.location.href = '/memberPage'
    }
}

async function historySearch() {
    const startDateInput = document.getElementById('startDate').value
    const endDateInput = document.getElementById('endDate').value

    const startDate = new Date(startDateInput)
    const endDate = new Date(endDateInput) 

    // 檢查日期區間是否有效，並限制區間不超過2天
    if (!startDateInput || !endDateInput || startDate > endDate || (endDate - startDate) > ( 24 * 60 * 60 * 1000)) {
        alert("請選擇有效且不超過二天的日期區間")
        return
    }
    
    endDate.setDate(endDate.getDate() + 1) // 將日期加一天
    try {
        // 發送日期區間查詢請求給後端
        const response = await axios.post('http://localhost:3001/trade/historySearch', {
            startDate,
            endDate
        }, {
            withCredentials: true
        });

        // 假設後端回傳的資料是類似 [{id, coin, order_type, trade_volume, trade_price, trade_value, timestamp}] 的格式
        const historyData = response.data;
        console.log(response.data)
        // 清空 modal 中的紀錄
        modalHistoryList.innerHTML = '';

        // 將回傳的資料插入到 modal 中
        historyData.forEach(item => {
            const { id, coin, order_type, trade_volume, trade_price, trade_value, timestamp } = item;
            const row = document.createElement('tr');
            row.setAttribute('data-history-id', id);

            const orderTypeClass = order_type === 'BUY' ? 'text-bright-red fw-bold' : 'text-bright-green fw-bold';

            row.innerHTML = `
                <td>${new Date(timestamp).toLocaleString()}</td>
                <td>${coin.replace("USDT", "")}</td>
                <td class="${orderTypeClass}">${order_type}</td>
                <td>${trade_volume}</td>
                <td>${trade_price}</td>
                <td>${trade_value}</td>
            `;

            modalHistoryList.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching history:', error);
        alert('無法查詢歷史紀錄，請稍後再試');
    }
}


function createOrderRow(id, coin, order_type, order_volume, order_price, order_value) {
    const orderData = { id, coin, order_type, order_volume, order_price, order_value };

    // 新增到 allOrders 陣列
    allOrders.push(orderData)

    // 更新顯示
    updateOrderDisplay()
}

function updateOrderRow(id, coin, order_type, order_volume, order_price, order_value) {
    const orderData = allOrders.find(order => order.id === id)

    if (orderData) {
        orderData.coin = coin
        orderData.order_type = order_type
        orderData.order_volume = order_volume
        orderData.order_price = order_price
        orderData.order_value = order_value

        updateOrderDisplay()
    }
}

function removeOrderRow(id) {
    allOrders = allOrders.filter(order => order.id !== id)
    updateOrderDisplay()
}

function updateOrderDisplay() {
    // 更新 orderList 顯示區域 (最多7筆)
    orderList.innerHTML = ''
    const latestOrders = allOrders.slice(-7) // 只取最舊的7筆訂單
    latestOrders.forEach(order => {
        const row = createOrderRowHTML(order)
        orderList.appendChild(row)
    });

    // 更新 modalOrderList 顯示區域 (所有訂單)
    modalOrderList.innerHTML = ''
    allOrders.forEach(order => {
        const row = createOrderRowHTML(order)
        modalOrderList.appendChild(row)
    })
}

function createOrderRowHTML(order) {
    const { id, coin, order_type, order_volume, order_price, order_value } = order

    const row = document.createElement('tr')
    row.setAttribute('data-order-id', id)
    const orderTypeClass = order_type === 'BUY' ? 'text-bright-red fw-bold' : 'text-bright-green fw-bold'

    row.innerHTML = `
        <td>${coin.replace("USDT", "")}</td>
        <td class="${orderTypeClass}">${order_type}</td>
        <td>${order_volume}</td>
        <td>${order_price}</td>
        <td>${order_value}</td>
        <td><button type="button" class="remove-btn btn btn-danger btn-sm w-100">取消</button></td>
    `

    row.querySelector('.remove-btn').addEventListener('click', () => {
        removeOrderRow(id)
        row.remove()
        removeOrder(id)
        orderPairs.delete(id)
    })

    return row
}

function createHistoryRow(id, coin, order_type, trade_volume, trade_price, trade_value, timestamp) {
    const row = document.createElement('tr')
    row.setAttribute('data-history-id', id)

    const orderTypeClass = order_type === 'BUY' ? 'text-bright-red fw-bold' : 'text-bright-green fw-bold';

    row.innerHTML = `
        <td>${new Date(timestamp).toLocaleString()}</td>
        <td>${coin.replace("USDT", "")}</td>
        <td class="${orderTypeClass}">${order_type}</td>
        <td>${trade_volume}</td>
        <td>${trade_price}</td>
        <td>${trade_value}</td>
    `

    historyData.push(row) 

    // 2. 如果歷史紀錄超過五筆，將最舊的移到 modal 中
    if (historyData.length > 5) {
        const oldRow = historyData.pop() // 移除最舊的紀錄 (陣列的最後一個)
        modalHistoryList.insertBefore(oldRow, modalHistoryList.lastChild) // 將移除的紀錄插入到 modal 的最上方
    }

    // 3. 更新主表中的顯示，只顯示最新的五筆
    historyList.innerHTML = '' // 清空現有顯示
    historyData.forEach(history => {
        historyList.appendChild(history) // 將最新的五筆顯示在表格中
    })

    // 4. 若 modal 中的紀錄超過10筆，則移除最舊的紀錄
    while (modalHistoryList.children.length > 10) {
        modalHistoryList.removeChild(modalHistoryList.lastChild) // 移除最舊的紀錄
    }
}

function createPortfolioRow(id, coin, total_volume, average_cost, total_cost, current_value, profit_loss) {
    const row = document.createElement('tr')
    row.setAttribute('data-portfolio-id', id)

    // 根據 profit_loss 的值來設定顏色 (正值顯示綠色，負值顯示紅色)
    const profitLossClass = profit_loss >= 0 ? 'text-bright-green fw-bold' : 'text-bright-red fw-bold'

    row.innerHTML = `
        <td>${coin.replace("USDT", "")}</td>
        <td>${total_volume}</td>
        <td>${average_cost}</td>
        <td>${(current_value/total_volume).toFixed(2)}</td>
        <td>${total_cost}</td>
        <td>${parseFloat(current_value.toFixed(2))}</td>
        <td class="${profitLossClass}">${parseFloat(profit_loss.toFixed(2))}</td>
        <td class="${profitLossClass}">${(profit_loss/total_cost*100).toFixed(2)}%</td>
        <td><button type="button" class="offset-btn btn btn-danger btn-sm w-100">沖銷</button></td>
    `

    row.querySelector('.offset-btn').addEventListener('click', () => {
        offsetPortfolio(coin, total_volume, current_value)
    })

    portfolioList.appendChild(row) 
}

function updatePortfolioRow(id, coin, total_volume, average_cost, total_cost, current_value, profit_loss) {
    const row = document.querySelector(`tr[data-portfolio-id="${id}"]`)

    if (row) {
        const profitLossClass = profit_loss >= 0 ? 'text-bright-green fw-bold' : 'text-bright-red fw-bold'

        row.innerHTML = `
        <td>${coin.replace("USDT", "")}</td>
        <td>${total_volume}</td>
        <td>${average_cost}</td>
        <td>${(current_value/total_volume).toFixed(2)}</td>
        <td>${total_cost}</td>
        <td>${parseFloat(current_value.toFixed(2))}</td>
        <td class="${profitLossClass}">${parseFloat(profit_loss.toFixed(2))}</td>
        <td class="${profitLossClass}">${(profit_loss/total_cost*100).toFixed(2)}%</td>
        <td><button type="button" class="offset-btn btn btn-danger btn-sm w-100">沖銷</button></td>
    `

        row.querySelector('.offset-btn').addEventListener('click', () => {
            offsetPortfolio(coin, total_volume, current_value)
        })
    }
}

function removePortfolioRow(id){
    const row = document.querySelector(`tr[data-portfolio-id="${id}"]`)
    row.remove()
    portfolioPairs.delete(id)
}

function updateAssetRow(cash_balance, holdings_value){

    const cashElement = document.getElementById('cashBalance')
    if (cashElement) {
        cashElement.textContent = ` $${cash_balance.toFixed(2)}`
    }

    const holdingsElement = document.getElementById('holdingsValue')
    if (holdingsElement) {
        holdingsElement.textContent = ` $${holdings_value.toFixed(2)}`
    }

    const profitRateElement = document.getElementById('profitRate')
    if (profitRateElement) {
        const profitRate = ((cash_balance + holdings_value - 10000) / 10000) * 100
        profitRateElement.textContent = `${profitRate >= 0 ? '+' : ''}${profitRate.toFixed(2)}%`
        profitRateElement.className = profitRate >= 0 ? 'text-bright-green' : 'text-bright-red'
    }

    const totalFundsElement = document.getElementById('totalFunds')
    if (totalFundsElement) {
        const totalFunds = cash_balance + holdings_value
        totalFundsElement.textContent = ` $${totalFunds.toFixed(2)}`
    }

    const profitLossElement = document.getElementById('profitLoss')
    if (profitLossElement) {
        const profitLoss = cash_balance + holdings_value - 10000  
        profitLossElement.textContent = `${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)}`
        profitLossElement.className = profitLoss >= 0 ? 'text-bright-green' : 'text-bright-red'
    }
}

async function offsetPortfolio(coin, total_volume, current_value){
    const order_type = 'SELL'
    
    // 發送後端
    const order = {
        cryptoSelect:coin,
        order_type:order_type,
        order_volume:total_volume,
        order_price:current_value/total_volume,
        order_value:current_value,
    }
    try {
        const response = await axios.post('http://localhost:3001/trade/placeOrder',{order},{withCredentials: true})
        if(response.status === 200){
            return alert(response.data)
        }
        if(response.status === 201){
            return alert(`成功下單 沖銷單`)
        }
    }catch(error){
        alert(error.response.data)
        window.location.href = '/memberPage'
    }
}