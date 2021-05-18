const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    mysql_user_id: {
        type: Number,
        required: true
    },
    creditCardNumber: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        required: true
    }
});

const Transction = mongoose.model('transactions', TransactionSchema);

module.exports = Transction;