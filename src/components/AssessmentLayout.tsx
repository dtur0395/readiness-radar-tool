
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import DimensionRatingForm from './DimensionRatingForm';
import ProgrammaticAssessmentForm from './ProgrammaticAssessmentForm';
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
  
  const { dimensions, programmaticItems, programName } = assessmentData;
  
  // Group dimensions by stage
  const dimensionsByStage = dimensions.reduce((acc, dimension) => {
    if (!acc[dimension.stage]) {
      acc[dimension.stage] = [];
    }
    acc[dimension.stage].push(dimension);
    return acc;
  }, {} as Record<string, typeof dimensions>);

  const stages = Object.keys(dimensionsByStage);

  // Calculate programmatic assessment readiness
  const programmaticYesCount = programmaticItems.filter(item => item.answer === true).length;
  const isProgrammaticReady = programmaticYesCount >= 3;

  const handleProgramNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgramName(e.target.value);
  };

  return (
    <div className="container max-w-6xl py-8">
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
            <FileDown className="mr-1 h-4 w-4" /> Export
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
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview & Visualization</TabsTrigger>
          <TabsTrigger value="assessment">Self Assessment</TabsTrigger>
          <TabsTrigger value="programmatic">Programmatic Assessment</TabsTrigger>
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
                  <li>If applicable, complete the <strong>Programmatic Assessment</strong> tab to determine readiness for this approach</li>
                  <li>Use the <strong>Planning</strong> tab to identify strengths and areas for improvement</li>
                  <li>Save your results and revisit over time to track progress</li>
                </ol>
                <Separator />
                <div>
                  <h4 className="font-medium mb-1">Scoring Guidance</h4>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Level 1:</strong> Early Stage — Ad hoc or minimal implementation</li>
                    <li><strong>Level 2:</strong> Emerging Practice — Some progress; work underway</li>
                    <li><strong>Level 3:</strong> Aligned to PLA Minimum — Fully mapped, coordinated, and structured</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <RadarChart dimensions={dimensions} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Flag className="h-5 w-5 mr-2 text-blue-600" />
                  Readiness Stage
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Foundation elements required before implementing program-level assessment
                </p>
                <ul className="space-y-1 text-sm">
                  {dimensionsByStage['Readiness']?.map(dim => (
                    <li key={dim.id} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${dim.currentRating === 3 ? 'bg-green-500' : dim.currentRating === 2 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                      <span>{dim.name}: <strong>Level {dim.currentRating}</strong></span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-600" />
                  Programmatic Assessment
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Readiness for programmatic assessment approach
                </p>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${isProgrammaticReady ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
                  <span className="font-medium text-sm">{programmaticYesCount}/5 criteria met</span>
                </div>
                <p className="text-sm">
                  {isProgrammaticReady 
                    ? "Your program may be ready to pilot programmatic assessment." 
                    : "Continue building foundational elements before implementing programmatic assessment."}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-purple-600" />
                  Overall Readiness
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent>
                {dimensions.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Average rating:</span>
                      <span className="font-bold">
                        {(dimensions.reduce((acc, dim) => acc + dim.currentRating, 0) / dimensions.length).toFixed(1)} / 3.0
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(dimensions.reduce((acc, dim) => acc + dim.currentRating, 0) / (dimensions.length * 3)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="mt-3 text-sm">
                      {dimensions.filter(d => d.currentRating === 3).length} dimensions at Level 3 (Aligned to PLA Minimum)
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
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
        
        <TabsContent value="programmatic">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Programmatic Assessment Readiness</CardTitle>
              <CardDescription>
                Complete this section if your program has accreditation-based progression requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {programmaticItems.map(item => (
                  <ProgrammaticAssessmentForm key={item.id} item={item} />
                ))}
              </div>
              <div className="mt-6 p-4 border rounded-md bg-blue-50">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If most answers are Yes, your program may be ready to pilot programmatic assessment. 
                  Refer to the PAL Implementation Readiness Checklist and consult the Education Portfolio.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="planning">
          <PlanningForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentLayout;
