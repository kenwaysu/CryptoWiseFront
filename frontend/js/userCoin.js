// 全局狀態
let addButton
let tradingPairInput
let cryptoList
let ws
let cryptoPairs = new Set() // 用來追蹤表格中的交易對

function init() {
    addButton = document.getElementById('addPair')
    tradingPairInput = document.getElementById('tradingPair')
    cryptoList = document.getElementById('cryptoList')
    ws = new WebSocket('ws://localhost:3001')

    document.addEventListener('DOMContentLoaded', () => {
        addButton.addEventListener('click', addCryptoPair)
    })

    ws.onmessage = handleWebSocketMessage
}

function handleWebSocketMessage(event) {
    const coinListArray = JSON.parse(event.data)
    console.log(coinListArray)
    coinListArray.forEach(coinData => {
        const {coin, price, price_change, change_rate, trading_volume, volume_24hr} = coinData

        if (cryptoPairs.has(coin)) {
            updateRow(coin, price, price_change, change_rate, trading_volume, volume_24hr)
        } else {
            createRow(coin, price, price_change, change_rate, trading_volume, volume_24hr)
            cryptoPairs.add(coin)
        }
    })
}

async function addCryptoPair() {
    const pair = tradingPairInput.value.trim()
    try {
        const response = await axios.post('http://localhost:3001/userCoin', { pair }, {
            withCredentials: true
        })
        alert(response.data)
    } catch (error) {
        alert(error.response.data)
        window.location.href = '/memberPage'
    }
}

function createRow(coin, price, price_change, change_rate, trading_volume, volume_24hr) {
    const row = document.createElement('tr')

    row.innerHTML = `
        <td>${coin}</td>
        <td>${price}</td>
        <td>${price_change}</td>
        <td>${change_rate}%</td>
        <td>${trading_volume}</td>
        <td>${volume_24hr}</td>
        <td><button class="remove-btn btn btn-danger">移除</button></td>
    `

    row.querySelector('.remove-btn').addEventListener('click', () => {
        removeUserCoin(coin)
        row.remove()
        cryptoPairs.delete(coin) // 從追蹤列表中移除交易對
    })

    cryptoList.appendChild(row)
}

function updateRow(coin, price, price_change, change_rate, trading_volume, volume_24hr) {
    const rows = cryptoList.getElementsByTagName('tr')

    for (let row of rows) {
        if (row.cells[0].textContent === coin) {
            row.cells[1].textContent = price
            row.cells[2].textContent = price_change
            row.cells[3].textContent = `${change_rate}%`
            row.cells[4].textContent = trading_volume
            row.cells[5].textContent = volume_24hr
            break
        }
    }
}

async function removeUserCoin(coin){
    try {
        const response = await axios.post('http://localhost:3001/removeUserCoin', { coin }, {
            withCredentials: true
        })
        alert(response.data)
    } catch (error) {
        alert(error.response.data)
        window.location.href = '/memberPage'
    }
}

// 初始化
init()
