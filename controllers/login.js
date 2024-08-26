import jwt from 'jsonwebtoken'
import fs from 'fs'
import { constants } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import axios from 'axios'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const privateKey = fs.readFileSync('./key/login_key/decrypted_private_key.pem', 'utf8')
const publicKey = fs.readFileSync('./key/login_key/public.key', 'utf8')

async function login(req, res) {
    const { username, password } = req.body
    
    try {
        const response = await axios.post('http://localhost:3001/authController',{
            username,
            password
        })

        const token = response.data
        if(response.data === '用戶名或密碼錯誤'){
            return res.status(401).send('用戶名或密碼錯誤')
        }
        // console.log(token)
        res.status(200).send(token)
        
    } catch (err) {
        console.log(`err during login: ${err}`)
        return res.status(500).send(`伺服器錯誤`)
    }
}

export {login}