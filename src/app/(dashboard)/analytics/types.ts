import { Data, Layout, Config } from 'plotly.js';

// API Response Types
export interface ApiChartData {
  type: string;
  x: string[];
  y: number[];
  percentages: number[];
  textposition: string;
}

export interface ApiLayout {
  title: string;
  xaxis: {
    title: string;
  };
  yaxis: {
    title: string;
  };
}

export interface AnalyticsData {
  data: ApiChartData[];
  layout: ApiLayout;
}

export interface ApiResponse {
  data: AnalyticsData;
  message: string;
  success: boolean;
  status_code: number;
}

// Filter Types
export interface FilterOptions {
  product: string;
  country: string;
  quarterly: string;
  yearly: string;
}

// Chart Component Props
export interface ChartComponentProps {
  apiEndpoint: string;
  title: string;
  filters?: FilterOptions;
  chartHeight?: number;
  showFilters?: boolean;
}

// Summary Stats
export interface SummaryStats {
  totalItems: number;
  totalQuestions: number;
  topItem: string;
  additionalStats?: {
    label: string;
    value: string | number;
    color: string;
  }[];
}