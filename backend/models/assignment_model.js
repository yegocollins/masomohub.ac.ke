const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    workspaceId:{
        type: String,
        required: true
    },
    dueDate:{
        type: Date
    },
    assignmentResponses:{
        type: [String]
    }
});

module.exports = mongoose.model('assignments', AssignmentSchema);