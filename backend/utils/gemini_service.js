require('dotenv').config({ path: '../.env' });
// require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai')
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


class geminiService{
    async generate_message(message){
        if(!message){
            console.error("Please provide a prompt");
        }

        try{
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
            const prompt = message;

            const result = await model.generateContent(prompt);

            return (result.response.text());
        } catch(e){
            console.log(`Error ${e}`);
        }

    }
}

const AiService = new geminiService();
module.exports = AiService;
