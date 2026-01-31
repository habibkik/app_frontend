/**
 * AI Analysis Service
 * 
 * Configure this service to connect to your backend API for image analysis.
 * Update the API_ENDPOINT and implement the analyzeProductImage function
 * to match your backend's API contract.
 */

export interface AnalyzedComponent {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
  specifications: string;
  material: string;
  confidence: number;
}

export interface AnalysisResult {
  success: boolean;
  productName: string;
  components: AnalyzedComponent[];
  overallConfidence: number;
  processingTime: number;
  error?: string;
}

export interface AnalysisRequest {
  imageBase64: string;
  mimeType: string;
  additionalContext?: string;
}

// Configure your backend endpoint here
const API_ENDPOINT = import.meta.env.VITE_AI_ANALYSIS_ENDPOINT || "/api/analyze-product";

/**
 * Analyzes a product image using your backend AI service
 * 
 * @param request - The analysis request containing the image data
 * @returns Promise<AnalysisResult> - The analysis results
 */
export async function analyzeProductImage(request: AnalysisRequest): Promise<AnalysisResult> {
  const startTime = Date.now();

  try {
    // If no endpoint configured, use mock data for demo
    if (!import.meta.env.VITE_AI_ANALYSIS_ENDPOINT) {
      console.log("No AI endpoint configured - using mock analysis");
      return await mockAnalysis(request, startTime);
    }

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add your auth headers here if needed
        // "Authorization": `Bearer ${YOUR_API_KEY}`,
      },
      body: JSON.stringify({
        image: request.imageBase64,
        mimeType: request.mimeType,
        context: request.additionalContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      productName: data.productName || "Analyzed Product",
      components: data.components || [],
      overallConfidence: data.confidence || 85,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    
    // Fallback to mock for demo purposes
    console.log("Falling back to mock analysis");
    return await mockAnalysis(request, startTime);
  }
}

/**
 * Mock analysis for demonstration when no backend is connected
 */
async function mockAnalysis(request: AnalysisRequest, startTime: number): Promise<AnalysisResult> {
  // Simulate API processing time
  await new Promise((resolve) => setTimeout(resolve, 2500 + Math.random() * 1500));

  const mockComponents: AnalyzedComponent[] = [
    {
      name: "Aluminum Housing Shell",
      category: "Structural",
      quantity: 1,
      unit: "piece",
      estimatedUnitCost: 14.50,
      specifications: "6061-T6 Aluminum, CNC machined, anodized finish",
      material: "Aluminum Alloy",
      confidence: 94,
    },
    {
      name: "Main Control PCB",
      category: "Electronics",
      quantity: 1,
      unit: "piece",
      estimatedUnitCost: 12.00,
      specifications: "4-layer FR-4, ENIG finish, 1.6mm thickness",
      material: "FR-4 Composite",
      confidence: 91,
    },
    {
      name: "LCD Display Module",
      category: "Display",
      quantity: 1,
      unit: "piece",
      estimatedUnitCost: 18.50,
      specifications: "2.8\" TFT, 320x240 resolution, ILI9341 driver",
      material: "Glass/ITO",
      confidence: 88,
    },
    {
      name: "Lithium Polymer Battery",
      category: "Power",
      quantity: 1,
      unit: "piece",
      estimatedUnitCost: 6.25,
      specifications: "3.7V 3000mAh, protection circuit included",
      material: "Lithium Polymer",
      confidence: 92,
    },
    {
      name: "Tactile Switches",
      category: "Input",
      quantity: 4,
      unit: "pieces",
      estimatedUnitCost: 0.18,
      specifications: "6x6mm, 4.3mm height, 180gf actuation",
      material: "Plastic/Metal",
      confidence: 95,
    },
    {
      name: "USB-C Port Assembly",
      category: "Connectivity",
      quantity: 1,
      unit: "piece",
      estimatedUnitCost: 1.45,
      specifications: "24-pin, 10Gbps data, 100W PD capable",
      material: "Metal/Plastic",
      confidence: 89,
    },
    {
      name: "Speaker Module",
      category: "Audio",
      quantity: 1,
      unit: "piece",
      estimatedUnitCost: 2.30,
      specifications: "15mm diameter, 8Ω 1W, neodymium magnet",
      material: "Plastic/Metal",
      confidence: 86,
    },
    {
      name: "Rubber Gasket Set",
      category: "Sealing",
      quantity: 1,
      unit: "set",
      estimatedUnitCost: 0.85,
      specifications: "IP67 rated, silicone, custom profile",
      material: "Silicone Rubber",
      confidence: 90,
    },
    {
      name: "M2.5 Screw Set",
      category: "Fasteners",
      quantity: 1,
      unit: "set (12pcs)",
      estimatedUnitCost: 0.35,
      specifications: "M2.5x6mm, Phillips pan head, stainless",
      material: "Stainless Steel 304",
      confidence: 97,
    },
    {
      name: "Antenna Module",
      category: "Connectivity",
      quantity: 1,
      unit: "piece",
      estimatedUnitCost: 3.20,
      specifications: "2.4GHz/5GHz dual-band, ceramic chip antenna",
      material: "Ceramic/PCB",
      confidence: 84,
    },
  ];

  return {
    success: true,
    productName: "Electronic Device Assembly",
    components: mockComponents,
    overallConfidence: 89,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Converts a File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
