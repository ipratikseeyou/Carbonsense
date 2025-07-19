import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getBiomassPerHectare, getCalculationBreakdown, getForestBiomassData } from './forestBiomassData';

// Define interfaces
interface ProjectData {
  id: string;
  name: string;
  coordinates: string;
  carbon_tons: number;
  price_per_ton?: number;
  currency?: string;
  satellite_image_url?: string;
  project_area?: number;
  forest_type?: string;
  monitoring_period_start?: string;
  monitoring_period_end?: string;
  last_verification_date?: string;
  baseline_methodology?: string;
  verification_standard?: string;
  uncertainty_percentage?: number;
  developer_name?: string;
  developer_contact?: string;
  land_tenure?: string;
  created_at?: string;
  updated_at?: string;
}

interface AnalysisResult {
  ndvi?: number;
  forest_cover?: number;
  carbon_estimate?: number;
  recommendations?: string;
  confidence_score?: number;
  fire_incidents?: number;
  temperature?: number;
  humidity?: number;
  weather_description?: string;
  wind_speed?: number;
  precipitation?: number;
}

// Helper function to get currency symbol
const getCurrencySymbol = (currency?: string): string => {
  switch (currency) {
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'INR': return '₹';
    default: return '$';
  }
};

// Function to generate the PDF
export const generateProjectPDF = (project: ProjectData, analysisResult?: AnalysisResult) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Colors (using RGB values for jsPDF compatibility)
  const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
  const secondaryColor: [number, number, number] = [52, 73, 94]; // Dark gray
  const accentColor: [number, number, number] = [39, 174, 96]; // Green
  const lightGray: [number, number, number] = [236, 240, 241];
  const orangeColor: [number, number, number] = [230, 126, 34]; // Orange
  const redColor: [number, number, number] = [231, 76, 60]; // Red

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number): boolean => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Get forest-specific biomass data
  const forestType = project.forest_type || 'Mixed Forest';
  const biomassPerHa = getBiomassPerHectare(forestType);
  const forestBiomassData = getForestBiomassData(forestType);
  const calculationBreakdown = project.project_area ? 
    getCalculationBreakdown(project.project_area, forestType) : null;

  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(...primaryColor);
  pdf.text('CARBONSENSE PROJECT REPORT', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Subtitle
  pdf.setFontSize(12);
  pdf.setTextColor(...secondaryColor);
  pdf.text(`Professional Carbon Project Analysis`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Report metadata
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(`Generated: ${reportDate}`, margin, yPosition);
  pdf.text(`Report ID: ${project.id.substring(0, 8)}`, pageWidth - margin - 40, yPosition);
  yPosition += 20;

  // Executive Summary Section
  checkPageBreak(30);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryColor);
  pdf.text('EXECUTIVE SUMMARY', margin, yPosition);
  yPosition += 10;

  const currencySymbol = getCurrencySymbol(project.currency);
  const totalValue = (project.carbon_tons || 0) * (project.price_per_ton || 25);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  const summaryText = `This report provides a comprehensive analysis of the ${project.name} carbon offset project located at ${project.coordinates}. The project features ${forestType} with an IPCC-based biomass value of ${biomassPerHa} t/ha, demonstrating significant potential for carbon sequestration with an estimated ${Number(project.carbon_tons).toLocaleString()} tCO₂ capacity and a total project value of ${currencySymbol}${totalValue.toLocaleString()}.`;
  
  const summaryLines = pdf.splitTextToSize(summaryText, pageWidth - 2 * margin);
  pdf.text(summaryLines, margin, yPosition);
  yPosition += summaryLines.length * 5 + 10;

  // Project Overview Table
  checkPageBreak(50);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryColor);
  pdf.text('PROJECT OVERVIEW', margin, yPosition);
  yPosition += 10;

  const projectData = [
    ['Project Name', project.name],
    ['Location', project.coordinates],
    ['Forest Type', forestType],
    ['Biomass per Hectare', `${biomassPerHa} t/ha`],
    ['Project Area', project.project_area ? `${project.project_area} hectares` : 'Not specified'],
    ['Carbon Capacity', `${Number(project.carbon_tons).toLocaleString()} tCO₂`],
    ['Price per Ton', `${currencySymbol}${Number(project.price_per_ton || 25).toFixed(2)}`],
    ['Total Value', `${currencySymbol}${totalValue.toLocaleString()}`],
    ['Developer', project.developer_name || 'Not specified'],
    ['Created Date', project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Not specified']
  ];

  autoTable(pdf, {
    startY: yPosition,
    head: [['Attribute', 'Value']],
    body: projectData,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    alternateRowStyles: { 
      fillColor: lightGray 
    },
    margin: { left: margin, right: margin }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 15;

  // Forest Biomass & Carbon Calculation Section
  checkPageBreak(60);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryColor);
  pdf.text('FOREST BIOMASS & CARBON CALCULATION', margin, yPosition);
  yPosition += 10;

  if (calculationBreakdown) {
    const biomassCalculationData = [
      ['Forest Type', calculationBreakdown.forestType],
      ['Biomass per Hectare', `${calculationBreakdown.biomassPerHa} t/ha`],
      ['Project Area', `${calculationBreakdown.area} hectares`],
      ['Forest Coverage', `${calculationBreakdown.forestCoverage}%`],
      ['Buffer Percentage', `${calculationBreakdown.bufferPercentage}%`],
      ['Calculation Formula', calculationBreakdown.formula],
      ['Calculated Carbon Credits', `${calculationBreakdown.carbonCredits.toLocaleString()} tCO₂e`],
      ['Data Source', calculationBreakdown.source],
      ['Reference Year', calculationBreakdown.year ? calculationBreakdown.year.toString() : 'N/A']
    ];

    autoTable(pdf, {
      startY: yPosition,
      head: [['Parameter', 'Value']],
      body: biomassCalculationData,
      theme: 'grid',
      headStyles: { 
        fillColor: accentColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: 9,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: { 
        fillColor: lightGray 
      },
      margin: { left: margin, right: margin }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // Add calculation explanation
    checkPageBreak(30);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...secondaryColor);
    pdf.text('CALCULATION METHODOLOGY', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const methodologyText = `The carbon credit calculation follows IPCC guidelines using forest-specific biomass values. The formula accounts for project area, forest coverage percentage, biomass density, carbon fraction (0.47), CO₂ conversion factor (3.67), and applies a conservative buffer for uncertainty. This methodology ensures accurate and verifiable carbon credit quantification based on internationally recognized standards.`;
    
    const methodologyLines = pdf.splitTextToSize(methodologyText, pageWidth - 2 * margin);
    pdf.text(methodologyLines, margin, yPosition);
    yPosition += methodologyLines.length * 5 + 15;
  }

  // Financial Analysis Section
  checkPageBreak(40);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryColor);
  pdf.text('FINANCIAL ANALYSIS', margin, yPosition);
  yPosition += 10;

  const financialData = [
    ['Carbon Credits Available', `${Number(project.carbon_tons).toLocaleString()} tCO₂`],
    ['Current Market Price', `${currencySymbol}${Number(project.price_per_ton || 25).toFixed(2)} per tCO₂`],
    ['Total Project Value', `${currencySymbol}${totalValue.toLocaleString()}`],
    ['Currency', project.currency || 'USD'],
    ['Revenue Potential', `${currencySymbol}${(totalValue * 0.8).toLocaleString()} (80% of total value)`]
  ];

  autoTable(pdf, {
    startY: yPosition,
    head: [['Financial Metric', 'Value']],
    body: financialData,
    theme: 'grid',
    headStyles: { 
      fillColor: accentColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    alternateRowStyles: { 
      fillColor: lightGray 
    },
    margin: { left: margin, right: margin }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 15;

  // Verification & Standards Section
  checkPageBreak(40);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryColor);
  pdf.text('VERIFICATION & STANDARDS', margin, yPosition);
  yPosition += 10;

  const verificationData = [
    ['Verification Standard', project.verification_standard || 'VCS v4.0 (Default)'],
    ['Baseline Methodology', project.baseline_methodology || 'VM0015 (Default)'],
    ['Uncertainty Level', project.uncertainty_percentage ? `±${project.uncertainty_percentage}%` : '±10% (Estimated)'],
    ['Last Verification', project.last_verification_date ? new Date(project.last_verification_date).toLocaleDateString() : 'Pending'],
    ['Monitoring Period', project.monitoring_period_start && project.monitoring_period_end 
      ? `${new Date(project.monitoring_period_start).toLocaleDateString()} - ${new Date(project.monitoring_period_end).toLocaleDateString()}`
      : 'To be determined']
  ];

  autoTable(pdf, {
    startY: yPosition,
    head: [['Standard/Methodology', 'Details']],
    body: verificationData,
    theme: 'grid',
    headStyles: { 
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    alternateRowStyles: { 
      fillColor: lightGray 
    },
    margin: { left: margin, right: margin }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 15;

  // Analysis Results Section (if available)
  if (analysisResult) {
    checkPageBreak(50);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text('SATELLITE ANALYSIS RESULTS', margin, yPosition);
    yPosition += 10;

    const analysisData = [];
    
    if (analysisResult.ndvi !== undefined) {
      analysisData.push(['NDVI Score', analysisResult.ndvi.toFixed(3)]);
    }
    if (analysisResult.forest_cover !== undefined) {
      analysisData.push(['Forest Cover', `${analysisResult.forest_cover.toFixed(1)}%`]);
    }
    if (analysisResult.carbon_estimate !== undefined) {
      analysisData.push(['Carbon Estimate', `${Number(analysisResult.carbon_estimate).toLocaleString()} tCO₂`]);
    }
    if (analysisResult.confidence_score !== undefined) {
      analysisData.push(['Confidence Score', `${(analysisResult.confidence_score * 100).toFixed(1)}%`]);
    }
    if (analysisResult.fire_incidents !== undefined) {
      analysisData.push(['Fire Incidents', analysisResult.fire_incidents.toString()]);
    }
    if (analysisResult.temperature !== undefined) {
      analysisData.push(['Temperature', `${analysisResult.temperature}°C`]);
    }
    if (analysisResult.humidity !== undefined) {
      analysisData.push(['Humidity', `${analysisResult.humidity}%`]);
    }
    if (analysisResult.weather_description) {
      analysisData.push(['Weather Conditions', analysisResult.weather_description]);
    }

    if (analysisData.length > 0) {
      autoTable(pdf, {
        startY: yPosition,
        head: [['Analysis Parameter', 'Result']],
        body: analysisData,
        theme: 'grid',
        headStyles: { 
          fillColor: orangeColor,
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          textColor: [0, 0, 0]
        },
        alternateRowStyles: { 
          fillColor: lightGray 
        },
        margin: { left: margin, right: margin }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Recommendations section
    if (analysisResult.recommendations) {
      checkPageBreak(30);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...secondaryColor);
      pdf.text('RECOMMENDATIONS', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const recommendationLines = pdf.splitTextToSize(analysisResult.recommendations, pageWidth - 2 * margin);
      pdf.text(recommendationLines, margin, yPosition);
      yPosition += recommendationLines.length * 5 + 10;
    }
  }

  // Risk Assessment Section
  checkPageBreak(40);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...primaryColor);
  pdf.text('RISK ASSESSMENT', margin, yPosition);
  yPosition += 10;

  const riskData = [
    ['Market Risk', 'Medium - Carbon credit prices subject to market volatility'],
    ['Environmental Risk', analysisResult?.fire_incidents ? 
      `${analysisResult.fire_incidents > 0 ? 'High' : 'Low'} - ${analysisResult.fire_incidents} fire incidents detected` :
      'Low - No immediate environmental threats detected'],
    ['Regulatory Risk', 'Low - Project follows established VCS standards'],
    ['Operational Risk', 'Low - Standard monitoring and verification procedures'],
    ['Technical Risk', analysisResult?.confidence_score ? 
      `${analysisResult.confidence_score > 0.8 ? 'Low' : 'Medium'} - Analysis confidence: ${(analysisResult.confidence_score * 100).toFixed(1)}%` :
      'Medium - Further technical validation recommended']
  ];

  autoTable(pdf, {
    startY: yPosition,
    head: [['Risk Category', 'Assessment']],
    body: riskData,
    theme: 'grid',
    headStyles: { 
      fillColor: redColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    alternateRowStyles: { 
      fillColor: lightGray 
    },
    margin: { left: margin, right: margin }
  });

  yPosition = (pdf as any).lastAutoTable.finalY + 15;

  // Footer on last page
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Page number
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
    
    // Footer text
    pdf.text('CarbonSense Platform - Professional Carbon Project Analysis', margin, pageHeight - 10);
    
    // Report generation timestamp
    pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  return pdf;
};
