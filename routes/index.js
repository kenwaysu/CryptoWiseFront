import login from './login.js'
import logout from './logout.js'
import homePage from '../controllers/homePage.js'
import express from 'express'

const router = express.Router()

router.get('/', homePage.homePage)

router.get('/memberPage', homePage.memberPage)

router.get('/coinList', homePage.listPage)

router.get('/trade', homePage.tradePage)

router.use('/login', login)

router.use('/logout', logout)

export default router