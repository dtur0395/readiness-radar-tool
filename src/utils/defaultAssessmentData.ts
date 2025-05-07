
import { AssessmentData } from "../types/assessmentTypes";

export const defaultAssessmentData: AssessmentData = {
  programName: "",
  assessmentDate: new Date().toISOString().split("T")[0],
  dimensions: [
    {
      id: "leadership",
      name: "Leadership & Governance",
      stage: "Readiness",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Role is informal or unclear",
        level2: "Some responsibilities recognised",
        level3: "Role formalised in governance; leads program-wide design and review"
      },
      evidence: ""
    },
    {
      id: "responsibility",
      name: "Assessment Responsibility",
      stage: "Readiness",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Managed at course level",
        level2: "Emerging coordination across courses",
        level3: "Shared responsibility across the program, supported by governance"
      },
      evidence: ""
    },
    {
      id: "literacy",
      name: "Assessment Literacy of Staff",
      stage: "Readiness",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Little assessment Professional Development in place",
        level2: "Some Professional development in assessment offered; variable uptake",
        level3: "Assessment literacy embedded in staff development and roles"
      },
      evidence: ""
    },
    {
      id: "outcomes",
      name: "Learning Outcomes",
      stage: "Design",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Defined only at course level",
        level2: "SLOs/PLOs exist but loosely integrated",
        level3: "Learning outcomes mapped and embedded in assessment"
      },
      evidence: ""
    },
    {
      id: "curriculum",
      name: "Curriculum Mapping",
      stage: "Design",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "No formal mapping",
        level2: "Partial or outdated mapping",
        level3: "Current map informs sequencing and assessment design"
      },
      evidence: ""
    },
    {
      id: "mapping",
      name: "Assessment Mapping",
      stage: "Design",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "No vertical alignment",
        level2: "Partial alignment across levels",
        level3: "Scaffolded assessment across program lifecycle"
      },
      evidence: ""
    },
    {
      id: "progression",
      name: "Progression Decisions",
      stage: "Delivery",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Based solely on grade accumulation",
        level2: "Some discussion of readiness",
        level3: "Program/specialisation-level assessment markers (e.g. capstones); progression based on demonstrated competence"
      },
      evidence: ""
    },
    {
      id: "mix",
      name: "Assessment Mix",
      stage: "Delivery",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Siloed, summative-only tasks",
        level2: "Some coordination to reduce duplication",
        level3: "Program-level mix supports learning outcomes"
      },
      evidence: ""
    },
    {
      id: "rubric",
      name: "Rubric Use",
      stage: "Delivery",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Inconsistent or absent",
        level2: "Some shared rubrics",
        level3: "Consistent and aligned with outcomes"
      },
      evidence: ""
    },
    {
      id: "ai",
      name: "Impact of AI on Assessment",
      stage: "Delivery",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Not considered",
        level2: "Informal discussion only",
        level3: "Design incorporates AI resilience where relevant"
      },
      evidence: ""
    },
    {
      id: "governance",
      name: "Assessment Governance",
      stage: "Delivery",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "No formal assessment guidelines; practices vary between courses",
        level2: "Some assessment guidelines exist but are inconsistently applied; limited visibility",
        level3: "Assessment guidelines are clearly defined and support consistent application across the program in line with university policy"
      },
      evidence: ""
    },
    {
      id: "feedback",
      name: "Feedback Practices",
      stage: "Monitoring",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Unstructured and inconsistent",
        level2: "Partly coordinated feedback",
        level3: "Structured feedback embedded in all assessment tasks; some use of feeding forward practices"
      },
      evidence: ""
    },
    {
      id: "visibility",
      name: "Student Achievement Visibility",
      stage: "Monitoring",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Students are unaware of progress; no program-level visibility",
        level2: "Some tracking across courses or tools used, but not integrated or visible to students",
        level3: "Progress toward SLOs/PLOs is monitored using program-level dashboards; partial visibility to students"
      },
      evidence: ""
    },
    {
      id: "integrity",
      name: "Assessment Integrity & Security",
      stage: "Monitoring",
      currentRating: 1,
      targetRating: 3,
      indicators: {
        level1: "Practices vary across courses",
        level2: "Shared approaches emerging",
        level3: "Program-level strategies in place"
      },
      evidence: ""
    },
  ],
  programmaticItems: [
    {
      id: "milestones",
      question: "Are milestone progression points defined (e.g. prior to practicum, final project)?",
      answer: null,
      comments: ""
    },
    {
      id: "competencies",
      question: "Are competencies or capability domains mapped across the curriculum?",
      answer: null,
      comments: ""
    },
    {
      id: "portfolio",
      question: "Is a portfolio or dashboard used to collect and curate student evidence?",
      answer: null,
      comments: ""
    },
    {
      id: "panel",
      question: "Is there a progression panel or review committee in place?",
      answer: null,
      comments: ""
    },
    {
      id: "reflection",
      question: "Are students supported to reflect on feedback and demonstrate readiness?",
      answer: null,
      comments: ""
    }
  ],
  planningNotes: {
    strengths: "",
    improvements: "",
    champions: "",
    resources: ""
  }
};
