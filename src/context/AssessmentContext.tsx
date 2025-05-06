
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
            const targetElement = activeTabPanel as HTMLElement;
            console.log(`Capturing active tab content: ${activeTabName}`);

            // Get the full scroll height and width of the element
            const elementScrollHeight = targetElement.scrollHeight;
            const elementScrollWidth = targetElement.scrollWidth;
            console.log(`Target element scroll dimensions: ${elementScrollWidth}x${elementScrollHeight}`);

            // Options for html2canvas
            const options = {
              scale: 1.5, // Restore scale for better resolution
              useCORS: true,
              logging: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              imageTimeout: 15000,
              height: elementScrollHeight, // Use scrollHeight
              width: elementScrollWidth,   // Use scrollWidth
              windowHeight: elementScrollHeight, // Match window height to content
              windowWidth: elementScrollWidth,   // Match window width to content
              scrollY: -window.scrollY // Account for page scroll if any
            };
            console.log("html2canvas options:", options);

            const canvas = await html2canvas(targetElement, options);
            console.log(`Canvas created: ${canvas.width}x${canvas.height}`);

            // Use PNG format again for better quality
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = 190; // A4 width with margins (210mm - 10mm left - 10mm right)
            const pdfPageHeight = 297; // A4 height in mm
            const pageTopMargin = 25; // Top margin for content on each page
            const pageBottomMargin = 10; // Bottom margin
            const availablePageHeight = pdfPageHeight - pageTopMargin - pageBottomMargin; // Usable height per page

            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth;
            // Calculate the total height the image will occupy in the PDF
            const totalImgHeightInPDF = (imgProps.height * imgWidth) / imgProps.width;
            console.log(`Calculated total image height in PDF: ${totalImgHeightInPDF}mm`);

            let heightLeft = totalImgHeightInPDF;
            let position = 0; // Position of the image slice on the Y axis

            // Add the first part of the image
            pdf.addImage(imgData, 'PNG', 10, pageTopMargin, imgWidth, totalImgHeightInPDF);
            heightLeft -= availablePageHeight;
            console.log(`Added first image part. Initial heightLeft: ${heightLeft}`);

            // Add additional pages if needed
            while (heightLeft > 0) {
              position -= availablePageHeight; // Move the viewing window of the image up
              pdf.addPage();
              // Add the same image, but adjust the Y position to show the next part
              pdf.addImage(imgData, 'PNG', 10, position + pageTopMargin, imgWidth, totalImgHeightInPDF);
              heightLeft -= availablePageHeight;
              console.log(`Added new page. heightLeft: ${heightLeft}, position: ${position}`);
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
          // Fallback logic: Capture the main content element
          const mainContent = document.getElementById('assessment-content');
          console.log("Falling back to main content capture, found:", !!mainContent);

          if (mainContent) {
            pdf.addPage();
            pdf.setFontSize(16);
            pdf.text("Current View (Fallback)", 105, 15, { align: 'center' });
            pdf.setDrawColor(0);
            pdf.line(20, 20, 190, 20);

            try {
              const canvas = await html2canvas(mainContent, {
                scale: 1.5, // Restore scale
                useCORS: true,
                logging: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                imageTimeout: 15000,
                height: mainContent.scrollHeight, // Use scrollHeight for fallback too
                width: mainContent.scrollWidth
              });

              const imgData = canvas.toDataURL('image/png'); // Use PNG
              const pdfWidth = 190;
              const pdfPageHeight = 297;
              const pageTopMargin = 25;
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
            } catch (err) {
              console.error("Error capturing main content (fallback):", err);
              pdf.setFontSize(12);
              pdf.setTextColor(255, 0, 0);
              pdf.text(`Error capturing content: ${err instanceof Error ? err.message : 'Unknown error'}`, 20, 40);
              pdf.setTextColor(0, 0, 0);
            }
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
