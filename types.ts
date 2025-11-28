
export enum EmploymentStatus {
  ACTIVE = '在职',
  ALUMNI = '离职/校友',
  SABBATICAL = '休假中'
}

export enum Department {
  ENGINEERING = '技术部',
  PRODUCT = '产品部',
  DESIGN = '设计部',
  SALES = '销售部',
  HR = '人事行政',
  LEADERSHIP = '总经办',
  OPERATIONS = '运营部'
}

export interface Employee {
  id: string;
  fullName: string;
  role: string;
  department: Department;
  joinDate: string; // YYYY-MM-DD
  leaveDate?: string; // YYYY-MM-DD or undefined
  status: EmploymentStatus;
  bio: string;
  skills: string[];
  avatarUrl?: string;
  email?: string;
}

export interface TimelineEvent {
  year: number;
  employees: Employee[];
}

export type ViewMode = 'TIMELINE' | 'GRID' | 'STATS' | 'GALLERY' | 'ADMIN';

export const DEPARTMENTS = Object.values(Department);
export const STATUSES = Object.values(EmploymentStatus);
