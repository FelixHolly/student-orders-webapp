import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.scss'
})
export class OrderFormComponent implements OnChanges {
  @Input() studentId!: number;
  @Output() orderCreated = new EventEmitter<Order>();

  orderForm: FormGroup;
  submitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService
  ) {
    this.orderForm = this.fb.group({
      total: ['', [Validators.required, Validators.min(0.01)]],
      status: ['pending', Validators.required]
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
  }

  onSubmit(): void {
    if (this.orderForm.invalid || !this.studentId) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const orderData = {
      studentId: this.studentId,
      ...this.orderForm.value
    };

    this.orderService.create(orderData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (order) => {
        this.orderCreated.emit(order);
        this.orderForm.reset({ status: 'pending' });
        this.submitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to create order');
        this.submitting.set(false);
      }
    });
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
