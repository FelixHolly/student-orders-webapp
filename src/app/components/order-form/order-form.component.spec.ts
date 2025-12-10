import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';
import { of, throwError } from 'rxjs';
import { OrderFormComponent } from './order-form.component';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

describe('OrderFormComponent', () => {
  let component: OrderFormComponent;
  let fixture: ComponentFixture<OrderFormComponent>;
  let orderService: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    const orderServiceSpy = jasmine.createSpyObj('OrderService', ['create']);

    await TestBed.configureTestingModule({
      imports: [OrderFormComponent, ReactiveFormsModule],
      providers: [
        { provide: OrderService, useValue: orderServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    orderService = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with default values', () => {
      expect(component.orderForm.value).toEqual({
        total: '',
        status: 'pending'
      });
    });

    it('should have required validators', () => {
      const totalControl = component.orderForm.get('total');
      const statusControl = component.orderForm.get('status');

      expect(totalControl?.hasError('required')).toBeTruthy();
      expect(statusControl?.hasError('required')).toBeFalsy(); // Has default value
    });

    it('should have min validator on total', () => {
      const totalControl = component.orderForm.get('total');
      totalControl?.setValue(0);

      expect(totalControl?.hasError('min')).toBeTruthy();
    });
  });

  describe('ngOnChanges', () => {
    it('should enable form when studentId is provided', () => {
      component.studentId = 1;
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, 1, true)
      });

      expect(component.orderForm.enabled).toBeTruthy();
    });

    it('should disable form when studentId is cleared', () => {
      component.studentId = 1;
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, 1, true)
      });

      component.studentId = 0;
      component.ngOnChanges({
        studentId: new SimpleChange(1, 0, false)
      });

      expect(component.orderForm.disabled).toBeTruthy();
    });

    it('should handle studentId change from one value to another', () => {
      component.studentId = 1;
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, 1, true)
      });

      component.studentId = 2;
      component.ngOnChanges({
        studentId: new SimpleChange(1, 2, false)
      });

      expect(component.orderForm.enabled).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      component.studentId = 1;
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, 1, true)
      });
    });

    it('should be invalid when empty', () => {
      expect(component.orderForm.valid).toBeFalsy();
    });

    it('should be valid with required fields filled', () => {
      component.orderForm.setValue({
        total: 25.99,
        status: 'pending'
      });

      expect(component.orderForm.valid).toBeTruthy();
    });

    it('should be invalid if total is zero', () => {
      component.orderForm.setValue({
        total: 0,
        status: 'pending'
      });

      expect(component.orderForm.valid).toBeFalsy();
      expect(component.orderForm.get('total')?.hasError('min')).toBeTruthy();
    });

    it('should be invalid if total is negative', () => {
      component.orderForm.setValue({
        total: -10,
        status: 'pending'
      });

      expect(component.orderForm.valid).toBeFalsy();
      expect(component.orderForm.get('total')?.hasError('min')).toBeTruthy();
    });

    it('should be valid with minimum total of 0.01', () => {
      component.orderForm.setValue({
        total: 0.01,
        status: 'pending'
      });

      expect(component.orderForm.valid).toBeTruthy();
    });

    it('should be valid with status "paid"', () => {
      component.orderForm.setValue({
        total: 25.99,
        status: 'paid'
      });

      expect(component.orderForm.valid).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.studentId = 1;
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, 1, true)
      });
    });

    it('should not submit if form is invalid', () => {
      component.orderForm.setValue({
        total: '',
        status: 'pending'
      });

      component.onSubmit();

      expect(orderService.create).not.toHaveBeenCalled();
    });

    it('should not submit if studentId is not set', () => {
      component.studentId = 0;
      component.orderForm.setValue({
        total: 25.99,
        status: 'pending'
      });

      component.onSubmit();

      expect(orderService.create).not.toHaveBeenCalled();
    });

    it('should submit valid form and emit orderCreated event', (done) => {
      const mockOrder: Order = {
        id: 1,
        studentId: 1,
        total: 25.99,
        status: 'pending',
        createdAt: '2024-12-08T10:00:00'
      };

      orderService.create.and.returnValue(of(mockOrder));

      component.orderForm.setValue({
        total: 25.99,
        status: 'pending'
      });

      component.orderCreated.subscribe((order) => {
        expect(order).toEqual(mockOrder);
        done();
      });

      component.onSubmit();

      expect(orderService.create).toHaveBeenCalledWith({
        studentId: 1,
        total: 25.99,
        status: 'pending'
      });
    });

    it('should reset form to default status after submission', () => {
      const mockOrder: Order = {
        id: 1,
        studentId: 1,
        total: 25.99,
        status: 'paid'
      };

      orderService.create.and.returnValue(of(mockOrder));

      component.orderForm.setValue({
        total: 25.99,
        status: 'paid'
      });

      component.onSubmit();

      expect(component.orderForm.value).toEqual({
        total: null,
        status: 'pending'
      });
    });

    it('should handle submission error', () => {
      const errorResponse = {
        error: { message: 'Failed to create order' }
      };

      orderService.create.and.returnValue(throwError(() => errorResponse));

      component.orderForm.setValue({
        total: 25.99,
        status: 'pending'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('Failed to create order');
      expect(component.submitting()).toBeFalsy();
    });

    it('should handle error without message', () => {
      const errorResponse = { error: {} };

      orderService.create.and.returnValue(throwError(() => errorResponse));

      component.orderForm.setValue({
        total: 25.99,
        status: 'pending'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('Failed to create order');
    });

    it('should clear error message on new submission', () => {
      component.errorMessage.set('Previous error');

      const mockOrder: Order = {
        id: 1,
        studentId: 1,
        total: 25.99,
        status: 'pending'
      };

      orderService.create.and.returnValue(of(mockOrder));

      component.orderForm.setValue({
        total: 25.99,
        status: 'pending'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('');
    });

    it('should handle large decimal amounts', () => {
      const mockOrder: Order = {
        id: 1,
        studentId: 1,
        total: 12345.67,
        status: 'pending'
      };

      orderService.create.and.returnValue(of(mockOrder));

      component.orderForm.setValue({
        total: 12345.67,
        status: 'pending'
      });

      component.onSubmit();

      expect(orderService.create).toHaveBeenCalledWith({
        studentId: 1,
        total: 12345.67,
        status: 'pending'
      });
    });
  });

  describe('getFieldError', () => {
    beforeEach(() => {
      component.studentId = 1;
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, 1, true)
      });
    });

    it('should return required error for total', () => {
      const totalControl = component.orderForm.get('total');
      totalControl?.markAsTouched();
      totalControl?.setValue('');

      expect(component.getFieldError('total')).toBe('Total amount is required');
    });

    it('should return min error for total', () => {
      const totalControl = component.orderForm.get('total');
      totalControl?.markAsTouched();
      totalControl?.setValue(0);

      expect(component.getFieldError('total')).toBe('Total amount must be at least $0.01');
    });

    it('should return required error for status', () => {
      const statusControl = component.orderForm.get('status');
      statusControl?.markAsTouched();
      statusControl?.setValue('');

      expect(component.getFieldError('status')).toBe('Status is required');
    });

    it('should return empty string when field is not touched', () => {
      const totalControl = component.orderForm.get('total');
      totalControl?.setValue('');

      expect(component.getFieldError('total')).toBe('');
    });

    it('should return empty string when field is valid', () => {
      const totalControl = component.orderForm.get('total');
      totalControl?.markAsTouched();
      totalControl?.setValue(25.99);

      expect(component.getFieldError('total')).toBe('');
    });
  });

  describe('hasError', () => {
    beforeEach(() => {
      component.studentId = 1;
      component.ngOnChanges({
        studentId: new SimpleChange(undefined, 1, true)
      });
    });

    it('should return true when field is touched and invalid', () => {
      const totalControl = component.orderForm.get('total');
      totalControl?.markAsTouched();
      totalControl?.setValue('');

      expect(component.hasError('total')).toBeTruthy();
    });

    it('should return false when field is not touched', () => {
      const totalControl = component.orderForm.get('total');
      totalControl?.setValue('');

      expect(component.hasError('total')).toBeFalsy();
    });

    it('should return false when field is valid', () => {
      const totalControl = component.orderForm.get('total');
      totalControl?.markAsTouched();
      totalControl?.setValue(25.99);

      expect(component.hasError('total')).toBeFalsy();
    });
  });
});
