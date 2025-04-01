
// Assessment dimension type
export type Dimension = {
  id: string;
  name: string;
  stage: "Readiness" | "Design" | "Delivery" | "Monitoring";
  currentRating: number;
  targetRating: number;
  indicators: {
    level1: string;
    level2: string;
    level3: string;
  };
  evidence?: string;
};

// Additional programmatic assessment checklist item
export type ProgrammaticItem = {
  id: string;
  question: string;
  answer: boolean | null;
  comments: string;
};

// Planning notes
export type PlanningNotes = {
  strengths: string;
  improvements: string;
  champions: string;
  resources: string;
};

// Complete assessment data structure
export type AssessmentData = {
  programName: string;
  assessmentDate: string;
  dimensions: Dimension[];
  programmaticItems: ProgrammaticItem[];
  planningNotes: PlanningNotes;
};
