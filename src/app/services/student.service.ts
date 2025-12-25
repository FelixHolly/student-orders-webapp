import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, CreateStudentRequest, UpdateStudentRequest } from '../models/student.model';
import { PageRequest, PageResponse, StudentFilter } from '../models/pagination.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getAll(pageRequest?: PageRequest, filter?: StudentFilter): Observable<PageResponse<Student>> {
    let params = new HttpParams();

    if (pageRequest) {
      if (pageRequest.page !== undefined) params = params.set('page', pageRequest.page.toString());
      if (pageRequest.size !== undefined) params = params.set('size', pageRequest.size.toString());
      if (pageRequest.sort) {
        pageRequest.sort.forEach(s => params = params.append('sort', s));
      }
    }

    if (filter) {
      if (filter.name) params = params.set('name', filter.name);
      if (filter.grade) params = params.set('grade', filter.grade);
      if (filter.school) params = params.set('school', filter.school);
    }

    return this.http.get<PageResponse<Student>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, request);
  }

  update(id: number, request: UpdateStudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
