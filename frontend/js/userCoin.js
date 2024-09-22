class CryptoTracker {
    constructor() {
        this.addButton = document.getElementById('addPair')
        this.tradingPairInput = document.getElementById('tradingPair')
        this.cryptoList = document.getElementById('cryptoList')
        this.ws = new WebSocket('ws://localhost:3001')
        this.cryptoPairs = new Set() // 用來追蹤表格中的交易對
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.addButton.addEventListener('click', () => this.addCryptoPair())
        })

        this.ws.onmessage = (event) => {
            const coinListArray = JSON.parse(event.data)
            console.log(coinListArray)
            coinListArray.forEach(coinData => {
                const {coin, price, price_change, change_rate, trading_volume, volume_24hr} = coinData

                // 如果交易對已經存在，更新該行，否則新增一行
                if (this.cryptoPairs.has(coin)) {
                    this.updateRow(coin, price, price_change, change_rate, trading_volume, volume_24hr)
                } else {
                    this.createRow(coin, price, price_change, change_rate, trading_volume, volume_24hr)
                    this.cryptoPairs.add(coin)
                }
            })
        }

        this.createRow() // 預設建構一行
    }

    async addCryptoPair() {
        const pair = this.tradingPairInput.value.trim()
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

    // 新增一行交易對資料
    createRow(coin, price, price_change, change_rate, trading_volume, volume_24hr) {
        const row = document.createElement('tr')

        row.innerHTML = `
            <td>${coin}</td>
            <td>${price}</td>
            <td>${price_change}</td>
            <td>${change_rate}%</td>
            <td>${trading_volume}</td>
            <td>${volume_24hr}</td>
            <td><button class="remove-btn">移除</button></td>
        `

        // 移除行的按鈕功能
        row.querySelector('.remove-btn').addEventListener('click', () => {
            row.remove()
            this.cryptoPairs.delete(coin) // 從追蹤列表中移除交易對
        })

        this.cryptoList.appendChild(row)
    }

    // 更新已有的行的資料
    updateRow(coin, price, price_change, change_rate, trading_volume, volume_24hr) {
        const rows = this.cryptoList.getElementsByTagName('tr')

        // 遍歷找到對應的交易對並更新其資料
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
}

const tracker = new CryptoTracker()
tracker.init()