
import React, { createContext, useContext, useState } from 'react';
import { AssessmentData } from '../types/assessmentTypes';
import { defaultAssessmentData } from '../utils/defaultAssessmentData';
import { toast } from '../components/ui/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AssessmentContextType {
  assessmentData: AssessmentData;
  setDimensionRating: (id: string, rating: number) => void;
  setDimensionEvidence: (id: string, evidence: string) => void;
  setProgrammaticAnswer: (id: string, answer: boolean) => void;
  setProgrammaticComments: (id: string, comments: string) => void;
  setPlanningNotes: (field: keyof AssessmentData['planningNotes'], value: string) => void;
  setProgramName: (name: string) => void;
  resetAssessment: () => void;
  saveAssessment: () => void;
  loadAssessment: () => void;
  exportPDF: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(() => {
    const savedData = localStorage.getItem('assessmentData');
    return savedData ? JSON.parse(savedData) : defaultAssessmentData;
  });

  const setDimensionRating = (id: string, rating: number) => {
    setAssessmentData(prevData => {
      const updatedDimensions = prevData.dimensions.map(dim => 
        dim.id === id ? { ...dim, currentRating: rating } : dim
      );
      return { ...prevData, dimensions: updatedDimensions };
    });
  };

  const setDimensionEvidence = (id: string, evidence: string) => {
    setAssessmentData(prevData => {
      const updatedDimensions = prevData.dimensions.map(dim => 
        dim.id === id ? { ...dim, evidence } : dim
      );
      return { ...prevData, dimensions: updatedDimensions };
    });
  };

  const setProgrammaticAnswer = (id: string, answer: boolean) => {
    setAssessmentData(prevData => {
      const updatedItems = prevData.programmaticItems.map(item => 
        item.id === id ? { ...item, answer } : item
      );
      return { ...prevData, programmaticItems: updatedItems };
    });
  };

  const setProgrammaticComments = (id: string, comments: string) => {
    setAssessmentData(prevData => {
      const updatedItems = prevData.programmaticItems.map(item => 
        item.id === id ? { ...item, comments } : item
      );
      return { ...prevData, programmaticItems: updatedItems };
    });
  };

  const setPlanningNotes = (field: keyof AssessmentData['planningNotes'], value: string) => {
    setAssessmentData(prevData => ({
      ...prevData,
      planningNotes: {
        ...prevData.planningNotes,
        [field]: value
      }
    }));
  };

  const setProgramName = (name: string) => {
    setAssessmentData(prevData => ({
      ...prevData,
      programName: name
    }));
  };

  const resetAssessment = () => {
    if (confirm('Are you sure you want to reset the assessment? All your data will be lost.')) {
      setAssessmentData(defaultAssessmentData);
      localStorage.removeItem('assessmentData');
      toast({
        title: "Assessment Reset",
        description: "The assessment has been reset to default values.",
      });
    }
  };

  const saveAssessment = () => {
    localStorage.setItem('assessmentData', JSON.stringify(assessmentData));
    toast({
      title: "Assessment Saved",
      description: "Your assessment data has been saved successfully.",
    });
  };

  const loadAssessment = () => {
    const savedData = localStorage.getItem('assessmentData');
    if (savedData) {
      setAssessmentData(JSON.parse(savedData));
      toast({
        title: "Assessment Loaded",
        description: "Your assessment data has been loaded from storage.",
      });
    } else {
      toast({
        title: "No Saved Data",
        description: "There is no saved assessment data to load.",
        variant: "destructive",
      });
    }
  };

  const exportPDF = async () => {
    try {
      toast({
        title: "Generating Complete PDF",
        description: "Please wait while we generate your complete assessment PDF...",
      });
      
      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Define tab IDs to capture
      const tabIds = ['overview', 'assessment', 'programmatic', 'planning'];
      const tabNames = ['Overview & Visualization', 'Self Assessment', 'Programmatic Assessment', 'Planning'];
      
      // Store the current active tab to restore later
      const currentActiveTab = document.querySelector('[data-state="active"][data-orientation="horizontal"]');
      const currentActiveTabValue = currentActiveTab?.getAttribute('data-value') || 'overview';
      
      // Add title page
      pdf.setFontSize(24);
      pdf.text(`${assessmentData.programName || 'Program'} Assessment Report`, 105, 80, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 100, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('This report contains the following sections:', 105, 130, { align: 'center' });
      
      let yPos = 145;
      tabNames.forEach((name, index) => {
        pdf.text(`${index + 1}. ${name}`, 105, yPos, { align: 'center' });
        yPos += 10;
      });
      
      // Process each tab
      for (let i = 0; i < tabIds.length; i++) {
        const tabId = tabIds[i];
        const tabName = tabNames[i];
        
        console.log(`Processing tab: ${tabName}`);
        
        // Click on the tab to make it active
        const tabTrigger = document.querySelector(`[data-value="${tabId}"][role="tab"]`) as HTMLElement;
        if (tabTrigger) {
          tabTrigger.click();
          
          // Wait longer for the tab content to render
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get the tab content - more specific selector
          const tabContent = document.querySelector(`[role="tabpanel"][data-state="active"][data-value="${tabId}"]`);
          console.log(`Tab content found for ${tabName}:`, !!tabContent);
          
          if (!tabContent) {
            console.error(`Tab content not found for ${tabName}`);
            continue; // Skip if tab content not found
          }
          
          // Add a new page for each tab
          pdf.addPage();
          
          // Add section header
          pdf.setFontSize(16);
          pdf.text(`${tabName}`, 105, 15, { align: 'center' });
          pdf.setDrawColor(0);
          pdf.line(20, 20, 190, 20);
          
          try {
            // Capture the tab content
            console.log(`Capturing content for ${tabName}`);
            const canvas = await html2canvas(tabContent as HTMLElement, {
              scale: 1.5,
              useCORS: true,
              logging: true, // Enable logging for debugging
              allowTaint: true,
              backgroundColor: '#ffffff'
            });
            
            console.log(`Canvas created for ${tabName}: ${canvas.width}x${canvas.height}`);
            
            // Calculate dimensions to fit in A4
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 190; // A4 width with margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add the image to the PDF
            pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);
            
            // If content is too tall for one page, add additional pages
            let heightLeft = imgHeight;
            let position = 0;
            heightLeft -= (297 - 25); // A4 height minus top margin
            
            while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
              heightLeft -= 297; // A4 height
            }
            
            console.log(`Finished processing ${tabName}`);
          } catch (err) {
            console.error(`Error capturing ${tabName}:`, err);
            // Add error message to PDF instead of skipping
            pdf.setFontSize(12);
            pdf.setTextColor(255, 0, 0);
            pdf.text(`Error capturing content for ${tabName}: ${err instanceof Error ? err.message : 'Unknown error'}`, 20, 40);
            pdf.setTextColor(0, 0, 0);
          }
        } else {
          console.error(`Tab trigger not found for ${tabName}`);
        }
      }
      
      // Restore the original tab
      const originalTabTrigger = document.querySelector(`[data-value="${currentActiveTabValue}"][role="tab"]`) as HTMLElement;
      if (originalTabTrigger) {
        originalTabTrigger.click();
      }
      
      // Save the PDF
      pdf.save(`${assessmentData.programName || 'program'}_complete_assessment_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Complete PDF Generated",
        description: "Your complete assessment has been exported as a PDF with all sections.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      
      // Ensure we restore the original tab even if there's an error
      try {
        const currentActiveTab = document.querySelector('[data-state="active"][data-orientation="horizontal"]');
        const currentActiveTabValue = currentActiveTab?.getAttribute('data-value') || 'overview';
        const originalTabTrigger = document.querySelector(`[data-value="${currentActiveTabValue}"][role="tab"]`) as HTMLElement;
        if (originalTabTrigger) {
          originalTabTrigger.click();
        }
      } catch (e) {
        console.error('Error restoring tab:', e);
      }
    }
  };

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
