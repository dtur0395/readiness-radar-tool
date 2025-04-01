
import React from 'react';
import { ProgrammaticItem } from '../types/assessmentTypes';
import { useAssessment } from '../context/AssessmentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

interface ProgrammaticAssessmentFormProps {
  item: ProgrammaticItem;
}

const ProgrammaticAssessmentForm: React.FC<ProgrammaticAssessmentFormProps> = ({ item }) => {
  const { setProgrammaticAnswer, setProgrammaticComments } = useAssessment();

  const handleAnswerChange = (value: string) => {
    setProgrammaticAnswer(item.id, value === 'yes');
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProgrammaticComments(item.id, e.target.value);
  };

  return (
    <div className="flex items-center space-x-2 border rounded-md p-3 mb-2">
      <div className="flex-grow">
        <p className="text-sm font-medium">{item.question}</p>
        
        <div className="mt-2 flex space-x-4">
          <RadioGroup 
            defaultValue={item.answer === true ? 'yes' : item.answer === false ? 'no' : ''}
            onValueChange={handleAnswerChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="yes" id={`${item.id}-yes`} />
              <Label htmlFor={`${item.id}-yes`}>Yes</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="no" id={`${item.id}-no`} />
              <Label htmlFor={`${item.id}-no`}>No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="flex-grow">
        <Textarea 
          placeholder="Comments..."
          value={item.comments}
          onChange={handleCommentsChange}
          className="mt-1 h-16"
        />
      </div>
    </div>
  );
};

export default ProgrammaticAssessmentForm;
