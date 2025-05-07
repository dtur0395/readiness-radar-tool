
import React from 'react';
import { Dimension } from '../types/assessmentTypes';
import { useAssessment } from '../context/AssessmentContext';
import { Textarea } from './ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Separator } from './ui/separator';

interface DimensionRatingFormProps {
  dimension: Dimension;
}

const DimensionRatingForm: React.FC<DimensionRatingFormProps> = ({ dimension }) => {
  const { setDimensionRating, setDimensionEvidence } = useAssessment();

  const handleRatingChange = (value: string) => {
    setDimensionRating(dimension.id, parseInt(value));
  };

  const handleEvidenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDimensionEvidence(dimension.id, e.target.value);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Readiness':
        return 'bg-blue-100 text-blue-800';
      case 'Design':
        return 'bg-green-100 text-green-800';
      case 'Delivery':
        return 'bg-purple-100 text-purple-800';
      case 'Monitoring':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{dimension.name}</CardTitle>
            {dimension.definition && (
              <CardDescription className="mt-1 text-sm italic">
                {dimension.definition}
              </CardDescription>
            )}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStageColor(dimension.stage)}`}>
            {dimension.stage}
          </span>
        </div>
        <Separator className="my-2" />
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={dimension.currentRating.toString()}
          onValueChange={handleRatingChange}
          className="flex space-x-1 mb-4"
        >
          <div className="flex items-center space-x-2 flex-1 border rounded-md p-2">
            <RadioGroupItem value="1" id={`${dimension.id}-1`} />
            <Label htmlFor={`${dimension.id}-1`} className="flex-1 text-sm">
              <div className="font-medium">Level 1</div>
              <div className="text-xs text-gray-500">{dimension.indicators.level1}</div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 flex-1 border rounded-md p-2">
            <RadioGroupItem value="2" id={`${dimension.id}-2`} />
            <Label htmlFor={`${dimension.id}-2`} className="flex-1 text-sm">
              <div className="font-medium">Level 2</div>
              <div className="text-xs text-gray-500">{dimension.indicators.level2}</div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 flex-1 border rounded-md p-2">
            <RadioGroupItem value="3" id={`${dimension.id}-3`} />
            <Label htmlFor={`${dimension.id}-3`} className="flex-1 text-sm">
              <div className="font-medium">Level 3</div>
              <div className="text-xs text-gray-500">{dimension.indicators.level3}</div>
            </Label>
          </div>
        </RadioGroup>
        
        <div className="mt-2">
          <Label htmlFor={`${dimension.id}-evidence`} className="text-sm font-medium">
            Evidence / Comments
          </Label>
          <Textarea 
            id={`${dimension.id}-evidence`}
            placeholder="Add evidence to support your rating..."
            value={dimension.evidence}
            onChange={handleEvidenceChange}
            className="mt-1"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DimensionRatingForm;
