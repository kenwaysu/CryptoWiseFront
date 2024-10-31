// 登出
document.getElementById('logout').addEventListener('click',async()=>{
    try{
        clearCookie("token")
        alert('登出成功，回到登入頁面')
        window.location.href = '/memberPage'
    }catch(err){
        console.error('Logout failed:', err)
    }
})

function clearCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
