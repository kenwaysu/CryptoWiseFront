
document.getElementById('coinList').addEventListener('click',async(event)=>{
    event.preventDefault()
    try {
        const response = await axios.get('/coinList')
        window.location.href = '/coinList'
    } catch (error) {
        console.log(error)
        alert(error.response.data)
        window.location.href = '/memberPage'
    }
})

document.getElementById('trade').addEventListener('click',async(event)=>{
    event.preventDefault()
    try {
        const response = await axios.get('/trade')//後端驗證token
        window.location.href = '/trade'
    } catch (error) {
        console.log(error)
        alert(error.response.data)
        window.location.href = '/memberPage'
    }
})