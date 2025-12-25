export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface StudentFilter {
  name?: string;
  grade?: string;
  school?: string;
}

export interface OrderFilter {
  studentId?: number;
  status?: string;
  minTotal?: number;
  maxTotal?: number;
}
