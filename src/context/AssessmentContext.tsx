
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
      
      // Find the currently active tab panel
      const activeTabPanel = document.querySelector('[role="tabpanel"][data-state="active"]');
      console.log("Active tab panel found:", !!activeTabPanel);
      
      // Get the active tab value
      const activeTabValue = activeTabPanel?.getAttribute('data-value') || 'overview';
      console.log("Active tab value:", activeTabValue);
      
      // Find the active tab name
      const activeTabIndex = tabIds.indexOf(activeTabValue);
      const activeTabName = activeTabIndex >= 0 ? tabNames[activeTabIndex] : "Current View";
      
      if (activeTabPanel) {
        // Add a page for the active tab content
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text(activeTabName, 105, 15, { align: 'center' });
        pdf.setDrawColor(0);
        pdf.line(20, 20, 190, 20);
        
        try {
          // Capture the active tab content with lower quality to avoid PNG corruption
          console.log(`Capturing active tab content: ${activeTabName}`);
          const canvas = await html2canvas(activeTabPanel as HTMLElement, {
            scale: 1.0, // Lower scale to reduce file size
            useCORS: true,
            logging: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            imageTimeout: 15000, // Longer timeout
            onclone: (clonedDoc) => {
              // Make any hidden elements in the cloned document visible
              const hiddenElements = clonedDoc.querySelectorAll('[aria-hidden="true"]');
              hiddenElements.forEach(el => {
                (el as HTMLElement).style.display = 'none';
              });
              return clonedDoc;
            }
          });
          
          console.log(`Canvas created: ${canvas.width}x${canvas.height}`);
          
          try {
            // Try JPEG format instead of PNG to avoid corruption
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            const imgWidth = 190; // A4 width with margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add the image to the PDF
            pdf.addImage(imgData, 'JPEG', 10, 25, imgWidth, imgHeight);
            
            // If content is too tall for one page, add additional pages
            let heightLeft = imgHeight;
            let position = 0;
            heightLeft -= (297 - 25); // A4 height minus top margin
            
            while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
              heightLeft -= 297; // A4 height
            }
          } catch (imgErr) {
            console.error("Error with image data:", imgErr);
            
            // Try with even lower quality as a last resort
            try {
              const imgData = canvas.toDataURL('image/jpeg', 0.5);
              pdf.addImage(imgData, 'JPEG', 10, 25, 190, 100);
            } catch (finalErr) {
              throw new Error(`Failed to process image: ${finalErr.message}`);
            }
          }
        } catch (err) {
          console.error(`Error capturing content:`, err);
          pdf.setFontSize(12);
          pdf.setTextColor(255, 0, 0);
          pdf.text(`Error capturing content: ${err instanceof Error ? err.message : 'Unknown error'}`, 20, 40);
          pdf.text("Please try viewing one tab at a time and exporting each separately.", 20, 55);
          pdf.setTextColor(0, 0, 0);
        }
      } else {
        // Fallback to capturing the entire assessment content
        const mainContent = document.getElementById('assessment-content');
        console.log("Falling back to main content, found:", !!mainContent);
        
        if (mainContent) {
          pdf.addPage();
          pdf.setFontSize(16);
          pdf.text("Current View", 105, 15, { align: 'center' });
          pdf.setDrawColor(0);
          pdf.line(20, 20, 190, 20);
          
          try {
            // Capture with lower quality settings
            const canvas = await html2canvas(mainContent, {
              scale: 0.8, // Lower scale
              useCORS: true,
              logging: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              imageTimeout: 15000 // Longer timeout
            });
            
            // Use JPEG instead of PNG
            const imgData = canvas.toDataURL('image/jpeg', 0.7);
            const imgWidth = 190;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'JPEG', 10, 25, imgWidth, imgHeight);
            
            // Handle multi-page content
            let heightLeft = imgHeight;
            let position = 0;
            heightLeft -= (297 - 25);
            
            while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
              heightLeft -= 297;
            }
          } catch (err) {
            console.error("Error capturing main content:", err);
            pdf.setFontSize(12);
            pdf.setTextColor(255, 0, 0);
            pdf.text(`Error capturing content: ${err instanceof Error ? err.message : 'Unknown error'}`, 20, 40);
            pdf.setTextColor(0, 0, 0);
          }
        }
      }
      
      // Save the PDF
      pdf.save(`${assessmentData.programName || 'program'}_assessment_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Your assessment has been exported as a PDF. For best results, try exporting one tab at a time.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
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
