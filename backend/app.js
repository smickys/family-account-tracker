const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')

const app = express()
const port = 16108

dotenv.config()

app.use(cors({ origin: process.env.FRONTEND }))
app.use(express.json())

// const db = require('./database.js')

app.get('/', (req, res) => {
  res.send('Family Account Tracker')
})

app.use('/auth', require('./routes/auth').router)
app.use('/wallets', require('./routes/wallets').router)
app.use('/accounts', require('./routes/accounts').router)
app.use('/transactions', require('./routes/transactions').router)
app.use('/categories', require('./routes/categories').router)

app.listen(port, () => {
  console.log(`Family Account Tracker app listening on port ${port}`)
})