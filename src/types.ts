export interface DepartmentData {
  id: string;
  setor: string;
  realizado: number;
  meta: number;
  status: number; // percentage
  isCritical?: boolean;
  isBest?: boolean;
}

export interface DashboardMetrics {
  totalRealized: number;
  totalGoal: number;
  totalVariance: number;
  variancePercentage: number;
  bestSector: string;
  bestSectorStatus: number;
  worstSector: string;
  worstSectorStatus: number;
}
