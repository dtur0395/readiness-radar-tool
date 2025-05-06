import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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
  saveAssessment: () => void; // Will be JSON save
  loadAssessment: () => void; // Will be JSON load
  exportPDF: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

// Helper function to trigger file download (for JSON)
const triggerJsonDownload = (jsonData: string, filename: string) => {
  const blob = new Blob([jsonData], { type: 'application/json' });
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
  // Initialize state directly with default data
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(defaultAssessmentData);

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

  // Reset function remains the same (no localStorage interaction needed)
  const resetAssessment = useCallback(() => {
    if (confirm('Are you sure you want to reset the assessment? All your current data will be lost.')) {
      setAssessmentData(defaultAssessmentData);
      toast({
        title: "Assessment Reset",
        description: "The assessment has been reset to default values.",
      });
    }
  }, []);

  // --- Updated saveAssessment function (JSON) ---
  const saveAssessment = useCallback(() => {
    try {
      // Use pretty print for readability
      const jsonData = JSON.stringify(assessmentData, null, 2);
      const fileName = `${assessmentData.programName || 'program'}_assessment_data_${new Date().toISOString().split('T')[0]}.json`;
      triggerJsonDownload(jsonData, fileName);

      toast({
        title: "Assessment Exported",
        description: "Your assessment data has been exported to a JSON file.",
      });

    } catch (error) {
       console.error('JSON export error:', error);
       toast({
         title: "Export Failed",
         description: "Could not export assessment data to JSON.",
         variant: "destructive",
       });
    }
  }, [assessmentData]);

  // --- Updated loadAssessment function (JSON) ---
  const loadAssessment = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json'; // Accept only JSON files

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        toast({ title: "Load Cancelled", description: "No file selected." }); // Changed variant
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const fileContent = event.target?.result as string;
          if (!fileContent) throw new Error("File content is empty.");

          const loadedData = JSON.parse(fileContent);

          // Basic validation: Check for essential top-level keys
          if (
            typeof loadedData !== 'object' ||
            loadedData === null ||
            !Array.isArray(loadedData.dimensions) ||
            !Array.isArray(loadedData.programmaticItems) ||
            typeof loadedData.planningNotes !== 'object' ||
            loadedData.planningNotes === null
          ) {
            throw new Error("Invalid JSON file structure. Does not match assessment data format.");
          }

          // Further validation could be added here (e.g., checking specific properties)

          // Ensure loaded data conforms to AssessmentData type (or handle potential discrepancies)
          // For simplicity, we assume the structure matches. More robust parsing might be needed
          // if the format could vary significantly or needs migration.
          setAssessmentData(loadedData as AssessmentData);

          toast({
            title: "Assessment Loaded",
            description: "Assessment data successfully loaded from JSON file.",
          });

        } catch (error) {
          console.error('JSON load error:', error);
          toast({
            title: "Load Failed",
            description: error instanceof Error ? error.message : "Could not load assessment data from JSON file.",
            variant: "destructive",
          });
        }
      };

      reader.onerror = () => {
        toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
      };

      reader.readAsText(file); // Read as text for JSON
    };

    input.click(); // Trigger file selection dialog
  }, [setAssessmentData]);

  // --- exportPDF function (remains unchanged from last working version) ---
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
