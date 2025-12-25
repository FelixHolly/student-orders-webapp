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
  editingOrder = signal<Order | null>(null);

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
    this.editingOrder.set(null);
  }

  editOrder(order: Order): void {
    this.editingOrder.set(order);
    this.showAddForm.set(true);
  }

  onOrderUpdated(order: Order): void {
    this.orders.update(orders =>
      orders.map(o => o.id === order.id ? order : o)
    );
    this.showAddForm.set(false);
    this.editingOrder.set(null);
  }

  onFormCancelled(): void {
    this.showAddForm.set(false);
    this.editingOrder.set(null);
  }

  deleteOrder(id: number): void {
    this.orderService.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.orders.update(orders => orders.filter(order => order.id !== id));
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to delete order');
      }
    });
  }

  toggleStatus(order: Order): void {
    if (!order.id) return;

    const newStatus = order.status === 'pending' ? 'paid' : 'pending';
    this.orderService.updateStatus(order.id, { status: newStatus }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updatedOrder) => {
        this.orders.update(orders =>
          orders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
        );
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to update order status');
      }
    });
  }
}
