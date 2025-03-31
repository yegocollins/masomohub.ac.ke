const mongoose = require('mongoose');

const Schema = mongoose.Schema;
// const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
    f_name: {
        type: String,
        required: true,
    },
    l_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true

    },
    major: {
        type: [String],
        default: []
    },
    role: {
        type: String,
        ref: 'user_permissions',
        required: true
    },
});

module.exports = mongoose.model('users', UserSchema);
