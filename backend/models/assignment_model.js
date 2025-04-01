const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AssignmentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    workspaceId: {
        type: Schema.Types.ObjectId,
        ref: 'workspaces',
        required: true
    },
    educatorId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    maxScore: {
        type: Number,
        default: 100
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'closed'],
        default: 'draft'
    },
    assignmentResponses: [{
        type: Schema.Types.ObjectId,
        ref: 'submissions'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
AssignmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('assignments', AssignmentSchema);
module.exports = mongoose.model('assignments', AssignmentSchema);