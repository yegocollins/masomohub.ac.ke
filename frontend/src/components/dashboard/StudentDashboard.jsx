import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assignmentService, workspaceService } from '../../services/api';
import ChatWindow from '../ChatWindow';
import RichTextEditor from '../layout/RichTextEditor';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentWorkspaces, setStudentWorkspaces] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      loadStudentWorkspaces();
    }
  }, [user]);

  useEffect(() => {
    if (studentWorkspaces.length > 0) {
      loadAssignments();
    }
  }, [studentWorkspaces]);

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

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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