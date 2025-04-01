const space = require('../models/workspace_model');
const users = require('../models/user_model');

const auth = require('../middleware/authenticate');
const checkRole = require('../middleware/authorize');


class Workspace{

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

    static async createWorkspace(req, res){
        try{
            const { name, students, educatorId } = req.body;

            const workspace = new space({
                name,
                students,
                educatorId,
            });

            await workspace.save();
            res.status(201).send(workspace);
        }catch(e){
            res.status(400).send(e);
        }
    }

    static async getWorkspace(req, res){
        try{
            const workspace = await space.find({});
            res.status(200).send(workspace);
        }catch(e){
            res.status(400).send(e, "Error fetching workspaces");
        }
    }

    // gets workspace by educators id
    static async getWorkspaceById(req, res) {
        try {
            const educatorId = req.params.id;

            const workspaces = await space.find({ educatorId });

            if (!workspaces.length) {
            return res.status(404).json({ message: "No workspaces found" });
            }

            res.status(200).json(workspaces);
        } catch (error) {
            console.error("Error fetching workspaces:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }
    
    static async getStudentWorkspace(req, res){
        try{
            const studentId = req.params.id;

            const workspaces = await space.find({students:studentId});
            
            if(!workspaces.length){
                res.status(404).json({message: "No workspaces found"});
            }

            res.status(200).json(workspaces);
        } catch (error){
            console.error("Error fetching workspace");
            res.status(500).json({message: "Internal server error", error: error.message});
        }

    }
 
    static async addStudent(req, res) {
        try {
            const { student } = req.body;
    
            // Find the workspace by ID
            const workspace = await space.findById(req.params.id);
            if (!workspace) {
                return res.status(404).send("Workspace not found");
            }
            

            const checkStudent = new Workspace();
            // Check if the student exists and has the role "student"
            const isStudent = checkStudent.isStudent({student});
            if (!isStudent) {
                return res.status(400).send("User is not found or is not a student");
            }
    
            // Add the student if not already in the workspace
            if (!workspace.students.includes(student)) {
                workspace.students.push(student);
                await workspace.save();
                return res.status(200).json({ message: "Student added successfully", workspace });
            } else {
                return res.status(400).send("Student already exists in the workspace");
            }
        } catch (e) {
            res.status(500).send(`Error adding student to workspace: ${e.message}`);
        }
    }
    
}

module.exports = Workspace;
