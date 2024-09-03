const express = require('express')
const dayjs = require('dayjs')

const router = express.Router()
const db = require('../database')

const isLoggedInCheck = require('./auth').isLoggedIn

const roles = ['Administrator', 'Moderator']

// GET http://localhost:16108/categories/all/*wallet-id*
router.get('/all/:id', isLoggedInCheck, async (req, res) => {
    // return res.status(501).send('Get all wallets not implemented')
    const wallet_id = req.params.id
    try {
        const categories = await db.Category.find({ wallet: wallet_id })

        return res.status(200).json(categories)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// GET http://localhost:16108/categories/*category-id*
router.get('/:id', isLoggedInCheck, async (req, res) => {
    // return res.status(501).send('Get all wallets not implemented')
    const category_id = req.params.id
    try {
        const category = await db.Category.findOne({ _id: category_id })

        return res.status(200).json(category)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// POST http://localhost:16108/categories/create
router.post('/create', isLoggedInCheck, async (req, res) => {
    const { name, description, wallet } = req.body
    const user = req.user._id

    let errors = []

    await validateCategoryObj(req, res, errors)

    if (errors.length > 0) {
        return res.status(400).send(errors)
    }

    try {
        const newCategory = new db.Category({
            name,
            description,
            wallet,
            user,
            created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })

        await newCategory.save()
        return res.status(201).send(newCategory)

    } catch (error) {
        return res.status(500).send(error.message)
    }


})

// PUT http://localhost:16108/categories/edit/*category-id*
router.put('/edit/:id', isLoggedInCheck, async (req, res) => {
    const category_id = req.params.id;
    const { wallet, name, description } = req.body;
    let errors = []

    await validateCategoryObj(req, res, errors)

    if (errors.length > 0) {
        return res.status(400).send(errors)
    }

    try {
        const updatedCategory = await db.Category.findOneAndUpdate(
            { _id: category_id },
            { wallet, name, description },
            { new: true }
        );

        return res.status(200).json(updatedCategory);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// PUT http://localhost:16108/categories/undelete/*wallet-id*/*category-id*
router.put('/undelete/:w_id/:c_id', isLoggedInCheck, async (req, res) => {
    const wallet_id = req.params.w_id;
    const category_id = req.params.c_id;

    try {
        const wallet = await db.Wallet.findOne({ _id: wallet_id, "users.user": req.user._id})

        if (wallet === null)
            return res.status(403).send({ message: "Neturite teisių" })

        const category = await db.Category.findOneAndUpdate(
            { _id: category_id, wallet: wallet_id },
            { archived: false },
            { new: true}
        )

        if (category === null)
            return res.status(400).send({ message: "Piniginė arba kategorija nerasta" })

        return res.status(200).json(category);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// DELETE http://localhost:16108/categories/delete/*wallet-id*/*category-id*
router.delete('/delete/:w_id/:c_id', isLoggedInCheck, async (req, res) => {
    const wallet_id = req.params.w_id;
    const category_id = req.params.c_id;

    try {
        const wallet = await db.Wallet.findOne({ _id: wallet_id, "users.user": req.user._id})

        if (wallet === null)
            return res.status(403).send({ message: "Neturite teisių" })

        const category = await db.Category.findOneAndUpdate(
            { _id: category_id, wallet: wallet_id },
            { archived: true },
            { new: true}
        )

        if (category === null)
            return res.status(400).send({ message: "Piniginė arba kategorija nerasta" })

        return res.status(200).json(category);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

const validateCategoryObj = async (req, res, errors) => {

    if (req.body.wallet.length != 24)
        errors.push({ type: 'wallet', message: 'Piniginė yra būtina' })
    else {
        const wallet_o = await db.Wallet.findOne({ _id: req.body.wallet, "users.user": req.user._id, "users.role": { $in: roles } })
        if (!wallet_o)
            return res.status(403).send({ message: "Neturite teisių" })
    }

    if (!req.body.name || typeof req.body.name !== 'string')
        errors.push({ type: 'name', message: 'Pavadinimas yra būtinas' })

    if (req.body.name.length < 3)
        errors.push({ type: 'name', message: 'Pavadinimas turi būti 3 simbolių arba ilgesnis' })

    if (!req.body.description || typeof req.body.description !== 'string')
        errors.push({ type: 'description', message: 'Aprašymas yra būtinas' })

    if (req.body.description.length < 3)
        errors.push({ type: 'description', message: 'Aprašymas turi būti 3 simbolių arba ilgesnis' })

}

module.exports = {
    router
}