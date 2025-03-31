// const mainModel = require('../models/moderation_model');
const chatModel = require('../models/chat_model');
const moderationRules = require('../models/moderation_model');
const aiService = require('../utils/gemini_service');

class Chat{
    
    static async createChat(req, res){
        try{

            const { studentId,message } = req.body;
            // Import rules here
            // const rule = "AI should not provide direct answers to assignments, only guidance.";
            const rule = await moderationRules.find({});
            if(!rule){
                rule = [
                    "AI should not provide direct answers to assignments, only guidance.",
                    "Limit AI responses to a maximum of 100 words per response.",
                    "AI can provide hints and explanations but must not generate full essays or reports.",
                    "AI should cite sources for external references but should not provide full content.",
                    "AI should not generate full code solutions; it may only suggest debugging tips"
                ]
            }
            
            const ai_response = await aiService.generate_message(message+rule);
            // console.log(ai_response);
            if (!ai_response){
                return res.status(400).json("Error with AI Service");
            }
            
            const dataToSave = new chatModel({
                studentId,
                message:message,
                chat_response:ai_response
            })

            await dataToSave.save();

            return res.status(200).json(dataToSave);

        } catch(e){
            console.log(e);
            return res.status(500).send("Error Sending Response");
        }
        
    }

    static async getChats(req, res){
        try{
            const chat = await chatModel.find({});
            return res.status(200).send(chat);
        } catch(e){
            return res.status(400).send(`Chat not found ${e}`);
        }
    }
}
module.exports = Chat;
