import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AssessmentData, Dimension, ProgrammaticItem, PlanningNotes } from '../types/assessmentTypes';
import { defaultAssessmentData } from '../utils/defaultAssessmentData';
import { toast } from '../components/ui/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf'; // Correct import
import html2canvas from 'html2canvas'; // Correct import

interface AssessmentContextType {
  assessmentData: AssessmentData;
  setDimensionRating: (id: string, rating: number) => void;
  setDimensionEvidence: (id: string, evidence: string) => void;
  setProgrammaticAnswer: (id: string, answer: boolean | null) => void; // Allow null
  setProgrammaticComments: (id: string, comments: string) => void;
  setPlanningNotes: (field: keyof PlanningNotes, value: string) => void;
  setProgramName: (name: string) => void;
  resetAssessment: () => void;
  saveAssessment: () => void;
  loadAssessment: () => void;
  exportPDF: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

// Helper function to trigger file download
const triggerDownload = (data: BlobPart, filename: string) => {
  const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const AssessmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(defaultAssessmentData);

  const setDimensionRating = useCallback((id: string, rating: number) => {
    setAssessmentData(prevData => ({
      ...prevData,
      dimensions: prevData.dimensions.map(dim =>
        dim.id === id ? { ...dim, currentRating: rating } : dim
      ),
    }));
  }, []);

  const setDimensionEvidence = useCallback((id: string, evidence: string) => {
    setAssessmentData(prevData => ({
      ...prevData,
      dimensions: prevData.dimensions.map(dim =>
        dim.id === id ? { ...dim, evidence: evidence } : dim // Ensure evidence is updated
      ),
    }));
  }, []);

  const setProgrammaticAnswer = useCallback((id: string, answer: boolean | null) => {
    setAssessmentData(prevData => ({
      ...prevData,
      programmaticItems: prevData.programmaticItems.map(item =>
        item.id === id ? { ...item, answer } : item
      ),
    }));
  }, []);

  const setProgrammaticComments = useCallback((id: string, comments: string) => {
    setAssessmentData(prevData => ({
      ...prevData,
      programmaticItems: prevData.programmaticItems.map(item =>
        item.id === id ? { ...item, comments } : item
      ),
    }));
  }, []);

  const setPlanningNotes = useCallback((field: keyof PlanningNotes, value: string) => {
    setAssessmentData(prevData => ({
      ...prevData,
      planningNotes: {
        ...prevData.planningNotes,
        [field]: value
      }
    }));
  }, []);

  const setProgramName = useCallback((name: string) => {
    setAssessmentData(prevData => ({
      ...prevData,
      programName: name
    }));
  }, []);

  const resetAssessment = useCallback(() => {
    if (confirm('Are you sure you want to reset the assessment? All your current data will be lost.')) {
      setAssessmentData(defaultAssessmentData);
      toast({
        title: "Assessment Reset",
        description: "The assessment has been reset to default values.",
      });
    }
  }, []);

  // --- Updated saveAssessment function ---
  const saveAssessment = useCallback(() => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: General Info
      const generalInfo = [{
        programName: assessmentData.programName,
        assessmentDate: assessmentData.assessmentDate,
      }];
      const wsGeneral = XLSX.utils.json_to_sheet(generalInfo);
      XLSX.utils.book_append_sheet(wb, wsGeneral, 'General Info');

      // Sheet 2: Dimensions - Corrected properties
      const dimensionsData = assessmentData.dimensions.map(d => ({
        ID: d.id,
        Stage: d.stage,
        Name: d.name,
        CurrentRating: d.currentRating,
        TargetRating: d.targetRating, // Added
        IndicatorLevel1: d.indicators.level1, // Added flattened
        IndicatorLevel2: d.indicators.level2, // Added flattened
        IndicatorLevel3: d.indicators.level3, // Added flattened
        Evidence: d.evidence || '', // Keep evidence
      }));
      const wsDimensions = XLSX.utils.json_to_sheet(dimensionsData);
      XLSX.utils.book_append_sheet(wb, wsDimensions, 'Dimensions');

      // Sheet 3: Programmatic Items
      const programmaticData = assessmentData.programmaticItems.map(p => ({
        ID: p.id,
        Question: p.question,
        Answer: p.answer === null ? '' : (p.answer ? 'Yes' : 'No'), // Handle null
        Comments: p.comments,
      }));
      const wsProgrammatic = XLSX.utils.json_to_sheet(programmaticData);
      XLSX.utils.book_append_sheet(wb, wsProgrammatic, 'Programmatic Items');

      // Sheet 4: Planning Notes - Corrected properties
      const planningData = [{
          strengths: assessmentData.planningNotes.strengths,
          improvements: assessmentData.planningNotes.improvements, // Corrected
          champions: assessmentData.planningNotes.champions,       // Corrected
          resources: assessmentData.planningNotes.resources,       // Corrected
      }];
      const wsPlanning = XLSX.utils.json_to_sheet(planningData);
      XLSX.utils.book_append_sheet(wb, wsPlanning, 'Planning Notes');

      // Generate XLSX file data
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // Trigger download
      const fileName = `${assessmentData.programName || 'program'}_assessment_data_${new Date().toISOString().split('T')[0]}.xlsx`;
      triggerDownload(wbout, fileName);

      toast({
        title: "Assessment Exported",
        description: "Your assessment data has been exported to an XLSX file.",
      });

    } catch (error) {
      console.error('XLSX export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not export assessment data to XLSX.",
        variant: "destructive",
      });
    }
  }, [assessmentData]);

  // --- Updated loadAssessment function ---
  const loadAssessment = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        toast({ title: "Load Cancelled", description: "No file selected.", variant: "destructive" });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          if (!data) throw new Error("File data could not be read.");

          const workbook = XLSX.read(data, { type: 'array' });

          const requiredSheets = ['General Info', 'Dimensions', 'Programmatic Items', 'Planning Notes'];
          const missingSheets = requiredSheets.filter(sheet => !workbook.SheetNames.includes(sheet));
          if (missingSheets.length > 0) {
            throw new Error(`Invalid file format. Missing sheets: ${missingSheets.join(', ')}`);
          }

          const generalInfo = XLSX.utils.sheet_to_json(workbook.Sheets['General Info'])[0] as any;
          const dimensionsData = XLSX.utils.sheet_to_json(workbook.Sheets['Dimensions']) as any[];
          const programmaticData = XLSX.utils.sheet_to_json(workbook.Sheets['Programmatic Items']) as any[];
          const planningNotesData = XLSX.utils.sheet_to_json(workbook.Sheets['Planning Notes'])[0] as any; // Corrected var name

          // Reconstruct AssessmentData - Corrected
          const loadedData: AssessmentData = {
            programName: generalInfo?.programName || defaultAssessmentData.programName,
            assessmentDate: generalInfo?.assessmentDate || defaultAssessmentData.assessmentDate,
            dimensions: dimensionsData.map((d): Dimension => ({ // Added explicit Dimension type
              id: d.ID || '',
              stage: d.Stage || 'Readiness', // Provide default stage
              name: d.Name || '',
              currentRating: typeof d.CurrentRating === 'number' ? d.CurrentRating : 0,
              targetRating: typeof d.TargetRating === 'number' ? d.TargetRating : 0, // Added
              indicators: { // Added reconstruction
                level1: d.IndicatorLevel1 || '',
                level2: d.IndicatorLevel2 || '',
                level3: d.IndicatorLevel3 || '',
              },
              evidence: d.Evidence || '',
            })),
            programmaticItems: programmaticData.map((p): ProgrammaticItem => ({ // Added explicit ProgrammaticItem type
              id: p.ID || '',
              question: p.Question || '',
              answer: p.Answer === 'Yes' ? true : (p.Answer === 'No' ? false : null), // Handle null/empty
              comments: p.Comments || '',
            })),
            planningNotes: { // Corrected properties
              strengths: planningNotesData?.strengths || '',
              improvements: planningNotesData?.improvements || '',
              champions: planningNotesData?.champions || '',
              resources: planningNotesData?.resources || '',
            },
          };

          // Basic validation
          if (!loadedData.dimensions?.length || !loadedData.programmaticItems?.length || !loadedData.planningNotes) {
             throw new Error("File structure seems incorrect or empty. Could not load data.");
          }

          setAssessmentData(loadedData);

          toast({
            title: "Assessment Loaded",
            description: "Assessment data successfully loaded from file.",
          });

        } catch (error) {
          console.error('XLSX load error:', error);
          toast({
            title: "Load Failed",
            description: error instanceof Error ? error.message : "Could not load assessment data from file.",
            variant: "destructive",
          });
        }
      };

      reader.onerror = () => {
        toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
      };

      reader.readAsArrayBuffer(file);
    };

    input.click();
  }, [setAssessmentData]); // Added dependency

  // --- exportPDF function (kept from previous successful write) ---
  const exportPDF = async () => {
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate the PDF for the current tab...",
      });

      const pdf = new jsPDF({ // Corrected: Use jsPDF constructor
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const tabIds = ['overview', 'assessment', 'programmatic', 'planning'];
      const tabNames = ['Overview & Visualization', 'Self Assessment', 'Programmatic Assessment', 'Planning'];
      const activeTabPanel = document.querySelector('[role="tabpanel"][data-state="active"]');

      if (!activeTabPanel) throw new Error("Could not find the active tab content to export.");

      const activeTabValue = activeTabPanel.getAttribute('data-value') || 'unknown';
      const activeTabIndex = tabIds.indexOf(activeTabValue);
      const activeTabName = activeTabIndex >= 0 ? tabNames[activeTabIndex] : "Current View";

      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.setFontSize(24);
      pdf.text(`${assessmentData.programName || 'Program'} Assessment Report`, pageWidth / 2, 30, { align: 'center' });
      pdf.setFontSize(16);
      pdf.text(`Section: ${activeTabName}`, pageWidth / 2, 45, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' });

      pdf.addPage();

      const targetElement = activeTabPanel as HTMLElement;
      const elementScrollHeight = targetElement.scrollHeight;
      const elementScrollWidth = targetElement.scrollWidth;
      const options = { scale: 1.5, useCORS: true, logging: true, allowTaint: true, backgroundColor: '#ffffff', imageTimeout: 15000, height: elementScrollHeight, width: elementScrollWidth, windowHeight: elementScrollHeight, windowWidth: elementScrollWidth, scrollY: -window.scrollY };

      const canvas = await html2canvas(targetElement, options); // Corrected: Use html2canvas function
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 190;
      const pdfPageHeight = 297;
      const pageTopMargin = 15;
      const pageBottomMargin = 10;
      const availablePageHeight = pdfPageHeight - pageTopMargin - pageBottomMargin;
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const totalImgHeightInPDF = (imgProps.height * imgWidth) / imgProps.width;
      let heightLeft = totalImgHeightInPDF;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, pageTopMargin, imgWidth, totalImgHeightInPDF);
      heightLeft -= availablePageHeight;

      while (heightLeft > 0) {
        position -= availablePageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position + pageTopMargin, imgWidth, totalImgHeightInPDF);
        heightLeft -= availablePageHeight;
      }

      pdf.save(`${assessmentData.programName || 'program'}_${activeTabValue}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: "PDF Generated", description: `The '${activeTabName}' section has been exported as a PDF.` });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: "PDF Generation Failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
    }
  };
  // --- End of exportPDF ---


  const value = {
    assessmentData,
    setDimensionRating,
    setDimensionEvidence,
    setProgrammaticAnswer,
    setProgrammaticComments,
    setPlanningNotes,
    setProgramName,
    resetAssessment,
    saveAssessment,
    loadAssessment,
    exportPDF,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
