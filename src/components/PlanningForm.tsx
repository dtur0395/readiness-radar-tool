
import React from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

const PlanningForm: React.FC = () => {
  const { assessmentData, setPlanningNotes } = useAssessment();
  const { planningNotes } = assessmentData;

  const handleNotesChange = (field: keyof typeof planningNotes) => (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPlanningNotes(field, e.target.value);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Planning & Next Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="strengths" className="font-medium">
            What are the key strengths of your current assessment system?
          </Label>
          <Textarea
            id="strengths"
            placeholder="Enter key strengths..."
            value={planningNotes.strengths}
            onChange={handleNotesChange('strengths')}
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="improvements" className="font-medium">
            What are your priority areas for improvement over the next 12 months?
          </Label>
          <Textarea
            id="improvements"
            placeholder="Enter priority improvements..."
            value={planningNotes.improvements}
            onChange={handleNotesChange('improvements')}
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="champions" className="font-medium">
            Who are the champions or support roles that can lead this work?
          </Label>
          <Textarea
            id="champions"
            placeholder="List champions and support roles..."
            value={planningNotes.champions}
            onChange={handleNotesChange('champions')}
            className="mt-1"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="resources" className="font-medium">
            What resources or guidance do you need to move forward?
          </Label>
          <Textarea
            id="resources"
            placeholder="List required resources and guidance..."
            value={planningNotes.resources}
            onChange={handleNotesChange('resources')}
            className="mt-1"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanningForm;
