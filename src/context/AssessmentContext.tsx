import * as React from 'react';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AssessmentData, Dimension, ProgrammaticItem, PlanningNotes } from '../types/assessmentTypes';
import { defaultAssessmentData } from '../utils/defaultAssessmentData';
import { toast } from '../components/ui/use-toast';
// Removed xlsx import
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AssessmentContextType {
  assessmentData: AssessmentData;
  setDimensionRating: (id: string, rating: number) => void;
  setDimensionEvidence: (id: string, evidence: string) => void;
  setProgrammaticAnswer: (id: string, answer: boolean | null) => void;
  setProgrammaticComments: (id: string, comments: string) => void;
  setPlanningNotes: (field: keyof PlanningNotes, value: string) => void;
  setProgramName: (name: string) => void;
  resetAssessment: () => void;
  saveAssessment: () => void; // Reverted signature
  loadAssessment: () => void; // Reverted signature
  exportPDF: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

// Removed triggerDownload helper function

export const AssessmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Restore initial state loading from localStorage
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(() => {
    const savedData = localStorage.getItem('assessmentData');
    return savedData ? JSON.parse(savedData) : defaultAssessmentData;
  });

  // Keep useCallback for setters
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
        dim.id === id ? { ...dim, evidence: evidence } : dim
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

  // Reverted resetAssessment to include localStorage removal
  const resetAssessment = useCallback(() => {
    if (confirm('Are you sure you want to reset the assessment? All your current data will be lost.')) {
      setAssessmentData(defaultAssessmentData);
      localStorage.removeItem('assessmentData'); // Restore localStorage interaction
      toast({
        title: "Assessment Reset",
        description: "The assessment has been reset to default values.",
      });
    }
  }, []);

  // --- Reverted saveAssessment function ---
  const saveAssessment = useCallback(() => {
    try {
      localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
      toast({
        title: "Assessment Saved",
        description: "Your assessment data has been saved to browser storage.", // Updated description
      });
    } catch (error) {
       console.error('LocalStorage save error:', error);
       toast({
         title: "Save Failed",
         description: "Could not save assessment data to browser storage.",
         variant: "destructive",
       });
    }
  }, [assessmentData]);

  // --- Reverted loadAssessment function ---
  const loadAssessment = useCallback(() => {
    try {
      const savedData = localStorage.getItem('assessmentData');
      if (savedData) {
        // Add basic validation before parsing
        JSON.parse(savedData); // Try parsing to catch invalid JSON
        setAssessmentData(JSON.parse(savedData));
        toast({
          title: "Assessment Loaded",
          description: "Assessment data successfully loaded from browser storage.", // Updated description
        });
      } else {
        toast({
          title: "No Saved Data",
          description: "No assessment data found in browser storage.",
          variant: "destructive",
        });
      }
    } catch (error) {
       console.error('LocalStorage load error:', error);
       toast({
         title: "Load Failed",
         description: "Could not load assessment data from browser storage. Data might be corrupted.",
         variant: "destructive",
       });
    }
  }, [setAssessmentData]); // Added dependency

  // --- exportPDF function (kept from previous successful write) ---
  const exportPDF = async () => {
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate the PDF for the current tab...",
      });

      const pdf = new jsPDF({
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

      const canvas = await html2canvas(targetElement, options);
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
