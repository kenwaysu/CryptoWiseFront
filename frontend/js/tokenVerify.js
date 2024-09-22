async function handleNavigation(event, targetUrl) {
    event.preventDefault()
    try {
        const response = await axios.post('http://localhost:3001/token-verify', {}, {
            withCredentials: true
        }) // 後端驗證token
        window.location.href = targetUrl
    } catch (error) {
        console.log(error)
        alert(error.response.data)
        window.location.href = '/memberPage'
    }
}

document.getElementById('coinList').addEventListener('click', (event) => {
    handleNavigation(event, '/coinList')
})

document.getElementById('trade').addEventListener('click', (event) => {
    handleNavigation(event, '/trade')
})

document.getElementById('coinListBtn').addEventListener('click', (event) => {
    handleNavigation(event, '/trade')
})

document.getElementById('tradeBtn').addEventListener('click', (event) => {
    handleNavigation(event, '/trade')
})