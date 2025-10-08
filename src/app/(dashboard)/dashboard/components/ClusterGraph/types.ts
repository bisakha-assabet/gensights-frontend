import type * as d3 from "d3"

export interface Cluster {
  cluster_id: number
  title: string
  summary: string
}

export interface Question {
  clusters: number[]
  question: string
  country_code: string
  case_created_date: string
  product: string
  case_no?: string
  product_class?: string
  groups?: string
}

export interface DataType {
  clusters: Cluster[]
  questions: Question[]
}

export interface Node extends d3.SimulationNodeDatum {
  id: string
  type: "cluster" | "question"
  label: string
  summary?: string
  clusterId?: number
  clusterIds?: number[]
  country?: string
  drug?: string
  date?: string
  fixedX?: number
  fixedY?: number
  color?: string
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node
  target: string | Node
  clusterId?: number
}

export interface ClusterGraphProps {
  data: DataType | null
  loading: boolean
  dimensions: { width: number; height: number }
  currentStep: number
  totalSteps: number
  isDarkMode: boolean
  onQuestionClick?: (questionId: string, connectedClusterIds: number[]) => void
  clickHighlightedClusterIds?: number[]
}

export interface ClusterGraphControlsProps {
  currentStep: number
  totalSteps: number
  getStepTitle: () => string
  getCurrentSummary: () => string
}

export interface ClusterGraphFiltersProps {
  selectedProduct: string
  setSelectedProduct: (value: string) => void
  selectedCountry: string
  setSelectedCountry: (value: string) => void
  selectedQuarter: string
  setSelectedQuarter: (value: string) => void
  selectedYear: string
  setSelectedYear: (value: string) => void
  products: string[]
  countries: string[]
  quarters: string[]
  years: string[]
  productDropdownOpen: boolean
  setProductDropdownOpen: (value: boolean) => void
  countryDropdownOpen: boolean
  setCountryDropdownOpen: (value: boolean) => void
  quarterDropdownOpen: boolean
  setQuarterDropdownOpen: (value: boolean) => void
  yearDropdownOpen: boolean
  setYearDropdownOpen: (value: boolean) => void
  loading: boolean
  closeAllDropdowns: () => void
}

export interface ClusterPosition {
  x: number
  y: number
}

export interface ClusterColor {
  main: string
  light: string
  stroke: string
}
