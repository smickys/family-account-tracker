const express = require('express')
const dayjs = require('dayjs')
const mongoose = require('mongoose')

const router = express.Router()
const db = require('../database')

const isLoggedInCheck = require('./auth').isLoggedIn

const roles = ['Administrator', 'Moderator']
const ObjectId = mongoose.Types.ObjectId;

// GET http://localhost:16108/wallets/all
router.get('/all', isLoggedInCheck, async (req, res) => {
    // return res.status(501).send('Get all wallets not implemented')

    try {
        const wallets = await db.Wallet
            .find({ "users.user": req.user._id, archived: false })
            .populate({ 'path': 'users.user', 'select': '_id username email' })
        // .aggregate([
        //     { $match: { "users.user": req.user._id } },
        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: "users.user",
        //             foreignField: "_id",
        //             as: "user"
        //         }
        //     }
        // ])

        // const wallets = await db.Wallet.find({
        //     users: {
        //         $elemMatch: { user: req.user._id, role: 'Administrator' }
        //     }
        // }).populate('users.user')

        return res.status(200).json(wallets)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// GET http://localhost:16108/wallets/*wallet-id*
router.get('/:id', isLoggedInCheck, async (req, res) => {
    // return res.status(501).send('Get all wallets not implemented')

    try {
        const wallet = await db.Wallet
            .findOne({ _id: req.params.id, archived: false })
            .populate({ 'path': 'users.user', 'select': '_id username email' })

        // const wallets = await db.Wallet.find({
        //     users: {
        //         $elemMatch: { user: req.user._id, role: 'Administrator' }
        //     }
        // }).populate('users.user')

        return res.status(200).json(wallet)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// POST http://localhost:16108/wallets/create
router.post('/create', isLoggedInCheck, async (req, res) => {
    // return res.status(501).send('Get all wallets not implemented')

    const { name } = req.body;

    let errors = []
    // let usersDB = []

    if (!name || typeof name !== 'string')
        errors.push({ type: 'name', message: 'Pavadinimas yra būtinas' })

    if (name.length < 3)
        errors.push({ type: 'name', message: 'Pavadinimas turi būti 3 simbolių arba ilgesnis' })

    // if (users.length === 0)
    //     errors.push({ type: 'users', message: 'Vartotojai yra butini' })

    // if (users.length > 0) {
    //     for (const user of users) {
    //         if (!user.username || typeof user.username !== 'string')
    //             errors.push({ type: 'username', message: 'Pavadinimas yra būtinas' })

    //         const userDB = await db.User.findOne({ $or: [{ username: user.username }, { email: user.username }] })

    //         if (!userDB)
    //             errors.push({ type: 'username', message: 'Vartotojas neegzistuoja' })
    //         else
    //             usersDB.push({ user: userDB._id, role: user.role })

    //         if (!roles.includes(user.role))
    //             errors.push({ type: 'role', message: 'Rolė yra būtina' })
    //     }
    // }

    const users = [
        {
            user: req.user._id,
            role: "Administrator"
        }
    ]

    if (errors.length > 0) {
        return res.status(400).send(errors)
    }

    try {
        const newWallet = new db.Wallet({
            name,
            users: users,
            created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })
        await newWallet.save()
        return res.status(201).send(newWallet)
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// POST http://localhost:16108/wallets/add-user/1
router.post('/add-user/:id', isLoggedInCheck, async (req, res) => {
    const wallet_Id = req.params.id;
    const { username, role } = req.body;
    let errors = []

    try {
        const wallet = await db.Wallet.findOne({ _id: wallet_Id, archived: false })
            .populate({ 'path': 'users.user', 'select': '_id username email' })

        if (!wallet) {
            errors.push({ type: 'wallet', message: 'Piniginė nerasta' });
            return res.status(400).send(errors);
        }

        if (!roles.includes(role))
            errors.push({ type: 'role', message: 'Rolė yra būtina' })

        if (role === 'Administrator' && wallet.users.some(user => user.role === 'Administrator'))
            errors.push({ type: 'role', message: 'Piniginė jau turi Administrator' });

        const userDB = await db.User.findOne({ $or: [{ username: username }, { email: username }] })

        if (!userDB)
            errors.push({ type: 'username', message: 'Vartotojas neegzistuoja' })
        else if (wallet.users.some(user => user.user.toString() == userDB._id)) {
            errors.push({ type: 'username', message: 'Vartotojas jau pridėtas' });
        }


        if (errors.length > 0) {
            return res.status(400).send(errors)
        }

        const updatedWallet = await db.Wallet.findOneAndUpdate(
            { _id: req.params.id, archived: false },
            { $push: { users: { user: userDB._id, role: role } } },
            { new: true }
        ).populate({ 'path': 'users.user', 'select': '_id username email' });

        return res.status(200).json(updatedWallet);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// PUT http://localhost:16108/wallets/edit/1
router.put('/edit/:id', isLoggedInCheck, async (req, res) => {
    const wallet_id = req.params.id;
    const data = req.body;
    let errors = []

    try {
        // const wallet = await db.Wallet.findById(wallet_id)
        // if (!wallet)
        //     errors.push({ type: 'wallet', message: 'Piniginė nerasta' });

        // if (errors.length > 0) {
        //     return res.status(400).send(errors)
        // }

        const wallet = await db.Wallet.findOneAndUpdate(
            { _id: wallet_id, archived: false },
            data,
            { new: true }
        ).populate({ 'path': 'users.user', 'select': '_id username email' });

        return res.status(200).json(wallet);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// PUT http://localhost:16108/wallets/remove-user/1
router.put('/remove-user/:id', isLoggedInCheck, async (req, res) => {
    const wallet_id = req.params.id;
    const { user_id } = req.body;
    let errors = []

    try {

        const wallet_o = await db.Wallet.aggregate(
            [
                { $unwind: '$users' },
                {
                    $match: {
                        _id: new ObjectId(wallet_id),
                        "users.user": new ObjectId(user_id)
                        // "users.role": "Administrator"
                    }
                }
            ]
        )

        // console.log(wallet_id, user_id)
        console.log(wallet_o)
        if (wallet_o.length > 0) {
            if (wallet_o[0].users.role === "Administrator")
                    return res.status(403).send({ message: "Negalite ištrinti Administrator" })
        } else {
            return res.status(403).send({ message: "Vartotojas nerastas" })
        }

        const wallet = await db.Wallet.findOneAndUpdate(
            { _id: wallet_id, archived: false },
            { $pull: { users: { user: user_id } } },
            { new: true }
        ).populate({ 'path': 'users.user', 'select': '_id username email' });
        
        return res.status(200).json(wallet);
        // return res.status(200).json(wallet_o);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// PUT http://localhost:16108/wallets/undelete/1
router.put('/undelete/:id', isLoggedInCheck, async (req, res) => {
    const wallet_id = req.params.id;
    let errors = []

    try {
        const wallet = await db.Wallet.findOneAndUpdate(
            { _id: wallet_id, "users.user": req.user._id, "users.role": "Administrator" },
            { archived: false },
            { new: true }
        );

        if (wallet === null)
            return res.status(403).send({ message: "Neturite teisių trinimui" })

        const accounts = await db.Account.updateMany(
            { wallet: wallet_id },
            { archived: false }
        )

        return res.status(200).json({ wallet, accounts });
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

// DELETE http://localhost:16108/wallets/delete/1
// router.delete('/delete/:id', isLoggedInCheck, async (req, res) => {
//     const wallet_id = req.params.id;
//     let errors = []

//     try {
//         const wallet = await db.Wallet.deleteOne(
//             { _id: wallet_id }
//         );

//         await db.Account.deleteMany({ wallet: wallet_id })

//         return res.status(200).json(wallet);
//     } catch (error) {
//         return res.status(500).send(error.message)
//     }
// })

// DELETE http://localhost:16108/wallets/delete/1
router.delete('/delete/:id', isLoggedInCheck, async (req, res) => {
    const wallet_id = req.params.id;
    const user_id = req.user._id

    let errors = []

    try {
        // const wallet = await db.Wallet.findOneAndUpdate(
        //     { _id: wallet_id, "users.user": user_id, "users.role": "Administrator" },
        //     { archived: true },
        //     { new: true }
        // );
        const wallet_o = await db.Wallet.aggregate(
            [
                { $unwind: '$users' },
                {
                    $match: {
                        _id: new ObjectId(wallet_id),
                        "users.user": user_id,
                        "users.role": "Administrator"
                    }
                }
            ]
        )

        // const wallet_o = await db.Wallet.findOne({ _id: wallet_id})
        // (
        //     {},
        //     { $set: { "actions.$[action].participants.$[participant].name": "Person 1" } },
        //     { arrayFilters: [{ "action.participants.referenceId": "641b3414aa7f4269de24efa5" }, { "participant.referenceId": "641b3414aa7f4269de24efa5" }] }
        // )

        if (wallet_o.length == 0)
            return res.status(403).send({ message: "Neturite teisių trinimui" })

        const wallet = await db.Wallet.findOneAndUpdate(
            { _id: wallet_o._id },
            { archived: true },
            { new: true }
        );

        const accounts = await db.Account.updateMany(
            { wallet: wallet_id },
            { archived: true }
        )

        const categories = await db.Category.updateMany(
            { wallet: wallet_id },
            { archived: true }
        )

        return res.status(200).json({ wallet_o });
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

module.exports = {
    router
}