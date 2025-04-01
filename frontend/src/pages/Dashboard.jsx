import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentService, workspaceService } from '../services/api';
import ChatWindow from '../components/ChatWindow';
import RichTextEditor from '../components/layout/RichTextEditor';

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

  const loadWorkspaces = async () => {
    try {
      const response = await workspaceService.getWorkspace(user._id);
      setWorkspaces(response || []);
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
      const workspaceIds = studentWorkspaces.map((workspace) => workspace._id);
      const assignmentsArray = await Promise.all(
        workspaceIds.map((id) => assignmentService.getWorkSpcaceAssignments(id))
      );
      setAssignments(assignmentsArray.flat() || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleAssignmentChange = (e) => {
    const assignmentId = e.target.value;
    setSelectedAssignment(assignments.find((a) => a._id === assignmentId));
  };

  const handleSectionChange = (section) => setActiveSection(section);

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
          {/* Sidebar */}
          <div className="col-span-3 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Educator Panel</h2>
            <p className="text-sm text-gray-600 mb-6">Welcome, {user?.f_name} {user?.l_name}</p>
            <nav className="space-y-4">
              {['workspaces', 'assignments', 'students'].map((section) => (
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

          {/* Main Content */}
          <div className="col-span-9 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <p className="text-gray-600">Here you can manage your {activeSection}.</p>
            {/* Add specific content for each section here */}
          </div>
        </div>
      </div>
    );
  }
  return null;
}
