import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getByStudentId(studentId: number): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, {
      params: { studentId: studentId.toString() }
    });
  }

  create(order: Omit<Order, 'id' | 'createdAt'>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }
}
