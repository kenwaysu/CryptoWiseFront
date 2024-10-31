async function handleNavigation(event, targetUrl) {
    event.preventDefault()
    // 從 cookie 中獲取 token
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]
    try {
        console.log(document.cookie)
        const response = await axios.post('http://34.81.200.131:3000/api/token-verify', {}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
        }) // 後端驗證token
        console.log(response)
        window.location.href = targetUrl
    } catch (error) {
        console.log(error)
        if(targetUrl === '/logout'){
            return window.location.href = '/memberPage'
        }
        alert(error.response.data)
        window.location.href = '/memberPage'
    }
}

const navigationItems = [
    { id: 'coinList', url: '/coinList' },
    { id: 'trade', url: '/trade' },
    { id: 'coinListBtn', url: '/coinList' },
    { id: 'tradeBtn', url: '/trade' },
    { id: 'login', url: '/logout' },
]

navigationItems.forEach(item => {
    const element = document.getElementById(item.id)
    if (element) {
        element.addEventListener('click', (event) => handleNavigation(event, item.url))
    } else {
        console.warn(`Element with id "${item.id}" not found`)
    }
})
