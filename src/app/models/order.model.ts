export interface Order {
  id?: number;
  studentId: number;
  total: number;
  status: 'pending' | 'paid';
  createdAt?: string;
}
