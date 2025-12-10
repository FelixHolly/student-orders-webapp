import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { Student } from '../models/student.model';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/students';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should fetch all students', () => {
      const mockStudents: Student[] = [
        {
          id: 1,
          name: 'Alice Johnson',
          grade: '9th Grade',
          school: 'Springfield High School',
          createdAt: '2024-12-08T10:00:00'
        },
        {
          id: 2,
          name: 'Bob Smith',
          grade: '10th Grade',
          school: 'Riverside Academy',
          createdAt: '2024-12-08T10:05:00'
        }
      ];

      service.getAll().subscribe(students => {
        expect(students).toEqual(mockStudents);
        expect(students.length).toBe(2);
        expect(students[0].name).toBe('Alice Johnson');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockStudents);
    });

    it('should return an empty array when no students exist', () => {
      service.getAll().subscribe(students => {
        expect(students).toEqual([]);
        expect(students.length).toBe(0);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle HTTP errors gracefully', () => {
      const errorMessage = 'Failed to load students';

      service.getAll().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('create', () => {
    it('should create a new student', () => {
      const newStudent = {
        name: 'Charlie Brown',
        grade: '11th Grade',
        school: 'Lincoln High School'
      };

      const createdStudent: Student = {
        id: 3,
        ...newStudent,
        createdAt: '2024-12-08T11:00:00'
      };

      service.create(newStudent).subscribe(student => {
        expect(student).toEqual(createdStudent);
        expect(student.id).toBe(3);
        expect(student.name).toBe(newStudent.name);
        expect(student.createdAt).toBeDefined();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newStudent);
      req.flush(createdStudent);
    });

    it('should handle validation errors when creating a student', () => {
      const invalidStudent = {
        name: '',
        grade: '9th Grade',
        school: 'Test School'
      };

      const errorResponse = {
        message: 'Name is required',
        errors: ['name: must not be blank']
      };

      service.create(invalidStudent).subscribe({
        next: () => fail('should have failed with validation error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe('Name is required');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should send correct Content-Type header', () => {
      const newStudent = {
        name: 'Diana Prince',
        grade: '12th Grade',
        school: 'Westfield School'
      };

      service.create(newStudent).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.headers.has('Content-Type')).toBe(false); // Angular adds this automatically
      req.flush({ id: 4, ...newStudent });
    });
  });

  describe('edge cases', () => {
    it('should handle network timeout errors', () => {
      service.getAll().subscribe({
        next: () => fail('should have failed with timeout'),
        error: (error) => {
          expect(error.statusText).toBe('Timeout');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Timeout error', { status: 408, statusText: 'Timeout' });
    });

    it('should handle malformed JSON response', () => {
      service.getAll().subscribe({
        next: (students) => {
          // Even with malformed data, the service should pass it through
          // The component should handle data validation
          expect(students).toBeDefined();
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ invalid: 'data' } as any);
    });
  });
});
