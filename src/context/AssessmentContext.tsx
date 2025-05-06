
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
        title: "Generating PDF",
        description: "Please wait while we generate your PDF...",
      });
      
      // Get the assessment content element
      const element = document.getElementById('assessment-content');
      if (!element) {
        throw new Error('Assessment content element not found');
      }
      
      // Create a canvas from the element
      const canvas = await html2canvas(element, {
        scale: 1.5, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Calculate dimensions to fit in A4
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add program name as title
      pdf.setFontSize(16);
      pdf.text(`${assessmentData.programName || 'Program'} Assessment Report`, 105, 15, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, 30, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 30);
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      pdf.save(`${assessmentData.programName || 'program'}_assessment_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Your assessment has been exported as a PDF.",
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
