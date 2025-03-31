import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentService, submissionService, reviewService } from '../services/api';

export default function Assignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isEducator, isStudent } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissionText, setSubmissionText] = useState('');

  useEffect(() => {
    loadAssignmentData();
  }, [id]);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);
      const [assignmentData, reviewsData] = await Promise.all([
        assignmentService.getAssignment(id),
        reviewService.getAssignmentReviews(id)
      ]);
      setAssignment(assignmentData);
      setReviews(reviewsData);

      // If user is a student, load their submission
      if (isStudent) {
        try {
          const submissionData = await submissionService.getSubmission(id);
          setSubmission(submissionData);
          setSubmissionText(submissionData.submission || '');
        } catch (err) {
          // Submission not found, that's okay
        }
      }
    } catch (err) {
      setError('Failed to load assignment data');
      console.error('Error loading assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const submissionData = {
        assignmentId: id,
        userId: user._id,
        submission: submissionText
      };

      if (submission) {
        await submissionService.reviseSubmission(submission._id, submissionData);
      } else {
        await submissionService.submitAssignment(submissionData);
      }

      // Reload data after submission
      loadAssignmentData();
    } catch (err) {
      setError('Failed to submit assignment');
      console.error('Error submitting:', err);
    }
  };

  const handleAddReview = async (reviewText) => {
    try {
      await reviewService.createReview(id, {
        userId: user._id,
        comment: reviewText
      });
      loadAssignmentData();
    } catch (err) {
      setError('Failed to add review');
      console.error('Error adding review:', err);
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{assignment?.title}</h1>
        <p className="text-gray-600">{assignment?.description}</p>
        <div className="mt-4 text-sm text-gray-500">
          Due: {new Date(assignment?.dueDate).toLocaleDateString()}
        </div>
      </div>

      {isStudent && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Submission</h2>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your submission here..."
          />
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {submission ? 'Update Submission' : 'Submit Assignment'}
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Peer Reviews</h2>
        {reviews.map((review) => (
          <div key={review._id} className="border-b py-4 last:border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-800">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-1">
                  By {review.reviewerId.f_name} {review.reviewerId.l_name}
                </p>
              </div>
              <button
                onClick={() => reviewService.upvoteReview(review._id)}
                className="text-gray-500 hover:text-blue-500"
              >
                ↑ {review.upvotes}
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-gray-600">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}