import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentService, workspaceService } from '../services/api';
import ChatWindow from '../components/ChatWindow';
import RichTextEditor from '../components/layout/RichTextEditor';
import Modal from '../components/layout/Modal';

export default function Dashboard() {
  const { user, isEducator, isStudent } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [studentWorkspaces, setStudentWorkspaces] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [educatorLoading, setEducatorLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('workspaces');
  const [students, setStudents] = useState([]);
  const [aiAgentData, setAIAgentData] = useState([]);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    workspaceId: '',
  });
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (user?._id) {
      if (isEducator) loadWorkspaces();
      if (isStudent) loadStudentWorkspaces();
    }
  }, [user]);

  useEffect(() => {
    if (studentWorkspaces.length > 0) {
      loadAssignments();
    }
  }, [studentWorkspaces]);

  const getWorkspaceAssignments = async (workspaceId) => {
    try {
      const assignments = await assignmentService.getWorkSpcaceAssignments(workspaceId);
      return assignments.length;
    } catch (error) {
      console.error(`Error fetching assignments for workspace ${workspaceId}:`, error);
      return 0;
    }
  };

  const loadWorkspaces = async () => {
    try {
      const response = await workspaceService.getWorkspace(user._id);
      const workspacesWithAssignments = await Promise.all(
        (response || []).map(async (workspace) => {
          const assignmentCount = await getWorkspaceAssignments(workspace._id);
          return { ...workspace, assignmentCount };
        })
      );
      setWorkspaces(workspacesWithAssignments);
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setEducatorLoading(false);
    }
  };

  const loadStudentWorkspaces = async () => {
    try {
      const studentResponse = await workspaceService.getStudentWorkspace(user._id);
      setStudentWorkspaces(studentResponse || []);
    } catch (error) {
      console.error('Error loading student workspaces:', error);
    } finally {
      setStudentLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      if (isEducator) {
        // For educators, get assignments from all their workspaces
        const workspaceIds = workspaces.map((workspace) => workspace._id);
        const assignmentsArray = await Promise.all(
          workspaceIds.map((id) => assignmentService.getWorkSpcaceAssignments(id))
        );
        setAssignments(assignmentsArray.flat() || []);
      } else {
        // For students, keep the existing logic
        const workspaceIds = studentWorkspaces.map((workspace) => workspace._id);
        const assignmentsArray = await Promise.all(
          workspaceIds.map((id) => assignmentService.getWorkSpcaceAssignments(id))
        );
        setAssignments(assignmentsArray.flat() || []);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await workspaceService.getStudents(user._id);
      setStudents(response || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadAIAgentData = async () => {
    try {
      const response = await workspaceService.getAIAgentData(user._id);
      setAIAgentData(response || []);
    } catch (error) {
      console.error('Error loading AI agent data:', error);
    }
  };

  const loadAvailableStudents = async (workspaceId) => {
    try {
      // Get all students and filter out those already in the workspace
      const allStudents = await workspaceService.getStudents(user._id);
      const workspace = workspaces.find(w => w._id === workspaceId);
      const existingStudentIds = workspace.students.map(s => s._id);
      const available = allStudents.filter(student => !existingStudentIds.includes(student._id));
      setAvailableStudents(available);
    } catch (error) {
      console.error('Error loading available students:', error);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await workspaceService.addStudentToWorkspace(selectedWorkspace._id, selectedStudent);
      setShowAddStudentModal(false);
      setSelectedStudent('');
      await loadWorkspaces(); // Refresh workspaces to update student count
    } catch (error) {
      console.error('Error adding student to workspace:', error);
    }
  };

  const handleOpenAddStudentModal = async (workspace) => {
    setSelectedWorkspace(workspace);
    await loadAvailableStudents(workspace._id);
    setShowAddStudentModal(true);
  };

  const handleAssignmentChange = (e) => {
    const assignmentId = e.target.value;
    setSelectedAssignment(assignments.find((a) => a._id === assignmentId));
  };

  const handleSectionChange = async (section) => {
    setActiveSection(section);
    if (section === 'workspaces' && isEducator) {
      await loadWorkspaces();
    } else if (section === 'assignments' && isEducator) {
      await loadAssignments();
    } else if (section === 'students' && isEducator) {
      await loadStudents();
    } else if (section === 'ai agent' && isEducator) {
      await loadAIAgentData();
    }
  };

  const handleCreateAssignmentChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkspaceSelect = (e) => {
    setNewAssignment(prev => ({ ...prev, workspaceId: e.target.value }));
  };

  const handleCreateAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignmentService.createAssignment(newAssignment);
      setShowCreateAssignmentModal(false);
      setNewAssignment({ title: '', description: '', dueDate: '', workspaceId: '' });
      await loadAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleCreateWorkspaceChange = (e) => {
    const { name, value } = e.target;
    setNewWorkspace((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateWorkspaceSubmit = async (e) => {
    e.preventDefault();
    try {
      await workspaceService.createWorkspace({
        ...newWorkspace,
        educatorId: user._id
      });
      setShowCreateWorkspaceModal(false);
      setNewWorkspace({ name: '', description: '' });
      await loadWorkspaces();
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  if ((isEducator && educatorLoading) || (isStudent && studentLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isStudent) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100 w-screen h-screen">
        <div className="grid grid-cols-12 gap-4 h-full">
          <div className="col-span-3 bg-gray-100 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Welcome, {user?.f_name} {user?.l_name}</h2>
            <h3 className="text-lg font-semibold mb-2">Your Workspaces</h3>
            {studentWorkspaces.map((workspace) => (
              <div key={workspace._id} className="mb-4">
                <h4 className="text-md font-medium">{workspace.name}</h4>
              </div>
            ))}
            {studentWorkspaces.length === 0 && <p className="text-gray-600">You haven't joined any workspaces yet.</p>}
          </div>

          <div className="col-span-6 bg-white p-4 rounded-lg shadow-md">
            <div className="mb-4">
              <label htmlFor="assignment-select" className="block text-lg font-medium mb-2">Select an Assignment</label>
              <select
                id="assignment-select"
                className="w-full border border-gray-300 rounded-lg p-2"
                onChange={handleAssignmentChange}
                value={selectedAssignment?._id || ''}
              >
                <option value="" disabled>-- Select an Assignment --</option>
                {assignments.map((assignment) => (
                  <option key={assignment._id} value={assignment._id}>{assignment.description}</option>
                ))}
              </select>
            </div>
            {selectedAssignment ? <RichTextEditor assignmentId={selectedAssignment._id} /> : <p className="text-gray-600">Please select an assignment to start working.</p>}
          </div>
          <div className="col-span-3 bg-gray-100 p-4 rounded-lg shadow-md">
            <ChatWindow />
          </div>
        </div>
      </div>
    );
  }

  if (isEducator) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100 w-screen h-screen">
        <div className="grid grid-cols-12 gap-4 h-full">
          <div className="col-span-3 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Educator Panel</h2>
            <p className="text-sm text-gray-600 mb-6">Welcome, {user?.f_name} {user?.l_name}</p>
            <nav className="space-y-4">
              {['workspaces', 'assignments', 'students', 'ai agent'].map((section) => (
                <button
                  key={section}
                  className={`w-full text-left px-4 py-2 rounded-lg border ${
                    activeSection === section
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                  onClick={() => handleSectionChange(section)}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
            <div className="mt-6">
              <button
                className="w-full text-left px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                onClick={() => navigate('/logout')}
              >
                Logout
              </button>
            </div>
          </div>

          <div className="col-span-9 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <p className="text-gray-600">Here you can manage your {activeSection}.</p>

            {activeSection === 'workspaces' && (
              <>
                <button
                  className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={() => setShowCreateWorkspaceModal(true)}
                >
                  Create Workspace
                </button>

                {showCreateWorkspaceModal && (
                  <Modal onClose={() => setShowCreateWorkspaceModal(false)}>
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Create New Workspace</h2>
                      <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Workspace Name</label>
                          <input
                            type="text"
                            name="name"
                            value={newWorkspace.name}
                            onChange={handleCreateWorkspaceChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            name="description"
                            value={newWorkspace.description}
                            onChange={handleCreateWorkspaceChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows="4"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowCreateWorkspaceModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            Create Workspace
                          </button>
                        </div>
                      </form>
                    </div>
                  </Modal>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b">Workspace</th>
                        <th className="px-4 py-2 border-b">Assignments</th>
                        <th className="px-4 py-2 border-b">Students</th>
                        <th className="px-4 py-2 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspaces.map((workspace) => (
                        <tr key={workspace._id}>
                          <td className="px-4 py-2 border-b">{workspace.name}</td>
                          <td className="px-4 py-2 border-b">{workspace.assignmentCount}</td>
                          <td className="px-4 py-2 border-b">{workspace.students.length}</td>
                          <td className="px-4 py-2 border-b space-x-2">
                            {/* <button
                              className="text-blue-500 hover:underline"
                              onClick={() => navigate(`/workspace/${workspace._id}`)}
                            >
                              View
                            </button> */}
                            <button
                              className="text-green-500 hover:underline"
                              onClick={() => handleOpenAddStudentModal(workspace)}
                            >
                              Add Student
                            </button>
                          </td>
                        </tr>
                      ))}
                      {workspaces.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                            No workspaces available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {showAddStudentModal && (
                  <Modal onClose={() => setShowAddStudentModal(false)}>
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Add Student to {selectedWorkspace?.name}</h2>
                      <form onSubmit={handleAddStudent} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Select Student</label>
                          <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select a student</option>
                            {availableStudents.map((student) => (
                              <option key={student._id} value={student._id}>
                                {student.name} ({student.email})
                              </option>
                            ))}
                          </select>
                          {availableStudents.length === 0 && (
                            <p className="mt-2 text-sm text-gray-500">No available students to add.</p>
                          )}
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowAddStudentModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            disabled={availableStudents.length === 0}
                          >
                            Add Student
                          </button>
                        </div>
                      </form>
                    </div>
                  </Modal>
                )}
              </>
            )}

            {activeSection === 'assignments' && (
              <>
                <button
                  className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={() => setShowCreateAssignmentModal(true)}
                >
                  Create Assignment
                </button>

                {showCreateAssignmentModal && (
                  <Modal onClose={() => setShowCreateAssignmentModal(false)}>
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Create New Assignment</h2>
                      <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Title</label>
                          <input
                            type="text"
                            name="title"
                            value={newAssignment.title}
                            onChange={handleCreateAssignmentChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            name="description"
                            value={newAssignment.description}
                            onChange={handleCreateAssignmentChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows="4"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Due Date</label>
                          <input
                            type="datetime-local"
                            name="dueDate"
                            value={newAssignment.dueDate}
                            onChange={handleCreateAssignmentChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Workspace</label>
                          <select
                            name="workspaceId"
                            value={newAssignment.workspaceId}
                            onChange={handleWorkspaceSelect}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select a workspace</option>
                            {workspaces.map((workspace) => (
                              <option key={workspace._id} value={workspace._id}>
                                {workspace.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowCreateAssignmentModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            Create Assignment
                          </button>
                        </div>
                      </form>
                    </div>
                  </Modal>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b">Title</th>
                        <th className="px-4 py-2 border-b">Description</th>
                        <th className="px-4 py-2 border-b">Workspace</th>
                        <th className="px-4 py-2 border-b">Due Date</th>
                        <th className="px-4 py-2 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => (
                        <tr key={assignment._id}>
                          <td className="px-4 py-2 border-b">{assignment.title}</td>
                          <td className="px-4 py-2 border-b">{assignment.description}</td>
                          <td className="px-4 py-2 border-b">
                            {workspaces.find(w => w._id === assignment.workspaceId)?.name || 'Unknown Workspace'}
                          </td>
                          <td className="px-4 py-2 border-b">{new Date(assignment.dueDate).toLocaleDateString()}</td>
                          <td className="px-4 py-2 border-b">
                            <button
                              className="text-blue-500 hover:underline"
                              onClick={() => navigate(`/assignment/${assignment._id}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                      {assignments.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                            No assignments available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeSection === 'students' && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Student Name</th>
                      <th className="px-4 py-2 border-b">Email</th>
                      <th className="px-4 py-2 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td className="px-4 py-2 border-b">{student.name}</td>
                        <td className="px-4 py-2 border-b">{student.email}</td>
                        <td className="px-4 py-2 border-b">
                          <button
                            className="text-blue-500 hover:underline"
                            onClick={() => navigate(`/student/${student._id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                          No students available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeSection === 'ai agent' && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Agent Name</th>
                      <th className="px-4 py-2 border-b">Description</th>
                      <th className="px-4 py-2 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiAgentData.map((agent) => (
                      <tr key={agent._id}>
                        <td className="px-4 py-2 border-b">{agent.name}</td>
                        <td className="px-4 py-2 border-b">{agent.description}</td>
                        <td className="px-4 py-2 border-b">
                          <button
                            className="text-blue-500 hover:underline"
                            onClick={() => navigate(`/ai-agent/${agent._id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {aiAgentData.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                          No AI agents available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}