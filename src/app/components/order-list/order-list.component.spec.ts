import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';
import { of, throwError } from 'rxjs';
import { OrderListComponent } from './order-list.component';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let orderService: jasmine.SpyObj<OrderService>;

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

  beforeEach(async () => {
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['getByStudentId']);

    await TestBed.configureTestingModule({
      imports: [OrderListComponent],
      providers: [
        { provide: OrderService, useValue: orderServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should load orders when studentId changes', () => {
      orderService.getByStudentId.and.returnValue(of(mockOrders));

      component.studentId = 1;
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, 1, true)
      });

      expect(orderService.getByStudentId).toHaveBeenCalledWith(1);
      expect(component.orders()).toEqual(mockOrders);
    });

    it('should not load orders when studentId is not set', () => {
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, undefined, true)
      });

      expect(orderService.getByStudentId).not.toHaveBeenCalled();
    });

    it('should not load orders when studentId is zero', () => {
      component.studentId = 0;
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, 0, true)
      });

      expect(orderService.getByStudentId).not.toHaveBeenCalled();
    });

    it('should load new orders when studentId changes to different student', () => {
      orderService.getByStudentId.and.returnValue(of(mockOrders));

      component.studentId = 1;
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, 1, true)
      });

      const newOrders: Order[] = [
        {
          id: 3,
          studentId: 2,
          total: 50.00,
          status: 'paid',
          createdAt: '2024-12-08T12:00:00'
        }
      ];

      orderService.getByStudentId.and.returnValue(of(newOrders));

      component.studentId = 2;
      component.ngOnChanges({
        studentId: new SimpleChange(1, 2, false)
      });

      expect(orderService.getByStudentId).toHaveBeenCalledWith(2);
      expect(component.orders()).toEqual(newOrders);
    });
  });

  describe('loadOrders', () => {
    beforeEach(() => {
      component.studentId = 1;
    });

    it('should load orders successfully', () => {
      orderService.getByStudentId.and.returnValue(of(mockOrders));

      component.loadOrders();

      expect(component.orders()).toEqual(mockOrders);
      expect(component.loading()).toBeFalsy();
      expect(component.errorMessage()).toBe('');
    });

    it('should handle empty orders list', () => {
      orderService.getByStudentId.and.returnValue(of([]));

      component.loadOrders();

      expect(component.orders()).toEqual([]);
      expect(component.orders().length).toBe(0);
    });

    it('should handle error when loading orders', () => {
      const errorResponse = {
        error: { message: 'Failed to load orders' }
      };

      orderService.getByStudentId.and.returnValue(throwError(() => errorResponse));

      component.loadOrders();

      expect(component.errorMessage()).toBe('Failed to load orders');
      expect(component.loading()).toBeFalsy();
    });

    it('should handle error without message', () => {
      const errorResponse = { error: {} };

      orderService.getByStudentId.and.returnValue(throwError(() => errorResponse));

      component.loadOrders();

      expect(component.errorMessage()).toBe('Failed to load orders');
    });

    it('should clear error message before loading', () => {
      component.errorMessage.set('Previous error');
      orderService.getByStudentId.and.returnValue(of(mockOrders));

      component.loadOrders();

      expect(component.errorMessage()).toBe('');
    });
  });

  describe('getTotalAmount', () => {
    beforeEach(() => {
      component.studentId = 1;
      orderService.getByStudentId.and.returnValue(of(mockOrders));
      component.loadOrders();
    });

    it('should calculate total amount correctly', () => {
      const total = component.getTotalAmount();
      expect(total).toBe(38.25); // 25.50 + 12.75
    });

    it('should return 0 for empty orders', () => {
      component.orders.set([]);
      const total = component.getTotalAmount();
      expect(total).toBe(0);
    });

    it('should handle single order', () => {
      component.orders.set([mockOrders[0]]);
      const total = component.getTotalAmount();
      expect(total).toBe(25.50);
    });

    it('should handle decimal precision', () => {
      const orders: Order[] = [
        { id: 1, studentId: 1, total: 10.11, status: 'paid' },
        { id: 2, studentId: 1, total: 20.22, status: 'paid' },
        { id: 3, studentId: 1, total: 30.33, status: 'paid' }
      ];
      component.orders.set(orders);
      const total = component.getTotalAmount();
      expect(total).toBeCloseTo(60.66, 2);
    });
  });

  describe('onOrderCreated', () => {
    beforeEach(() => {
      component.studentId = 1;
      orderService.getByStudentId.and.returnValue(of(mockOrders));
      component.loadOrders();
    });

    it('should add new order to the list', () => {
      const newOrder: Order = {
        id: 3,
        studentId: 1,
        total: 45.00,
        status: 'pending',
        createdAt: '2024-12-08T13:00:00'
      };

      const initialCount = component.orders().length;

      component.onOrderCreated(newOrder);

      expect(component.orders().length).toBe(initialCount + 1);
      expect(component.orders()).toContain(newOrder);
    });

    it('should hide add form after order creation', () => {
      const newOrder: Order = {
        id: 3,
        studentId: 1,
        total: 45.00,
        status: 'pending'
      };

      component.showAddForm.set(true);

      component.onOrderCreated(newOrder);

      expect(component.showAddForm()).toBeFalsy();
    });

    it('should preserve existing orders when adding new one', () => {
      const newOrder: Order = {
        id: 3,
        studentId: 1,
        total: 45.00,
        status: 'pending'
      };

      component.onOrderCreated(newOrder);

      expect(component.orders()).toContain(mockOrders[0]);
      expect(component.orders()).toContain(mockOrders[1]);
      expect(component.orders()).toContain(newOrder);
    });

    it('should update total amount after adding order', () => {
      const newOrder: Order = {
        id: 3,
        studentId: 1,
        total: 100.00,
        status: 'paid'
      };

      const oldTotal = component.getTotalAmount();

      component.onOrderCreated(newOrder);

      const newTotal = component.getTotalAmount();
      expect(newTotal).toBe(oldTotal + 100.00);
    });
  });

  describe('toggleAddForm', () => {
    it('should toggle showAddForm from false to true', () => {
      component.showAddForm.set(false);

      component.toggleAddForm();

      expect(component.showAddForm()).toBeTruthy();
    });

    it('should toggle showAddForm from true to false', () => {
      component.showAddForm.set(true);

      component.toggleAddForm();

      expect(component.showAddForm()).toBeFalsy();
    });

    it('should toggle multiple times correctly', () => {
      expect(component.showAddForm()).toBeFalsy();

      component.toggleAddForm();
      expect(component.showAddForm()).toBeTruthy();

      component.toggleAddForm();
      expect(component.showAddForm()).toBeFalsy();

      component.toggleAddForm();
      expect(component.showAddForm()).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large order totals', () => {
      const largeOrders: Order[] = [
        { id: 1, studentId: 1, total: 999999.99, status: 'paid' }
      ];

      component.orders.set(largeOrders);

      expect(component.getTotalAmount()).toBe(999999.99);
    });

    it('should handle multiple orders with same total', () => {
      const orders: Order[] = [
        { id: 1, studentId: 1, total: 10.00, status: 'paid' },
        { id: 2, studentId: 1, total: 10.00, status: 'paid' },
        { id: 3, studentId: 1, total: 10.00, status: 'paid' }
      ];

      component.orders.set(orders);

      expect(component.getTotalAmount()).toBe(30.00);
    });
  });
});
