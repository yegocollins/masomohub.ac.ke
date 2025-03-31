import { useState } from 'react';
import {
  HtmlEditor,
  Image,
  Inject,
  Link,
  QuickToolbar,
  RichTextEditorComponent,
  Toolbar,
} from '@syncfusion/ej2-react-richtexteditor';
import '../../App.css';
import Button from '../ui/Button';
import { submissionService } from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // Import to get the current user

export default function RichTextEditor({ assignmentId }) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false); // Track submission state
  const { user } = useAuth(); // Get the current user (student)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent multiple submissions
    setSubmitting(true); // Set submitting state to true

    try {
      const submissionData = {
        assignmentId, // ID of the assignment
        studentId: user._id, // ID of the current student
        submission: value, // The content of the editor
      };
      const response = await submissionService.createSubmission(submissionData);
      alert('Submission successful!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit the assignment. Please try again.');
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div className="col-span-9 bg-gray-100 p-4 rounded-lg shadow-md h-full">
      <RichTextEditorComponent
        height={600}
        change={(e) => setValue(e.value)} // Update the state when the content changes
      >
        <Inject services={[Toolbar, Image, Link, HtmlEditor, QuickToolbar]} />
      </RichTextEditorComponent>
      <div className="mt-4">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}