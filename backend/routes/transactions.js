const express = require('express')
const customParseFormat = require("dayjs/plugin/customParseFormat")
const dayjs = require('dayjs')
dayjs.extend(customParseFormat)

const router = express.Router()
const db = require('../database')

const isLoggedInCheck = require('./auth').isLoggedIn

const roles = ['Administrator', 'Moderator']

// GET http://localhost:16108/transactions/all
router.get('/all/:id', isLoggedInCheck, async (req, res) => {
    const account_id = req.params.id
    try {
        const transactions = await db.Transaction.find({ account: account_id })

        return res.status(200).json(transactions)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// GET http://localhost:16108/transactions/*transaction-id*
router.get('/:id', isLoggedInCheck, async (req, res) => {
    const transaction_id = req.params.id
    try {
        const transaction = await db.Transaction.findOne({ _id: transaction_id })

        return res.status(200).json(transaction)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// POST http://localhost:16108/transactions/create
router.post('/create', isLoggedInCheck, async (req, res) => {
    // return res.status(501).send('Get all wallets not implemented')

    const { amount, note, transaction_date, account, category } = req.body;
    const user = req.user._id

    let errors = []

    await validateTransactionObj(req, res, errors)

    if (errors.length > 0) {
        return res.status(400).send(errors)
    }

    try {
        const newTransaction = new db.Transaction({
            amount,
            note,
            transaction_date,
            created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            account,
            category,
            user
        })
        await newTransaction.save()
        return res.status(201).send(newTransaction)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// PUT http://localhost:16108/transactions/edit/*transaction-id*
router.put('/edit/:id', isLoggedInCheck, async (req, res) => {
    // return res.status(501).send('Get all wallets not implemented')
    const transaction_id = req.params.id

    const { amount, note, transaction_date, account, category } = req.body;
    const user = req.user._id

    let errors = []

    await validateTransactionObj(req, res, errors)

    if (errors.length > 0) {
        return res.status(400).send(errors)
    }

    try {
        const updatedTransaction = await db.Transaction.findOneAndUpdate(
            { _id: transaction_id },
            {
                amount,
                note,
                transaction_date,
                account,
                category,
                user
            },
            { new: true }
        )
        return res.status(201).send(updatedTransaction)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// PUT http://localhost:16108/transactions/undelete/*account-id*/*transaction-id*
router.put('/undelete/:a_id/:t_id', isLoggedInCheck, async (req, res) => {
    const account_id = req.params.a_id;
    const transaction_id = req.params.t_id;

    try {

        if (account_id.length != 24)
            errors.push({ type: 'account', message: 'Sąskaita yra būtina' })
        else {
            const account_o = await db.Account.findOne({ _id: account_id })
            if (account_o.length === 0)
                errors.push({ type: 'account', message: 'Sąskaita yra būtina' })
            else {
                const wallet_o = await db.Wallet.findOne({ _id: account_o.wallet, "users.user": req.user._id, "users.role": { $in: roles} })
                if (!wallet_o)
                    return res.status(403).send({ message: "Neturite teisių" })
            }
        }

        const transaction = await db.Transaction.findOneAndUpdate(
            { _id: transaction_id, account: account_id },
            { archived: false },
            { new: true }
        )

        if (transaction === null)
            return res.status(400).send({ message: "Transakcija arba sąskaita nerasta" })

        return res.status(200).json(transaction);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// DELETE http://localhost:16108/transactions/delete/*account-id*/*transaction-id*
router.delete('/delete/:a_id/:t_id', isLoggedInCheck, async (req, res) => {
    const account_id = req.params.a_id;
    const transaction_id = req.params.t_id;

    try {

        if (account_id.length != 24)
            errors.push({ type: 'account', message: 'Sąskaita yra būtina' })
        else {
            const account_o = await db.Account.findOne({ _id: account_id })
            if (account_o.length === 0)
                errors.push({ type: 'account', message: 'Sąskaita yra būtina' })
            else {
                const wallet_o = await db.Wallet.findOne({ _id: account_o.wallet, "users.user": req.user._id, "users.role": { $in: roles} })
                if (!wallet_o)
                    return res.status(403).send({ message: "Neturite teisių" })
            }
        }

        const transaction = await db.Transaction.findOneAndUpdate(
            { _id: transaction_id, account: account_id },
            { archived: true },
            { new: true }
        )

        if (transaction === null)
            return res.status(400).send({ message: "Transakcija arba sąskaita nerasta" })

        return res.status(200).json(transaction);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

const validateTransactionObj = async (req, res, errors) => {
    // amount, note, transaction_date, account, category
    if (req.body.account.length != 24)
        errors.push({ type: 'account', message: 'Sąskaita yra būtina' })
    else {
        const account_o = await db.Account.findOne({ _id: req.body.account })
        if (account_o.length === 0)
            errors.push({ type: 'account', message: 'Sąskaita yra būtina' })
        else {
            const wallet_o = await db.Wallet.findOne({ _id: account_o.wallet, "users.user": req.user._id, "users.role": { $in: roles} })
            if (!wallet_o)
                return res.status(403).send({ message: "Neturite teisių" })
        }
    }

    if (req.body.category.length != 24)
        errors.push({ type: 'account', message: 'Kategorija yra būtina' })
    else {
        const category_o = await db.Category.find({ _id: req.body.category })
        if (category_o.length === 0)
            errors.push({ type: 'category', message: 'Kategorija yra būtina' })
    }

    if (typeof req.body.note !== 'string')
        errors.push({ type: 'note', message: `Pavadinimas turi būti 'string' tipo` })

    if (!req.body.amount || typeof req.body.amount !== 'number')
        errors.push({ type: 'amount', message: 'Suma yra būtina' })

    if (!req.body.transaction_date || !dayjs(req.body.transaction_date, 'YYYY-MM-DD HH:mm:ss', true).isValid())
        errors.push({ type: 'transaction_date', message: 'Data yra būtina' })

}

module.exports = {
    router
}