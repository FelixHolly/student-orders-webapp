import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Order, CreateOrderRequest, UpdateOrderRequest } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss'
})
export class OrderFormComponent implements OnChanges {
  @Input() studentId!: number;
  @Input() order: Order | null = null;
  @Output() orderCreated = new EventEmitter<Order>();
  @Output() orderUpdated = new EventEmitter<Order>();
  @Output() cancelled = new EventEmitter<void>();

  orderForm: FormGroup;
  submitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  private destroyRef = inject(DestroyRef);

  get isEditMode(): boolean {
    return !!this.order?.id;
  }

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService
  ) {
    this.orderForm = this.fb.group({
      total: ['', [Validators.required, Validators.min(0.01)]],
      status: ['pending', Validators.required],
      createdAt: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentId']) {
      if (this.studentId) {
        this.orderForm.enable();
      } else {
        this.orderForm.disable();
      }
    }

    if (changes['order'] && this.order) {
      const createdAtDate = this.order.createdAt
        ? new Date(this.order.createdAt).toISOString().split('T')[0]
        : '';

      this.orderForm.patchValue({
        total: this.order.total,
        status: this.order.status,
        createdAt: createdAtDate
      });
    }
  }

  onCancel(): void {
    this.orderForm.reset({ status: 'pending', createdAt: '' });
    this.cancelled.emit();
  }

  onSubmit(): void {
    if (this.orderForm.invalid || !this.studentId) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    if (this.isEditMode && this.order?.id) {
      const request: UpdateOrderRequest = {
        total: this.orderForm.value.total,
        status: this.orderForm.value.status,
        createdAt: new Date(this.orderForm.value.createdAt).toISOString()
      };

      this.orderService.update(this.order.id, request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (order) => {
          this.orderUpdated.emit(order);
          this.orderForm.reset({ status: 'pending', createdAt: '' });
          this.submitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to update order');
          this.submitting.set(false);
        }
      });
    } else {
      const request: CreateOrderRequest = {
        studentId: this.studentId,
        total: this.orderForm.value.total,
        status: this.orderForm.value.status
      };

      this.orderService.create(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (order) => {
          this.orderCreated.emit(order);
          this.orderForm.reset({ status: 'pending', createdAt: '' });
          this.submitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to create order');
          this.submitting.set(false);
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least $0.01`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      total: 'Total amount',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  hasError(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }
}
