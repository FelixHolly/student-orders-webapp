export interface Order {
  id?: number;
  studentId: number;
  total: number;
  status: 'pending' | 'paid';
  createdAt?: string;
}

export interface CreateOrderRequest {
  studentId: number;
  total: number;
  status: 'pending' | 'paid';
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface UpdateOrderRequest {
  total: number;
  status: string;
  createdAt: string;
}
