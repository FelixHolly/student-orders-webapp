import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { Order } from '../models/order.model';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/orders';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getByStudentId', () => {
    it('should fetch orders for a specific student', () => {
      const studentId = 1;
      const mockOrders: Order[] = [
        {
          id: 1,
          studentId: 1,
          total: 25.50,
          status: 'paid',
          createdAt: '2024-12-08T10:00:00'
        },
        {
          id: 2,
          studentId: 1,
          total: 12.75,
          status: 'pending',
          createdAt: '2024-12-08T11:00:00'
        }
      ];

      service.getByStudentId(studentId).subscribe(orders => {
        expect(orders).toEqual(mockOrders);
        expect(orders.length).toBe(2);
        expect(orders[0].studentId).toBe(studentId);
        expect(orders[1].studentId).toBe(studentId);
      });

      const req = httpMock.expectOne(`${apiUrl}?studentId=${studentId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('studentId')).toBe(studentId.toString());
      req.flush(mockOrders);
    });

    it('should return empty array when student has no orders', () => {
      const studentId = 999;

      service.getByStudentId(studentId).subscribe(orders => {
        expect(orders).toEqual([]);
        expect(orders.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}?studentId=${studentId}`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should handle different student IDs correctly', () => {
      const studentId = 5;
      const mockOrders: Order[] = [
        {
          id: 10,
          studentId: 5,
          total: 100.00,
          status: 'paid',
          createdAt: '2024-12-08T12:00:00'
        }
      ];

      service.getByStudentId(studentId).subscribe(orders => {
        expect(orders[0].studentId).toBe(studentId);
      });

      const req = httpMock.expectOne(`${apiUrl}?studentId=${studentId}`);
      req.flush(mockOrders);
    });

    it('should handle HTTP errors when fetching orders', () => {
      const studentId = 1;

      service.getByStudentId(studentId).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?studentId=${studentId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle student not found error', () => {
      const studentId = 999;
      const errorResponse = {
        message: 'Student not found',
        timestamp: '2024-12-08T12:00:00'
      };

      service.getByStudentId(studentId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.error.message).toBe('Student not found');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?studentId=${studentId}`);
      req.flush(errorResponse, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('create', () => {
    it('should create a new order with pending status', () => {
      const newOrder = {
        studentId: 1,
        total: 45.99,
        status: 'pending' as const
      };

      const createdOrder: Order = {
        id: 5,
        ...newOrder,
        createdAt: '2024-12-08T13:00:00'
      };

      service.create(newOrder).subscribe(order => {
        expect(order).toEqual(createdOrder);
        expect(order.id).toBe(5);
        expect(order.total).toBe(45.99);
        expect(order.status).toBe('pending');
        expect(order.createdAt).toBeDefined();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newOrder);
      req.flush(createdOrder);
    });

    it('should create a new order with paid status', () => {
      const newOrder = {
        studentId: 2,
        total: 99.99,
        status: 'paid' as const
      };

      const createdOrder: Order = {
        id: 6,
        ...newOrder,
        createdAt: '2024-12-08T13:30:00'
      };

      service.create(newOrder).subscribe(order => {
        expect(order.status).toBe('paid');
        expect(order.total).toBe(99.99);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(createdOrder);
    });

    it('should handle validation errors for invalid total amount', () => {
      const invalidOrder = {
        studentId: 1,
        total: -10.00,
        status: 'pending' as const
      };

      const errorResponse = {
        message: 'Total must be positive',
        errors: ['total: must be greater than 0']
      };

      service.create(invalidOrder).subscribe({
        next: () => fail('should have failed with validation error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe('Total must be positive');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle invalid student ID error', () => {
      const orderWithInvalidStudent = {
        studentId: 999,
        total: 50.00,
        status: 'pending' as const
      };

      const errorResponse = {
        message: 'Student with ID 999 not found'
      };

      service.create(orderWithInvalidStudent).subscribe({
        next: () => fail('should have failed with not found error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.error.message).toContain('not found');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(errorResponse, { status: 404, statusText: 'Not Found' });
    });

    it('should handle decimal amounts correctly', () => {
      const newOrder = {
        studentId: 1,
        total: 123.45,
        status: 'paid' as const
      };

      service.create(newOrder).subscribe(order => {
        expect(order.total).toBe(123.45);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.body.total).toBe(123.45);
      req.flush({ id: 7, ...newOrder });
    });
  });

  describe('edge cases', () => {
    it('should handle very large order amounts', () => {
      const newOrder = {
        studentId: 1,
        total: 9999999.99,
        status: 'pending' as const
      };

      service.create(newOrder).subscribe(order => {
        expect(order.total).toBe(9999999.99);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ id: 8, ...newOrder });
    });

    it('should handle zero student ID in query params', () => {
      const studentId = 0;

      service.getByStudentId(studentId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}?studentId=${studentId}`);
      expect(req.request.params.get('studentId')).toBe('0');
      req.flush([]);
    });

    it('should properly convert studentId to string in query params', () => {
      const studentId = 12345;

      service.getByStudentId(studentId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}?studentId=${studentId}`);
      expect(req.request.params.get('studentId')).toBe('12345');
      expect(typeof req.request.params.get('studentId')).toBe('string');
      req.flush([]);
    });
  });
});
