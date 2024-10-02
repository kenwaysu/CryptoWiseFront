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

const navigationItems = [
    { id: 'coinList', url: '/coinList' },
    { id: 'trade', url: '/trade' },
    { id: 'coinListBtn', url: '/coinList' },
    { id: 'tradeBtn', url: '/trade' },
]

navigationItems.forEach(item => {
    const element = document.getElementById(item.id)
    if (element) {
        element.addEventListener('click', (event) => handleNavigation(event, item.url))
    } else {
        console.warn(`Element with id "${item.id}" not found`)
    }
})
