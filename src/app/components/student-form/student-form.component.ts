import { Component, Input, Output, EventEmitter, signal, DestroyRef, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Student, CreateStudentRequest, UpdateStudentRequest } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnChanges {
  @Input() student: Student | null = null;
  @Output() studentCreated = new EventEmitter<Student>();
  @Output() studentUpdated = new EventEmitter<Student>();
  @Output() cancelled = new EventEmitter<void>();

  studentForm: FormGroup;
  submitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  private destroyRef = inject(DestroyRef);

  get isEditMode(): boolean {
    return !!this.student?.id;
  }

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService
  ) {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      grade: ['', [Validators.required, Validators.maxLength(20)]],
      school: ['', [Validators.required, Validators.maxLength(150)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student'] && this.student) {
      this.studentForm.patchValue({
        name: this.student.name,
        grade: this.student.grade,
        school: this.student.school
      });
    }
  }

  onCancel(): void {
    this.studentForm.reset();
    this.cancelled.emit();
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    if (this.isEditMode && this.student?.id) {
      const request: UpdateStudentRequest = {
        name: this.studentForm.value.name,
        grade: this.studentForm.value.grade,
        school: this.studentForm.value.school
      };

      this.studentService.update(this.student.id, request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (student) => {
          this.studentUpdated.emit(student);
          this.studentForm.reset();
          this.submitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to update student');
          this.submitting.set(false);
        }
      });
    } else {
      const request: CreateStudentRequest = {
        name: this.studentForm.value.name,
        grade: this.studentForm.value.grade,
        school: this.studentForm.value.school
      };

      this.studentService.create(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (student) => {
          this.studentCreated.emit(student);
          this.studentForm.reset();
          this.submitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to create student');
          this.submitting.set(false);
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.studentForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must not exceed ${maxLength} characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      grade: 'Grade',
      school: 'School'
    };
    return labels[fieldName] || fieldName;
  }

  hasError(fieldName: string): boolean {
    const field = this.studentForm.get(fieldName);
    return !!(field?.touched && field?.invalid);
  }
}
