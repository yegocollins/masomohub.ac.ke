const mongoose = require('mongoose');

const moderationSchema = new mongoose.Schema({
    assignmenttId:{
        type: String,
        required :true
    },
    moderation_rules:{
        type: [String],
        default : [
            "AI should not provide direct answers to assignments, only guidance.",
            "Limit AI responses to a maximum of 100 words per response.",
            "AI can provide hints and explanations but must not generate full essays or reports.",
            "AI should cite sources for external references but should not provide full content.",
            "AI should not generate full code solutions; it may only suggest debugging tips"
        ]
    },
    flaggedSubmissions:{
        type:[String]
    }
});

module.exports = mongoose.model('Moderations', moderationSchema);
