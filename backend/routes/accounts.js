const express = require('express')
const dayjs = require('dayjs')

const router = express.Router()
const db = require('../database')

const isLoggedInCheck = require('./auth').isLoggedIn

const roles = ['Administrator', 'Moderator']

// GET http://localhost:16108/accounts/all/*wallet-id*
router.get('/all/:id', isLoggedInCheck, async (req, res) => {
    // return res.status(501).send('Get all wallets not implemented')
    
    try {
        const wallets = await db.Account
            .find({ wallet: req.params.id, archived: false })
            // .populate({
            //     path: 'wallet',
            //     populate: {
            //         path: 'users.user',
            //         select: '_id username email',
            //         as: 'user'
            //     }
            // })
            // .populate(['wallet', 'wallet.users.user_id'])
            // .populate({ 'path': 'wallet.users.user_id', 'select': '-password' })


        return res.status(200).json(wallets)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// GET http://localhost:16108/accounts/*account-id*
router.get('/:id', isLoggedInCheck, async (req, res) => {
    // return res.status(501).send('Get all wallets not implemented')
    
    try {
        const wallets = await db.Account
            .findOne({ _id: req.params.id })
            .populate({
                path: 'wallet',
                populate: {
                    path: 'users.user',
                    select: '_id username email',
                    as: 'user'
                }
            })
            // .populate(['wallet', 'wallet.users.user_id'])
            // .populate({ 'path': 'wallet.users.user_id', 'select': '-password' })


        return res.status(200).json(wallets)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// POST http://localhost:16108/accounts/create
router.post('/create', isLoggedInCheck, async (req, res) => {
    // return res.status(501).send('Get all wallets not implemented')

    const { wallet, name, start_balance } = req.body;

    let errors = []

    await validateAccountObj(req, res, errors)

    if (errors.length > 0) {
        return res.status(400).send(errors)
    }

    try {
        const newAccount = new db.Account({
            wallet,
            name,
            start_balance,
            balance: 0,
            created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            user: req.user._id
        })
        await newAccount.save()

        return res.status(201).send(newAccount)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// PUT http://localhost:16108/accounts/edit/*account-id*
router.put('/edit/:id', isLoggedInCheck, async (req, res) => {
    const account_id = req.params.id;
    const {wallet, name, start_balance} = req.body;
    let errors = []
    
    await validateAccountObj(req, res, errors)

    if (errors.length > 0) {
        return res.status(400).send(errors)
    }

    try {
        const account = await db.Account.findOneAndUpdate(
            {_id: account_id}, 
            {wallet, name, start_balance}, 
            { new: true }
        );

        return res.status(200).json(account);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// PUT http://localhost:16108/accounts/undelete/*wallet-id*/*account-id*
router.put('/undelete/:w_id/:a_id', isLoggedInCheck, async (req, res) => {
    const wallet_id = req.params.w_id;
    const account_id = req.params.a_id;

    try {
        const wallet = await db.Wallet.findOne({ _id: wallet_id, "users.user": req.user._id})

        if (wallet === null)
            return res.status(403).send({ message: "Neturite teisių" })

        const account = await db.Account.findOneAndUpdate(
            { _id: account_id, wallet: wallet_id },
            { archived: false },
            { new: true}
        )

        if (account === null)
            return res.status(400).send({ message: "Piniginė nerasta" })

        return res.status(200).json(account);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// DELETE http://localhost:16108/accounts/delete/*wallet-id*/*account-id*
router.delete('/delete/:w_id/:a_id', isLoggedInCheck, async (req, res) => {
    const wallet_id = req.params.w_id;
    const account_id = req.params.a_id;

    try {
        const wallet = await db.Wallet.findOne({ _id: wallet_id, "users.user": req.user._id})

        if (wallet === null)
            return res.status(403).send({ message: "Neturite teisių" })

        const account = await db.Account.findOneAndUpdate(
            { _id: account_id, wallet: wallet_id },
            { archived: true },
            { new: true}
        )

        if (account === null)
            return res.status(400).send({ message: "Piniginė arba sąskaita nerasta" })

        return res.status(200).json(account);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

const validateAccountObj = async (req, res, errors) => {

    if(req.body.wallet.length != 24)
        errors.push({ type: 'wallet', message: 'Piniginė yra būtina' })
    else {
        const wallet_o = await db.Wallet.findOne({ _id: req.body.wallet, "users.user": req.user._id, "users.role": { $in: roles} })
        if (!wallet_o)
            return res.status(403).send({ message: "Neturite teisių" })
    }

    if (!req.body.name || typeof req.body.name !== 'string')
        errors.push({ type: 'name', message: 'Pavadinimas yra būtinas' })

    if (req.body.name.length < 3)
        errors.push({ type: 'name', message: 'Pavadinimas turi būti 3 simbolių arba ilgesnis' })

    if (!req.body.start_balance || typeof req.body.start_balance !== 'number') {
        errors.push({ type: 'start_balance', message: 'Pradinė suma yra būtina' })
    }
}

module.exports = {
    router
}