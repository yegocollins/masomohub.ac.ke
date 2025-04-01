import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import { assignmentService, workspaceService } from '../services/api';


export default function EducatorDashboard() {
  const { user, isEducator, } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [activeSection, setActiveSection] = useState('workspaces');

  useEffect(() => {
    if (user?._id) {
      if (isEducator) loadWorkspaces();
    }
  }, [user]);


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


  const handleSectionChange = (section) => setActiveSection(section);

    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100 w-screen h-screen">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Sidebar */}
          <div className="col-span-3 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Educator Panel</h2>
            <p className="text-sm text-gray-600 mb-6">Welcome, {user?.f_name} {user?.l_name}</p>
            <nav className="space-y-4">
              {['workspaces', 'assignments', 'students','chat'].map((section) => (
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
