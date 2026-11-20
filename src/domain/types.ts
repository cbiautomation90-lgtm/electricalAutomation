export enum UserRole {
  DepartmentHead = 'department_head',
  ElectricalEngineer = 'electrical_engineer',
  AutomationEngineer = 'automation_engineer',
  Technician = 'technician',
  Storekeeper = 'storekeeper',
  ProductionOperator = 'production_operator',
}

export type AssetStatus = 'operational' | 'maintenance' | 'out_of_service' | 'inactive';
export type Criticality = 'low' | 'medium' | 'high' | 'critical';
