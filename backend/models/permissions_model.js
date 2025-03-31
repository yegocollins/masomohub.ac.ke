const mongoose = require('mongoose');

const Schema = mongoose.Schema;
// const ObjectId = Schema.ObjectId;

const PermissionSchema = new Schema({
    _id: {
        type: String,
        lowercase: true,
        required: true,
    },
    permissions: {
        type: [String]
    },
});

module.exports = mongoose.model('user_permissions', PermissionSchema);
