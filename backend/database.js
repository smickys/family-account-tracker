const mongoose = require('mongoose')

if (!process.env.MONGO) {
    throw new Error('MONGO environment variable is not set')
}

mongoose.connect(process.env.MONGO)

const db = mongoose.connection

db.on('error', () => console.log('Failed to connect to MongoDB'))
db.once('open', () => console.log('Connected to MongoDB'))

// USERS db schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: String }
})

const User = mongoose.model('User', userSchema)

// WALLET schema
const WalletSchema = new mongoose.Schema({
    name: { type: String, required: true },
    created_at: { type: String },
    archived: { type: Boolean, default: false },
    users: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            role: { type: String, enum: ['Administrator', 'Moderator'], required: true }
        }
    ]
});

const Wallet = mongoose.model('Wallet', WalletSchema)

// ACCOUNT schema
const AccountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    start_balance: { type: Number },
    balance: { type: Number, required: true },
    created_at: { type: String },
    archived: { type: Boolean, default: false },
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Account = mongoose.model('Account', AccountSchema)

// TRANSACTION schema
const TransactionSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    note: { type: String },
    transaction_date: { type: String },
    created_at: { type: String },
    archived: { type: Boolean, default: false },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

// CATEGORY schema
const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    created_at: { type: String },
    archived: { type: Boolean, default: false },
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
});

const Category = mongoose.model('Category', CategorySchema);

// SUBCATEGORY schema
// const SubcategorySchema = new mongoose.Schema({
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
//     name: { type: String, required: true },
//     description: { type: String },
//     created_at: { type: String }
// });

// const Subcategory = mongoose.model('Subcategory', SubcategorySchema);

module.exports = {
    db,
    mongoose,
    User,
    Wallet,
    Account,
    Transaction,
    Category
}