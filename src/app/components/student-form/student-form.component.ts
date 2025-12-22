import { Component, Output, EventEmitter, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent {
  @Output() studentCreated = new EventEmitter<Student>();

  studentForm: FormGroup;
  submitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  private destroyRef = inject(DestroyRef);

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

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const studentData = this.studentForm.value;

    this.studentService.create(studentData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
