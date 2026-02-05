 /**
  * Competitor Monitoring API
  *
  * Provides functions for competitor tracking, price monitoring,
  * and market intelligence operations.
  */
 
 import { apiClient, API_ENDPOINTS } from "@/services";
 import type { ApiResponse } from "@/types/api.types";
 import type {
   CompetitorMarketData,
   Competitor,
   PriceAlert,
 } from "../types/competitorIntelligence";
 
 // ============================================================================
 // RESPONSE TYPES
 // ============================================================================
 
 export interface AutoRefreshSettings {
   enabled: boolean;
   interval: number | null;
   nextUpdate: string | null;
 }
 
 export interface PriceHistoryItem {
   id: string;
   competitorId: string;
   price: number;
   currency: string;
   availability: string;
   collectedAt: string;
 }
 
 export interface CompetitorDetails extends Competitor {
   priceHistory: PriceHistoryItem[];
   recentAlerts: PriceAlert[];
   trackingStatus: {
     isTracked: boolean;
     priority: string;
     lastCheck: string;
   };
 }
 
 // ============================================================================
 // API FUNCTIONS
 // ============================================================================
 
 /**
  * Start monitoring competitors for a product
  * Triggers the competitorMonitoringPipeline via miroflow
  */
 export async function startMonitoring(
   productId: string,
   productName: string
 ): Promise<ApiResponse<CompetitorMarketData>> {
   return apiClient.post<CompetitorMarketData>(
     API_ENDPOINTS.COMPETITORS.MONITOR,
     { productId, productName }
   );
 }
 
 /**
  * Manually refresh competitor prices for a product
  * Forces immediate price update from all sources
  */
 export async function refreshCompetitors(
   productId: string
 ): Promise<ApiResponse<CompetitorMarketData>> {
   return apiClient.post<CompetitorMarketData>(
     API_ENDPOINTS.COMPETITORS.REFRESH,
     { productId }
   );
 }
 
 /**
  * Get cached competitor market data for a product
  * Returns the most recent analysis without triggering refresh
  */
 export async function getCompetitorData(
   productId: string
 ): Promise<ApiResponse<CompetitorMarketData>> {
   return apiClient.get<CompetitorMarketData>(
     API_ENDPOINTS.COMPETITORS.DATA(productId)
   );
 }
 
 /**
  * Get detailed competitor profile with full history
  * Includes contact info, reputation, engagement metrics
  */
 export async function getCompetitorDetails(
   competitorId: string
 ): Promise<ApiResponse<CompetitorDetails>> {
   return apiClient.get<CompetitorDetails>(
     API_ENDPOINTS.COMPETITORS.DETAILS(competitorId)
   );
 }
 
 /**
  * Get price history for a specific competitor
  * Returns price observations over specified time period
  */
 export async function getPriceHistory(
   competitorId: string,
   days: number = 30
 ): Promise<ApiResponse<PriceHistoryItem[]>> {
   return apiClient.get<PriceHistoryItem[]>(
     API_ENDPOINTS.COMPETITORS.HISTORY(competitorId),
     { days }
   );
 }
 
 /**
  * Configure automatic price refresh for a product
  * Set intervalHours to null to disable auto-refresh
  */
 export async function setAutoRefresh(
   productId: string,
   intervalHours: number | null
 ): Promise<ApiResponse<AutoRefreshSettings>> {
   return apiClient.post<AutoRefreshSettings>(
     API_ENDPOINTS.COMPETITORS.AUTO_REFRESH,
     { productId, intervalHours }
   );
 }
 
 /**
  * Dismiss a price alert
  * Marks alert as dismissed and removes from active list
  */
 export async function dismissAlert(
   alertId: string
 ): Promise<ApiResponse<{ success: boolean }>> {
   return apiClient.post<{ success: boolean }>(
     API_ENDPOINTS.ALERTS.DISMISS(alertId)
   );
 }
 
 // ============================================================================
 // BARREL EXPORT
 // ============================================================================
 
 export const competitorApi = {
   startMonitoring,
   refreshCompetitors,
   getCompetitorData,
   getCompetitorDetails,
   getPriceHistory,
   setAutoRefresh,
   dismissAlert,
 };