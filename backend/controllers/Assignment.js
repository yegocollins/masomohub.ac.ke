const user = require('../models/user_model');
const assignment = require('../models/assignment_model');

const auth = require('../middleware/authenticate');
const checkRole = require('../middleware/authorize');

class Assignment{
    
    async isStudent(userId) {
        try {
            const user = await users.findById(userId);
            if (!user) {
                return false;
            }
            if (user.role === "student") {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    //Come back to this. Might be an error

    static async createAssignment(req, res){
        try{
            const { title, description, dueDate, workspaceId } = req.body;

            const new_assignment = new assignment({
                title,
                description,
                dueDate,
                workspaceId
            });

            await new_assignment.save();
            res.status(201).send(new_assignment);
        }catch(e){
            res.status(400).send(e);
        }
    }

    static async getAssignment(req, res){
        try{
            // refactor this all through the file
            const my_assignment = await assignment.find({});
            res.status(200).send(my_assignment);
        }catch(e){
            res.status(400).send(`Error fetching assignment ${e}`);
        }
    }


    static async getAssignmentById(req, res){
        try{
            console.log("PARAMS===", req.params);
            const workspaceId = req.params.workspaceId;

            if(!workspaceId){
                res.status(404).send("No assignment for this workspace");
            }

            const Assignment = await assignment.find({ workspaceId });

            if(!Assignment){
                return res.status(404).send("Assignment not found");
            }
            res.status(200).json(Assignment);
        }catch(e){
            res.status(400).json(`Error fetching assignment ${e}`);
        }
    }

}

module.exports = Assignment;
