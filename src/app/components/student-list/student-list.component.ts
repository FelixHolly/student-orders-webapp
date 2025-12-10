import { Component, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.studentService.getAll().subscribe({
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
  }
}
