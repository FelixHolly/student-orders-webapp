import { Component, Input, OnChanges, SimpleChanges, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { OrderFormComponent } from '../order-form/order-form.component';
import { AddButton } from '../add-button/add-button';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, OrderFormComponent, AddButton],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnChanges {
  @Input() studentId!: number;

  orders = signal<Order[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showAddForm = signal<boolean>(false);

  private destroyRef = inject(DestroyRef);

  constructor(private orderService: OrderService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentId'] && this.studentId) {
      this.loadOrders();
    }
  }

  loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.orderService.getByStudentId(this.studentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load orders');
        this.loading.set(false);
      }
    });
  }

  getTotalAmount(): number {
    return this.orders().reduce((sum, order) => sum + order.total, 0);
  }

  onOrderCreated(order: Order): void {
    this.orders.update(orders => [...orders, order]);
    this.showAddForm.set(false);
  }

  toggleAddForm(): void {
    this.showAddForm.update(value => !value);
  }
}
