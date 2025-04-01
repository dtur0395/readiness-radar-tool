
import { AssessmentProvider } from '../context/AssessmentContext';
import AssessmentLayout from '../components/AssessmentLayout';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AssessmentProvider>
        <AssessmentLayout />
      </AssessmentProvider>
    </div>
  );
};

export default Index;
