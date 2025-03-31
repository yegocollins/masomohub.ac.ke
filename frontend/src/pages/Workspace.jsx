import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workspaceService, assignmentService } from '../services/api';

export default function Workspace() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get workspace ID from the URL
  const { user, isEducator } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadWorkspaceData(id);
      loadAssignments(id);
    }
  }, [id]);

  const loadWorkspaceData = async (workspaceId) => {
    try {
      setLoading(true);
      const workspaceData = await workspaceService.getWorkspaceById(workspaceId);
      setWorkspace(workspaceData);
    } catch (err) {
      setError('Failed to load workspace data');
      console.error('Error loading workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (workspaceId) => {
    try {
      const assignmentsData = await assignmentService.getWorkSpcaceAssignments(workspaceId);
      setAssignments(assignmentsData || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
    }
  };

  const handleCreateAssignment = () => {
    navigate(`/workspace/${workspace?._id}/assignment/create`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{workspace?.name}</h1>
          <p className="text-gray-600 mt-2">{workspace?.description}</p>
        </div>
        {isEducator && (
          <button
            onClick={handleCreateAssignment}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Create Assignment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/assignment/${assignment._id}`)}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {assignment.title}
            </h2>
            <p className="text-gray-600 mb-4">{assignment.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              <span>{assignment.submissionCount} submissions</span>
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {isEducator
              ? "No assignments yet. Create one to get started!"
              : "No assignments available in this workspace."}
          </p>
        </div>
      )}
    </div>
  );
}
