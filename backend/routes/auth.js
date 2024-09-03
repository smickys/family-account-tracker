const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dayjs = require('dayjs')

const router = express.Router()
const db = require('../database')

// POST http://localhost:16108/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).send({ message: 'Vartotojo vardas, el. paštas ir slaptažodis yra būtini' })
    }

    try {
        const usersInDb = await db.User.find({ $or: [{ username: username }, { email: email }] })
        // console.log(userInDb)

        if (usersInDb.length > 0)
            return res.status(400).send({ message: 'Toks vartotojas jau egzistuoja' })

        const hashedPassword = await bcrypt.hash(password, 8)

        const newUser = new db.User({
            username,
            email,
            password: hashedPassword,
            created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })

        await newUser.save()

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )
        
        return res.status(201).send({
            message: 'Vartotojas užregistruotas',
            token: token,
            // naujaData(dabartinisLaikas + kiekTokenasTrunka)
            expiresIn: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
            user: {
                id: newUser._id,
                username: newUser.username
            }
        })

    } catch (error) {
        return res.status(500).send({ message: 'Nepavyko užregistruoti vartotojo' })
    }

})

// POST http://localhost:16108/auth/login
router.post('/login', async (req, res) => {
    // return res.status(501).send('Login not implemented')
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).send({ message: 'Vartotojo vardas ir slaptažodis yra būtini' })
        
    }
    try {
        const user = await db.User.findOne({ $or: [{ username: username }, { email: username }] })

        if(!user || !await bcrypt.compare(password, user.password))
            return res.status(401).send({ message: 'Neteisingas vartotojo vardas arba slaptažodis' })

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )
        
        return res.status(200).send({
            message: 'Vartotojas prijungtas',
            token: token,
            // naujaData(dabartinisLaikas + kiekTokenasTrunka)
            expiresIn: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
        })

    } catch (error) {
        return res.status(500).send({ message: 'Nepavyko prisijungti' })
    }
})


const isLoggedIn = async (req, res, next) => {
    // console.log('isLoggedIn isvedimas')

    // console.log(req.headers)

    if(!req.headers.authorization) {
        return res.status(401).send( { message: 'Informacija pasiekiama tik prisijungums' } )
    }

    const token = req.headers.authorization.split(' ')[1]
    // console.log('token', token)

    if (!token) {
        return res.status(401).send( { message: 'Informacija pasiekiama tik prisijungums' } )
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // console.log('decoded', decoded)

        const user = await db.User.findById(decoded.id)
        // console.log(user)

        req.user = user
    } catch (error) {
        return res.status(401).send( { message: 'Informacija pasiekiama tik prisijungums' } )
    }

    next() // tesiam darba route
}

module.exports = {
    router,
    isLoggedIn
}