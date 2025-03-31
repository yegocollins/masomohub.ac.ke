const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    submissionId: {
        type: String,
        required: true
    },
    reviewerId: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    isFlagged: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model('reviews', ReviewSchema);