const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const WorkspaceSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    educatorId: {
        type: String,
        required: true
    },
    students: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model('workspaces', WorkspaceSchema);
