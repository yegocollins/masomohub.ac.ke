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
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('workspaces'); // For educator sidebar navigation

  useEffect(() => {
    if (isStudent) {
      loadWorkspaces();
      loadStudentWorkspaces();
    }
  }, []);

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
      setLoading(false);
    }
  };

  const loadStudentWorkspaces = async () => {
    try {
      const studentResponse = await workspaceService.getStudentWorkspace(user._id);
      setStudentWorkspaces(studentResponse || []);
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const workspaceIds = studentWorkspaces.map((studentWorkspace) => studentWorkspace._id);

      const assignmentsArray = await Promise.all(
        workspaceIds.map((id) => assignmentService.getWorkSpcaceAssignments(id))
      );

      const allAssignments = assignmentsArray.flat();
      setAssignments(allAssignments || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleAssignmentChange = (e) => {
    const assignmentId = e.target.value;
    const assignment = assignments.find((a) => a._id === assignmentId);
    setSelectedAssignment(assignment);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  if (loading) {
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
          {/* Left Panel: Student Profile and Workspaces */}
          <div className="col-span-3 bg-gray-100 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Welcome, {user?.f_name} {user?.l_name}</h2>
            <h3 className="text-lg font-semibold mb-2">Your Workspaces</h3>
            {studentWorkspaces.map((workspace) => (
              <div key={workspace._id} className="mb-4">
                <h4 className="text-md font-medium">{workspace.name}</h4>
              </div>
            ))}
            {studentWorkspaces.length === 0 && (
              <p className="text-gray-600">You haven't joined any workspaces yet.</p>
            )}
          </div>

          {/* Center Panel: Assignments Dropdown and RichTextEditor */}
          <div className="col-span-6 bg-white p-4 rounded-lg shadow-md">
            <div className="mb-4">
              <label htmlFor="assignment-select" className="block text-lg font-medium mb-2">
                Select an Assignment
              </label>
              <select
                id="assignment-select"
                className="w-full border border-gray-300 rounded-lg p-2"
                onChange={handleAssignmentChange}
                value={selectedAssignment?._id || ''}
              >
                <option value="" disabled>
                  -- Select an Assignment --
                </option>
                {assignments.map((assignment) => (
                  <option key={assignment._id} value={assignment._id}>
                    {assignment.description}
                  </option>
                ))}
              </select>
            </div>
            {selectedAssignment ? (
              <RichTextEditor assignmentId={selectedAssignment._id} />
            ) : (
              <p className="text-gray-600">Please select an assignment to start working.</p>
            )}
          </div>

          {/* Right Panel: Chat Interface */}
          <div className="col-span-3 bg-gray-100 p-4 rounded-lg shadow-md">
            <ChatWindow />
          </div>
        </div>
      </div>
    );
  }

  if (isEducator) {
    return (
      <div className="flex h-screen">
        {/* Sidebar Panel */}
        <div className="w-1/4 bg-gray-800 text-white flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold">Educator Panel</h2>
            <p className="text-sm text-gray-400">Welcome, {user?.f_name} {user?.l_name}</p>
          </div>
          <nav className="flex-1 p-4 space-y-4">
            <button
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeSection === 'workspaces' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => handleSectionChange('workspaces')}
            >
              Workspaces
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeSection === 'assignments' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => handleSectionChange('assignments')}
            >
              Assignments
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeSection === 'students' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => handleSectionChange('students')}
            >
              Students
            </button>
          </nav>
          <div className="p-4 border-t border-gray-700">
            <button
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700"
              onClick={() => navigate('/logout')}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          {activeSection === 'workspaces' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Workspaces</h2>
              <p>Here you can manage your workspaces.</p>
              {/* Add workspace management UI here */}
            </div>
          )}
          {activeSection === 'assignments' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Assignments</h2>
              <p>Here you can manage your assignments.</p>
              {/* Add assignment management UI here */}
            </div>
          )}
          {activeSection === 'students' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Students</h2>
              <p>Here you can view and manage your students.</p>
              {/* Add student management UI here */}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}