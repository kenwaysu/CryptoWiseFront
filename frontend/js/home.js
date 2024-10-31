// 整理接收的數據
const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1] || ''
// 從 cookie 中獲取 token
document.getElementById('MAsearch').addEventListener('click',()=>{
    const tick = document.querySelector('#tick').value
    const ma1 = document.querySelector('#ma1').value
    const compare = document.querySelector('#compare').value
    const ma2 = document.querySelector('#ma2').value
    const data = {
        tick: tick,
        ma1: ma1,
        compare: compare,
        ma2: ma2,
    }
    if(isNaN(Number(ma1)) || isNaN(Number(ma2))){
        alert('MA僅可輸入整數')
    }
    if(ma1 > 500 || ma2 > 500 || ma1 < 0 || ma2 < 0){
        alert('MA值僅支援1~500')
    }
    
    axios.post('http://34.81.200.131:3000/api/search', data)
    .then(response=>{
        console.log(response)
        const tradingPairs = response.data.message
        const table = document.querySelector('.custom-table')
        const row = document.querySelectorAll('.custom-row')
        row.forEach(row => {
            table.removeChild(row)
        })
        tradingPairs.forEach((pair, index) => {
            const row = document.createElement('div');
            row.className = 'custom-row';

            const trackCell = document.createElement('div');
            trackCell.className = 'custom-cell';
            const button = document.createElement('button');
            button.className = 'btn btn-outline-primary';
            button.textContent = '+';
            button.id = `${pair}`
            button.addEventListener('click', addCoin)
            trackCell.appendChild(button);

            const pairCell = document.createElement('div');
            pairCell.className = 'custom-cell';
            pairCell.textContent = pair;

            const rankCell = document.createElement('div');
            rankCell.className = 'custom-cell';
            rankCell.textContent = index + 1;

            row.appendChild(trackCell);
            row.appendChild(pairCell);
            row.appendChild(rankCell);

            table.appendChild(row)
        })
    
    })
    .catch(error=>{console.log(error)})
})


document.getElementById('login').addEventListener('click',()=>{
    axios.get('/login')
})

async function addCoin(event){
    const pair = event.currentTarget.id
    try {
        console.log('addclick')
        const response = await axios.post('http://34.81.200.131:3000/api/userCoin', { pair },
        {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        alert(response.data)
    } catch (error) {
        alert(error.response.data)
        window.location.href = '/memberPage'
    }
    console.log(`Button ${buttonId} was clicked!`,typeof buttonId)
}