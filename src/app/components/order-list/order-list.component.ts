import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private orderService: OrderService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentId'] && this.studentId) {
      this.loadOrders();
    }
  }

  loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.orderService.getByStudentId(this.studentId).subscribe({
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  onOrderCreated(order: Order): void {
    this.orders.update(orders => [...orders, order]);
    this.showAddForm.set(false);
  }

  toggleAddForm(): void {
    this.showAddForm.update(value => !value);
  }
}
