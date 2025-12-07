import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StudentListComponent} from './components/student-list/student-list.component';
import {StudentFormComponent} from './components/student-form/student-form.component';
import {OrderListComponent} from './components/order-list/order-list.component';
import {OrderFormComponent} from './components/order-form/order-form.component';
import {Student} from './models/student.model';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    StudentListComponent,
    StudentFormComponent,
    OrderListComponent,
    OrderFormComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  selectedStudent = signal<Student | null>(null);

  onStudentSelected(student: Student): void {
    this.selectedStudent.set(student);
  }
}
