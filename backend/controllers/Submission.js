const submissionModel = require('../models/submission_model');
const userModel = require('../models/user_model');
const assignmentModel = require('../models/assignment_model');

class Submission {
    
    async isStudent(userId) {
        try {
            const user = await userModel.findById(userId);e, "Error updating submission"
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

    static async createSubmission(req, res) {
        try {
            const { assignmentId, studentId, submission } = req.body;

            const newSubmission = new submissionModel({
                assignmentId,
                studentId,
                submission
            });

            await newSubmission.save();
            res.status(201).send(newSubmission);
        } catch (e) {
            res.status(400).send(e);
        }
    }

    static async getSubmission(req, res) {
        try {
            const submission = await submissionModel.find({});
            res.status(200).send(submission);
        } catch (e) {
            res.status(400).send(`Error fetching submissions ${e}`);
        }
    }

    static async getSubmissionById(req, res) {
        try {
            const submission = await submissionModel.findById(req.params.id);
            if (!submission) {
                return res.status(404).send("Submission not found");
            }
            res.status(200).send(submission);
        } catch (e) {
            res.status(400).send(`Error fetching submissions ${e}`);
        }
    }

    static async updateSubmission(req, res) {
        try {
            const { submission } = req.body;
            const { id } = req.params;

            const updatedSubmission = await submissionModel.findByIdAndUpdate(id, { submission }, { new: true });
            if (!updatedSubmission) {
                return res.status(404).send("Submission not found");
            }
            res.status(200).send(updatedSubmission);
        } catch (e) {
            res.status(400).send(`Error fetching submissions ${e}`);
        }
    }
}

module.exports = Submission;