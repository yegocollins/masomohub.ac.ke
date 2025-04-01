import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.0.105:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized: Token expired or invalid");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleApiError = (error, context) => {
  console.error(`${context} error:`, error.response?.data || error.message);
  throw error;
};

// Auth services
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      handleApiError(error, "Login");
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post("/signup", userData);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      handleApiError(error, "Signup");
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get("/profile");
      return response.data;
    } catch (error) {
      handleApiError(error, "Profile");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};

// Workspace services
export const workspaceService = {
  createWorkspace: async (workspaceData) => {
    try {
      const response = await api.post("/workspaces/", workspaceData);
      return response.data;
    } catch (error) {
      handleApiError(error, "Create Workspace");
    }
  },

  getWorkspaces: async () => {
    try {
      const response = await api.get("/workspaces/");
      return response.data;
    } catch (error) {
      handleApiError(error, "Get Workspaces");
    }
  },

  getWorkspace: async (id) => {
    try {
      const response = await api.get(`/workspaces/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Get Workspace");
    }
  },

  getStudents: async () => {
    try {
      const response = await api.get('/users/students');
      return response.data;
    } catch (error) {
      handleApiError(error, "Get Students");
    }
  },

  getStudentWorkspace: async (id) => {
    try {
      const response = await api.get(`/workspaces/student/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Get Workspace");
    }
  },

  addStudent: async (id, studentId) => {
    try {
      const response = await api.patch(`/workspaces/${id}`, { student: studentId });
      return response.data;
    } catch (error) {
      handleApiError(error, "Add Student");
    }
  },
};

// Assignment services
export const assignmentService = {
  createAssignment: async (assignmentData) => {
    try {
      const response = await api.post("/assignments", assignmentData);
      return response.data;
    } catch (error) {
      handleApiError(error, "Create Assignment");
    }
  },

  getAssignments: async () => {
    try {
      const response = await api.get("/assignments");
      return response.data;
    } catch (error) {
      handleApiError(error, "Get Assignments");
    }
  },

  getWorkSpcaceAssignments: async (workspaceId) => {
    try {
      const response = await api.get(`/assignments/${workspaceId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Get Assignments");
    }
  },
};

// Submission services
export const submissionService = {
  createSubmission: async (submissionData) => {
    try {
      const response = await api.post("/submissions", submissionData);
      return response.data;
    } catch (error) {
      handleApiError(error, "Create Submission");
    }
  },

  getSubmissions: async () => {
    try {
      const response = await api.get("/submissions");
      return response.data;
    } catch (error) {
      handleApiError(error, "Get Submissions");
    }
  },

  getSubmission: async (id) => {
    try {
      const response = await api.get(`/submissions/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Get Submission");
    }
  },

  updateSubmission: async (id, submissionData) => {
    try {
      const response = await api.put(`/submissions/${id}`, submissionData);
      return response.data;
    } catch (error) {
      handleApiError(error, "Update Submission");
    }
  },
};

// Chat services - takes studentId and message
export const chatService = {
  createChat: async (chatData) => {
    try {
      const response = await api.post("/chat", chatData);
      return response.data;
    } catch (error) {
      handleApiError(error, "Create Chat");
    }
  },

  getChats: async () => {
    try {
      const response = await api.get("/chat");
      return response.data;
    } catch (error) {
      handleApiError(error, "Get Chats");
    }
  },
};

// Review services
export const reviewService = {
  createReview: async (reviewData) => {
    try {
      const response = await api.post("/reviews", reviewData);
      return response.data;
    } catch (error) {
      handleApiError(error, "Create Review");
    }
  },

  getReviews: async () => {
    try {
      const response = await api.get("/reviews");
      return response.data;
    } catch (error) {
      handleApiError(error, "Get Reviews");
    }
  },
};

export default api;
