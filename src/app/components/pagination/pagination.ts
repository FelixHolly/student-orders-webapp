import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  @Input() set currentPage(value: number) {
    this._currentPage.set(value);
  }
  @Input() set totalPages(value: number) {
    this._totalPages.set(value);
  }
  @Input() set totalElements(value: number) {
    this._totalElements.set(value);
  }
  @Input() set pageSize(value: number) {
    this._pageSize.set(value);
  }

  @Output() pageChange = new EventEmitter<number>();

  private _currentPage = signal(0);
  private _totalPages = signal(0);
  private _totalElements = signal(0);
  private _pageSize = signal(10);

  page = computed(() => this._currentPage());
  total = computed(() => this._totalPages());
  elements = computed(() => this._totalElements());
  size = computed(() => this._pageSize());

  visiblePages = computed(() => {
    const current = this._currentPage();
    const total = this._totalPages();
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 2) {
        pages.push(0, 1, 2, 3, -1, total - 1);
      } else if (current >= total - 3) {
        pages.push(0, -1, total - 4, total - 3, total - 2, total - 1);
      } else {
        pages.push(0, -1, current - 1, current, current + 1, -2, total - 1);
      }
    }

    return pages;
  });

  startItem = computed(() => {
    if (this._totalElements() === 0) return 0;
    return this._currentPage() * this._pageSize() + 1;
  });

  endItem = computed(() => {
    const end = (this._currentPage() + 1) * this._pageSize();
    return Math.min(end, this._totalElements());
  });

  goToPage(page: number): void {
    if (page >= 0 && page < this._totalPages() && page !== this._currentPage()) {
      this.pageChange.emit(page);
    }
  }

  previousPage(): void {
    if (this._currentPage() > 0) {
      this.pageChange.emit(this._currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this._currentPage() < this._totalPages() - 1) {
      this.pageChange.emit(this._currentPage() + 1);
    }
  }
}
