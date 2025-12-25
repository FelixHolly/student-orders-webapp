import { Component, OnInit, Output, EventEmitter, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { StudentFormComponent } from '../student-form/student-form.component';
import { AddButton } from '../add-button/add-button';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, StudentFormComponent, AddButton],
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

  private destroyRef = inject(DestroyRef);

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.studentService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (students) => {
        this.students.set(students);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load students');
        this.loading.set(false);
      }
    });
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
