const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SubmissionSchema = new Schema({
    assignmentId: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    submission: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: null
    },
    reviews: {
        type: [String],
        default: []
    },
    isFlagged: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('submissions', SubmissionSchema);