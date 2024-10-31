// 登入、註冊card顯示交換
document.getElementById('signup-btn').addEventListener('click',(event)=>{
    event.preventDefault()

    document.getElementById('login-card').classList.add('d-none')
    document.getElementById('register-card').classList.remove('d-none')
})

document.getElementById('back-to-login').addEventListener('click',function(event){
    event.preventDefault()

    document.getElementById('register-card').classList.add('d-none')
    document.getElementById('login-card').classList.remove('d-none')
})

// 接收會員註冊
document.getElementById('register').addEventListener('click',async()=>{
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Comfirm passwords do not match!');
        return;
    }
    try {
        const response = await axios.post('http://34.81.200.131:3000/api/register', {
            username,
            password
        })
        // 註冊成功
        const registered = response.data
        alert(registered)
    } catch (error) {
        // 註冊失敗
        const errorMessage = error.response.data.error
        alert(errorMessage)
    }
})

// 登入與驗證
document.getElementById('user-login').addEventListener('click', async ()=>{
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    console.log(username, password)
    try {
        const response = await axios.post('http://34.81.200.131:3000/api/authController',{
            username,
            password
        })
        if(response.data === '用戶名或密碼錯誤'){
            return alert(response.data)
        }
        // 登入成功
        document.cookie = `token=${response.data}; max-age=1000; path=/`
        alert('登入成功')
        // 畫面跳轉
        window.location.href = '/logout'

    } catch (err) {
        // 登入失敗
        const errorMessage = err.response.data
        alert(errorMessage)
    }
})
