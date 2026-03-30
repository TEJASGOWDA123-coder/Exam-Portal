// Database schema for academic data management

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Year {
  id: string;
  name: string;
  order: number;
  departmentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  name: string;
  yearId: string;
  departmentId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicConfig {
  departments: Department[];
  years: Year[];
  sections: Section[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
