import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, CreateOrderRequest, UpdateOrderRequest, UpdateOrderStatusRequest } from '../models/order.model';
import { PageRequest, PageResponse, OrderFilter } from '../models/pagination.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getAll(pageRequest?: PageRequest, filter?: OrderFilter): Observable<PageResponse<Order>> {
    let params = new HttpParams();

    if (pageRequest) {
      if (pageRequest.page !== undefined) params = params.set('page', pageRequest.page.toString());
      if (pageRequest.size !== undefined) params = params.set('size', pageRequest.size.toString());
      if (pageRequest.sort) {
        pageRequest.sort.forEach(s => params = params.append('sort', s));
      }
    }

    if (filter) {
      if (filter.studentId !== undefined) params = params.set('studentId', filter.studentId.toString());
      if (filter.status) params = params.set('status', filter.status);
      if (filter.minTotal !== undefined) params = params.set('minTotal', filter.minTotal.toString());
      if (filter.maxTotal !== undefined) params = params.set('maxTotal', filter.maxTotal.toString());
    }

    return this.http.get<PageResponse<Order>>(this.apiUrl, { params });
  }

  getByStudentId(studentId: number, pageRequest?: PageRequest): Observable<Order[]> {
    return this.getAll(pageRequest, { studentId }).pipe(
      map(response => response.content)
    );
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, request: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, request);
  }

  update(id: number, request: UpdateOrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, request);
  }
}
