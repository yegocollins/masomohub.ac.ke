import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import EducatorDashboard from '../components/dashboard/EducatorDashboard';

export default function Dashboard() {
  const { isEducator, isStudent } = useAuth();

  if (isStudent) {
    return <StudentDashboard />;
  }

  if (isEducator) {
    return <EducatorDashboard />;
  }

  return null;
}