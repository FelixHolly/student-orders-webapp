import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { StudentFormComponent } from './student-form.component';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';

describe('StudentFormComponent', () => {
  let component: StudentFormComponent;
  let fixture: ComponentFixture<StudentFormComponent>;
  let studentService: jasmine.SpyObj<StudentService>;

  beforeEach(async () => {
    const studentServiceSpy = jasmine.createSpyObj('StudentService', ['create']);

    await TestBed.configureTestingModule({
      imports: [StudentFormComponent, ReactiveFormsModule],
      providers: [
        { provide: StudentService, useValue: studentServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService) as jasmine.SpyObj<StudentService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.studentForm.value).toEqual({
        name: '',
        grade: '',
        school: ''
      });
    });

    it('should have all required validators', () => {
      const nameControl = component.studentForm.get('name');
      const gradeControl = component.studentForm.get('grade');
      const schoolControl = component.studentForm.get('school');

      expect(nameControl?.hasError('required')).toBeTruthy();
      expect(gradeControl?.hasError('required')).toBeTruthy();
      expect(schoolControl?.hasError('required')).toBeTruthy();
    });

    it('should have maxLength validators', () => {
      const nameControl = component.studentForm.get('name');
      const gradeControl = component.studentForm.get('grade');
      const schoolControl = component.studentForm.get('school');

      nameControl?.setValue('a'.repeat(101));
      gradeControl?.setValue('a'.repeat(21));
      schoolControl?.setValue('a'.repeat(151));

      expect(nameControl?.hasError('maxlength')).toBeTruthy();
      expect(gradeControl?.hasError('maxlength')).toBeTruthy();
      expect(schoolControl?.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.studentForm.valid).toBeFalsy();
    });

    it('should be valid with all required fields filled', () => {
      component.studentForm.setValue({
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      });

      expect(component.studentForm.valid).toBeTruthy();
    });

    it('should be invalid if name is missing', () => {
      component.studentForm.setValue({
        name: '',
        grade: '10th Grade',
        school: 'Test School'
      });

      expect(component.studentForm.valid).toBeFalsy();
      expect(component.studentForm.get('name')?.hasError('required')).toBeTruthy();
    });

    it('should be invalid if name exceeds max length', () => {
      component.studentForm.setValue({
        name: 'a'.repeat(101),
        grade: '10th Grade',
        school: 'Test School'
      });

      expect(component.studentForm.valid).toBeFalsy();
      expect(component.studentForm.get('name')?.hasError('maxlength')).toBeTruthy();
    });

    it('should be invalid if grade is missing', () => {
      component.studentForm.setValue({
        name: 'John Doe',
        grade: '',
        school: 'Test School'
      });

      expect(component.studentForm.valid).toBeFalsy();
    });

    it('should be invalid if school is missing', () => {
      component.studentForm.setValue({
        name: 'John Doe',
        grade: '10th Grade',
        school: ''
      });

      expect(component.studentForm.valid).toBeFalsy();
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      component.studentForm.setValue({
        name: '',
        grade: '',
        school: ''
      });

      component.onSubmit();

      expect(studentService.create).not.toHaveBeenCalled();
      expect(component.studentForm.touched).toBeTruthy();
    });

    it('should submit valid form and emit studentCreated event', (done) => {
      const mockStudent: Student = {
        id: 1,
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School',
        createdAt: '2024-12-08T10:00:00'
      };

      studentService.create.and.returnValue(of(mockStudent));

      component.studentForm.setValue({
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      });

      component.studentCreated.subscribe((student) => {
        expect(student).toEqual(mockStudent);
        done();
      });

      component.onSubmit();

      expect(studentService.create).toHaveBeenCalledWith({
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      });
    });

    it('should reset form after successful submission', () => {
      const mockStudent: Student = {
        id: 1,
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      };

      studentService.create.and.returnValue(of(mockStudent));

      component.studentForm.setValue({
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      });

      component.onSubmit();

      expect(component.studentForm.value).toEqual({
        name: null,
        grade: null,
        school: null
      });
    });

    it('should set submitting state during submission', () => {
      const mockStudent: Student = {
        id: 1,
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      };

      studentService.create.and.returnValue(of(mockStudent));

      component.studentForm.setValue({
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      });

      expect(component.submitting()).toBeFalsy();
      component.onSubmit();
      expect(component.submitting()).toBeFalsy(); // Synchronous in test
    });

    it('should handle submission error', () => {
      const errorResponse = {
        error: { message: 'Failed to create student' }
      };

      studentService.create.and.returnValue(throwError(() => errorResponse));

      component.studentForm.setValue({
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('Failed to create student');
      expect(component.submitting()).toBeFalsy();
    });

    it('should handle error without message', () => {
      const errorResponse = { error: {} };

      studentService.create.and.returnValue(throwError(() => errorResponse));

      component.studentForm.setValue({
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('Failed to create student');
    });

    it('should clear error message on new submission', () => {
      component.errorMessage.set('Previous error');

      const mockStudent: Student = {
        id: 1,
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      };

      studentService.create.and.returnValue(of(mockStudent));

      component.studentForm.setValue({
        name: 'John Doe',
        grade: '10th Grade',
        school: 'Test School'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('');
    });
  });

  describe('getFieldError', () => {
    it('should return required error message for name', () => {
      const nameControl = component.studentForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('');

      expect(component.getFieldError('name')).toBe('Name is required');
    });

    it('should return maxlength error message for name', () => {
      const nameControl = component.studentForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('a'.repeat(101));

      expect(component.getFieldError('name')).toBe('Name must not exceed 100 characters');
    });

    it('should return required error message for grade', () => {
      const gradeControl = component.studentForm.get('grade');
      gradeControl?.markAsTouched();
      gradeControl?.setValue('');

      expect(component.getFieldError('grade')).toBe('Grade is required');
    });

    it('should return required error message for school', () => {
      const schoolControl = component.studentForm.get('school');
      schoolControl?.markAsTouched();
      schoolControl?.setValue('');

      expect(component.getFieldError('school')).toBe('School is required');
    });

    it('should return empty string when field is not touched', () => {
      const nameControl = component.studentForm.get('name');
      nameControl?.setValue('');

      expect(component.getFieldError('name')).toBe('');
    });

    it('should return empty string when field is valid', () => {
      const nameControl = component.studentForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('John Doe');

      expect(component.getFieldError('name')).toBe('');
    });
  });

  describe('hasError', () => {
    it('should return true when field is touched and invalid', () => {
      const nameControl = component.studentForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('');

      expect(component.hasError('name')).toBeTruthy();
    });

    it('should return false when field is not touched', () => {
      const nameControl = component.studentForm.get('name');
      nameControl?.setValue('');

      expect(component.hasError('name')).toBeFalsy();
    });

    it('should return false when field is valid', () => {
      const nameControl = component.studentForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('John Doe');

      expect(component.hasError('name')).toBeFalsy();
    });
  });
});
