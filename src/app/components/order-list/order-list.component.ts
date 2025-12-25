import { Component, Input, OnChanges, SimpleChanges, signal, DestroyRef, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { OrderFormComponent } from '../order-form/order-form.component';
import { AddButton } from '../add-button/add-button';
import { Pagination } from '../pagination/pagination';
import { OrderFilter } from '../../models/pagination.model';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, FormsModule, OrderFormComponent, AddButton, Pagination],
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

  // Pagination state
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(10);

  // Filter state
  filterStatus = signal('');
  filterMinTotal = signal<number | null>(null);
  filterMaxTotal = signal<number | null>(null);

  // Sort state
  sortColumn = signal<string>('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  hasActiveFilters = computed(() =>
    this.filterStatus() !== '' ||
    this.filterMinTotal() !== null ||
    this.filterMaxTotal() !== null
  );

  private destroyRef = inject(DestroyRef);

  constructor(private orderService: OrderService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studentId'] && this.studentId) {
      this.currentPage.set(0);
      this.loadOrders();
    }
  }

  loadOrders(page: number = 0): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filter: OrderFilter = { studentId: this.studentId };
    if (this.filterStatus()) filter.status = this.filterStatus();
    if (this.filterMinTotal() !== null) filter.minTotal = this.filterMinTotal()!;
    if (this.filterMaxTotal() !== null) filter.maxTotal = this.filterMaxTotal()!;

    const sortParam = `${this.sortColumn()},${this.sortDirection()}`;

    this.orderService.getAll(
      { page, size: this.pageSize(), sort: [sortParam] },
      filter
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.orders.set(response.content);
        this.currentPage.set(response.number);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load orders');
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.loadOrders(page);
  }

  onFilter(): void {
    this.loadOrders(0);
  }

  clearFilters(): void {
    this.filterStatus.set('');
    this.filterMinTotal.set(null);
    this.filterMaxTotal.set(null);
    this.loadOrders(0);
  }

  sortBy(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.loadOrders(0);
  }

  getSortIcon(column: string): string {
    if (this.sortColumn() !== column) return '';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  getTotalAmount(): number {
    return this.orders().reduce((sum, order) => sum + order.total, 0);
  }

  onOrderCreated(order: Order): void {
    this.loadOrders(this.currentPage());
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
        this.loadOrders(this.currentPage());
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
