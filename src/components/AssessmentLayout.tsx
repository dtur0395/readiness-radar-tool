import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import DimensionRatingForm from './DimensionRatingForm';
import PlanningForm from './PlanningForm';
import RadarChart from './RadarChart';
import { useAssessment } from '../context/AssessmentContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Check, Flag, Award, Save, RotateCcw, FileDown } from 'lucide-react';
import { Separator } from './ui/separator';

const AssessmentLayout: React.FC = () => {
  const { 
    assessmentData, 
    setProgramName, 
    saveAssessment, 
    loadAssessment, 
    resetAssessment,
    exportPDF 
  } = useAssessment();
  
  const { dimensions, programName } = assessmentData;
  
  // Group dimensions by stage
  const dimensionsByStage = dimensions.reduce((acc, dimension) => {
    if (!acc[dimension.stage]) {
      acc[dimension.stage] = [];
    }
    acc[dimension.stage].push(dimension);
    return acc;
  }, {} as Record<string, typeof dimensions>);

  const stages = Object.keys(dimensionsByStage);

  const handleProgramNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgramName(e.target.value);
  };

  return (
    <div id="assessment-content" className="container max-w-6xl py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Program-Level Assessment Readiness Radar Tool</h1>
          <p className="text-muted-foreground mt-1">
            Self-assess your program's readiness and plan for implementing program-level assessment
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetAssessment}>
            <RotateCcw className="mr-1 h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" size="sm" onClick={loadAssessment}>
            <Award className="mr-1 h-4 w-4" /> Load
          </Button>
          <Button variant="default" size="sm" onClick={saveAssessment}>
            <Save className="mr-1 h-4 w-4" /> Save
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <FileDown className="mr-1 h-4 w-4" /> Export Complete Report
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="program-name" className="text-base font-medium">Program Name</Label>
              <Input
                id="program-name"
                placeholder="Enter program name"
                value={programName}
                onChange={handleProgramNameChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="assessment-date" className="text-base font-medium">Assessment Date</Label>
              <Input
                id="assessment-date"
                type="date"
                value={assessmentData.assessmentDate}
                readOnly
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview">Overview & Visualisation</TabsTrigger>
          <TabsTrigger value="assessment">Self Assessment</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>How to Use This Tool</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Complete the <strong>Self Assessment</strong> tab by rating your program across the assessment dimensions</li>
                  <li>Use the <strong>Planning</strong> tab to identify strengths and areas for improvement</li>
                  <li>Save your results and revisit over time to track progress</li>
                </ol>
                <Separator />
                <div>
                  <h4 className="font-medium mb-1">Scoring Guidance</h4>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Level 1:</strong> Baseline</li>
                    <li><strong>Level 2:</strong> Intermediate</li>
                    <li><strong>Level 3:</strong> Program-Level Assessment</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <RadarChart dimensions={dimensions} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stages.map(stage => (
              <Card key={stage}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    {stage === 'Readiness' && <Flag className="h-5 w-5 mr-2 text-blue-600" />}
                    {stage === 'Design' && <Check className="h-5 w-5 mr-2 text-green-600" />}
                    {stage === 'Delivery' && <Award className="h-5 w-5 mr-2 text-purple-600" />}
                    {stage === 'Monitoring' && <Check className="h-5 w-5 mr-2 text-orange-600" />}
                    {stage} Stage
                  </CardTitle>
                  <Separator />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {stage === 'Readiness' && 'Foundation elements required before implementing program-level assessment'}
                    {stage === 'Design' && 'Elements for designing effective program-level assessment'}
                    {stage === 'Delivery' && 'Implementation aspects of program-level assessment'}
                    {stage === 'Monitoring' && 'Ongoing review and improvement of assessment practices'}
                  </p>
                  <ul className="space-y-1 text-sm">
                    {dimensionsByStage[stage]?.map(dim => (
                      <li key={dim.id} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${dim.currentRating === 3 ? 'bg-green-500' : dim.currentRating === 2 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                        <span>{dim.name}: <strong>Level {dim.currentRating}</strong></span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="assessment" className="space-y-6">
          {stages.map(stage => (
            <div key={stage} className="space-y-4">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 ${
                  stage === 'Readiness' ? 'bg-blue-100 border border-blue-500' :
                  stage === 'Design' ? 'bg-green-100 border border-green-500' :
                  stage === 'Delivery' ? 'bg-purple-100 border border-purple-500' :
                  'bg-orange-100 border border-orange-500'
                }`}></div>
                {stage} Stage
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {dimensionsByStage[stage].map(dimension => (
                  <DimensionRatingForm key={dimension.id} dimension={dimension} />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="planning">
          <PlanningForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentLayout;
