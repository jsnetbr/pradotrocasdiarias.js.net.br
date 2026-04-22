import { DepartmentData, DashboardMetrics } from './types';

export const departmentData: DepartmentData[] = [
  { id: '1', setor: 'AÇOUGUE', realizado: 2559.10, meta: 3000.00, status: 14.70 },
  { id: '2', setor: 'BAZAR/ELETRO/FLORES', realizado: 1675.08, meta: 3000.00, status: 14.70 },
  { id: '3', setor: 'PETSHOP', realizado: 3265.79, meta: 6000.00, status: 80.79 },
  { id: '4', setor: 'BEBIDAS', realizado: 26373.58, meta: 7000.00, status: 276.77, isCritical: true },
  { id: '5', setor: 'FLC', realizado: 20324.82, meta: 6000.00, status: 171.77 },
  { id: '6', setor: 'HIGIENE', realizado: 1254.70, meta: 4000.00, status: 80.79 },
  { id: '7', setor: 'PADARIA', realizado: 768.35, meta: 4000.00, status: 80.79, isBest: true },
  { id: '8', setor: 'LIMPEZA', realizado: 1726.85, meta: 3000.00, status: 80.79 },
  { id: '9', setor: 'MERCEARIA', realizado: 2551.70, meta: 6000.00, status: 80.79 },
];

export const dashboardMetrics: DashboardMetrics = {
  totalRealized: 114103.64,
  totalGoal: 93000.00,
  totalVariance: 21103.64,
  variancePercentage: 22.69,
  bestSector: 'PADARIA',
  bestSectorStatus: 80.79,
  worstSector: 'BEBIDAS',
  worstSectorStatus: 276.77,
};
