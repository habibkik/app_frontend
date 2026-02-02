// Feasibility Analysis Types

export interface ComponentCostBreakdown {
  componentId: string;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplierCount: number;
}

export interface ProductionCostEstimate {
  laborCostPerUnit: number;
  equipmentCostPerUnit: number;
  facilityCostPerUnit: number;
  totalProductionCostPerUnit: number;
}

export interface LogisticsCostEstimate {
  shippingCostPerUnit: number;
  importDuties: number;
  handlingStorage: number;
  totalLandedCostPerUnit: number;
}

export type FactorStatus = "pass" | "warn" | "fail";

export interface FeasibilityFactors {
  componentAvailability: { status: FactorStatus; message: string };
  leadTime: { status: FactorStatus; days: number; message: string };
  singleSupplierRisk: { status: FactorStatus; count: number; components: string[]; message: string };
  costCompetitiveness: { status: FactorStatus; percentDiff: number; message: string };
  localSourcing: { status: FactorStatus; localPercent: number; importedPercent: number; message: string };
}

export interface MakeVsBuyAnalysis {
  makeCost: number;
  buyCost: number;
  difference: number;
  savingsPercent: number;
  recommendation: "make" | "buy";
}

export interface ScenarioParams {
  productionVolume: number;
  costIncreasePercent: number;
  laborCostPerHour: number;
}

export interface ScenarioResult {
  baseUnitCost: number;
  projectedUnitCost: number;
  percentChange: number;
  volumeDiscountApplied: boolean;
  discountPercent: number;
}

export type RiskSeverity = "critical" | "warning" | "info";

export interface RiskFactor {
  id: string;
  type: RiskSeverity;
  title: string;
  description: string;
  mitigation?: string;
}

export type FeasibilityStatus = "feasible" | "risky" | "not-feasible";

export interface FeasibilityAnalysis {
  productName: string;
  componentCount: number;
  score: number;
  status: FeasibilityStatus;
  componentCosts: ComponentCostBreakdown[];
  productionCost: ProductionCostEstimate;
  logisticsCost: LogisticsCostEstimate;
  totalCostPerUnit: number;
  factors: FeasibilityFactors;
  makeVsBuy: MakeVsBuyAnalysis;
  risks: RiskFactor[];
  breakEvenUnits: number;
  recommendedMinOrder: number;
}

// Default scenario parameters
export const DEFAULT_SCENARIO_PARAMS: ScenarioParams = {
  productionVolume: 1000,
  costIncreasePercent: 0,
  laborCostPerHour: 25,
};

// Volume discount thresholds
export const VOLUME_DISCOUNTS = [
  { threshold: 500, discount: 5 },
  { threshold: 1000, discount: 10 },
  { threshold: 2500, discount: 15 },
  { threshold: 5000, discount: 20 },
  { threshold: 10000, discount: 25 },
];
