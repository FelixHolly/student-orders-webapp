import { Component, OnInit, Output, EventEmitter, signal, DestroyRef, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { StudentFormComponent } from '../student-form/student-form.component';
import { AddButton } from '../add-button/add-button';
import { Pagination } from '../pagination/pagination';
import { StudentFilter } from '../../models/pagination.model';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, FormsModule, StudentFormComponent, AddButton, Pagination],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent implements OnInit {
  @Output() studentSelected = new EventEmitter<Student>();

  students = signal<Student[]>([]);
  selectedStudent = signal<Student | null>(null);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showAddForm = signal<boolean>(false);
  openMenuId = signal<number | null>(null);
  editingStudent = signal<Student | null>(null);

  // Pagination state
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(10);

  // Filter state
  searchName = signal('');
  filterGrade = signal('');
  filterSchool = signal('');

  hasActiveFilters = computed(() =>
    this.searchName().trim() !== '' ||
    this.filterGrade() !== '' ||
    this.filterSchool() !== ''
  );

  private destroyRef = inject(DestroyRef);

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(page: number = 0): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filter: StudentFilter = {};
    if (this.searchName().trim()) filter.name = this.searchName().trim();
    if (this.filterGrade()) filter.grade = this.filterGrade();
    if (this.filterSchool()) filter.school = this.filterSchool();

    this.studentService.getAll(
      { page, size: this.pageSize() },
      Object.keys(filter).length > 0 ? filter : undefined
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.students.set(response.content);
        this.currentPage.set(response.number);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load students');
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.loadStudents(page);
  }

  onSearch(): void {
    this.loadStudents(0);
  }

  clearFilters(): void {
    this.searchName.set('');
    this.filterGrade.set('');
    this.filterSchool.set('');
    this.loadStudents(0);
  }

  selectStudent(student: Student): void {
    this.selectedStudent.set(student);
    this.studentSelected.emit(student);
  }

  isSelected(student: Student): boolean {
    return this.selectedStudent()?.id === student.id;
  }

  onStudentCreated(student: Student): void {
    this.students.update(students => [...students, student]);
    this.showAddForm.set(false);
  }

  toggleAddForm(): void {
    this.showAddForm.update(value => !value);
    this.editingStudent.set(null);
  }

  toggleMenu(event: Event, studentId: number): void {
    event.stopPropagation();
    this.openMenuId.update(id => id === studentId ? null : studentId);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  editStudent(event: Event, student: Student): void {
    event.stopPropagation();
    this.editingStudent.set(student);
    this.showAddForm.set(true);
    this.openMenuId.set(null);
  }

  deleteStudent(event: Event, id: number): void {
    event.stopPropagation();
    this.openMenuId.set(null);

    this.studentService.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.students.update(students => students.filter(s => s.id !== id));
        if (this.selectedStudent()?.id === id) {
          this.selectedStudent.set(null);
        }
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to delete student');
      }
    });
  }

  onStudentUpdated(student: Student): void {
    this.students.update(students =>
      students.map(s => s.id === student.id ? student : s)
    );
    this.showAddForm.set(false);
    this.editingStudent.set(null);
  }

  onFormCancelled(): void {
    this.showAddForm.set(false);
    this.editingStudent.set(null);
  }
}
