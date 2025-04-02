const express = require('express');
const router = express.Router();

const Auth = require('../controllers/Auth');
const Chat = require('../controllers/Chat');
const Workspace = require('../controllers/Workspace');
const Assignment = require('../controllers/Assignment');
const Submission = require('../controllers/Submission');

const auth = require('../middleware/authenticate');
const checkRole = require('../middleware/authorize');

/**
 * AUTH ROUTES
 */
router.post('/signup', Auth.signup);
router.post('/login', Auth.login);
router.get('/profile/', auth, Auth.profile);

router.get('/users/students',auth, Auth.getStudents);

/**
 * WORKSPACE ROUTES
 */
router.post('/workspaces', auth, Workspace.createWorkspace);
router.get('/workspaces/', auth, Workspace.getWorkspace);
router.get('/workspaces/:id', auth, Workspace.getWorkspaceById);
router.get('/workspaces/student/:id', auth, Workspace.getStudentWorkspace);
router.patch('/workspaces/:id', auth, Workspace.addStudent);

/**
 * SUBMISSION ROUTES
 */
router.post('/submissions',auth, Submission.createSubmission);
router.get('/submissions', auth, Submission.getSubmission);
router.get('/submissions/:assignmentId/:studentId', auth, Submission.getSubmissionByAssignmentIdAndStudentId);
router.put('/submissions/:id', auth, Submission.updateSubmission);

/**
 * ASSIGNMENT ROUTES
 */
router.post('/assignments',auth, Assignment.createAssignment);
router.get('/assignments',auth, Assignment.getAssignment);
router.get('/assignments/:workspaceId', auth, Assignment.getAssignmentById);


/**
 * CHAT ROUTES
 */
router.post('/chat', auth,Chat.createChat);
router.get('/chat', auth, Chat.getChats);

/** 
 * AI MODERATION ROUTES
 */
// router.post('/moderation', auth, checkRole('moderate'), .moderation);

/**
 * REVIEW ROUTES
 */
// router.post('/reviews', auth, checkRole('create_review'), home.review);
// router.get('/reviews/:id', auth, checkRole('read'), home.review);
// router.put('/reviews/:id', auth, checkRole('update_review'), home.review);
// router.delete('/reviews/:id', auth, checkRole('delete_review'), home.review);



module.exports = router;



