import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentService: jasmine.SpyObj<StudentService>;

  const mockStudents: Student[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      grade: '9th Grade',
      school: 'Springfield High',
      createdAt: '2024-12-08T10:00:00'
    },
    {
      id: 2,
      name: 'Bob Smith',
      grade: '10th Grade',
      school: 'Riverside Academy',
      createdAt: '2024-12-08T10:05:00'
    }
  ];

  beforeEach(async () => {
    const studentServiceSpy = jasmine.createSpyObj('StudentService', ['getAll']);

    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        { provide: StudentService, useValue: studentServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    studentService = TestBed.inject(StudentService) as jasmine.SpyObj<StudentService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load students on initialization', () => {
      studentService.getAll.and.returnValue(of(mockStudents));

      fixture.detectChanges(); // Triggers ngOnInit

      expect(studentService.getAll).toHaveBeenCalled();
      expect(component.students()).toEqual(mockStudents);
      expect(component.loading()).toBeFalsy();
    });

    it('should handle empty student list', () => {
      studentService.getAll.and.returnValue(of([]));

      fixture.detectChanges();

      expect(component.students()).toEqual([]);
      expect(component.students().length).toBe(0);
    });

    it('should handle error when loading students', () => {
      const errorResponse = {
        error: { message: 'Failed to load students' }
      };

      studentService.getAll.and.returnValue(throwError(() => errorResponse));

      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Failed to load students');
      expect(component.loading()).toBeFalsy();
      expect(component.students().length).toBe(0);
    });

    it('should handle error without message', () => {
      const errorResponse = { error: {} };

      studentService.getAll.and.returnValue(throwError(() => errorResponse));

      fixture.detectChanges();

      expect(component.errorMessage()).toBe('Failed to load students');
    });
  });

  describe('loadStudents', () => {
    beforeEach(() => {
      studentService.getAll.and.returnValue(of(mockStudents));
      fixture.detectChanges();
    });

    it('should set loading state while fetching', () => {
      studentService.getAll.and.returnValue(of(mockStudents));

      component.loadStudents();

      expect(component.loading()).toBeFalsy(); // Synchronous in test
    });

    it('should clear error message before loading', () => {
      component.errorMessage.set('Previous error');
      studentService.getAll.and.returnValue(of(mockStudents));

      component.loadStudents();

      expect(component.errorMessage()).toBe('');
    });

    it('should update students list on success', () => {
      const newStudents: Student[] = [
        {
          id: 3,
          name: 'Charlie Brown',
          grade: '11th Grade',
          school: 'Lincoln High'
        }
      ];

      studentService.getAll.and.returnValue(of(newStudents));

      component.loadStudents();

      expect(component.students()).toEqual(newStudents);
    });
  });

  describe('selectStudent', () => {
    beforeEach(() => {
      studentService.getAll.and.returnValue(of(mockStudents));
      fixture.detectChanges();
    });

    it('should set selected student', () => {
      const student = mockStudents[0];

      component.selectStudent(student);

      expect(component.selectedStudent()).toEqual(student);
    });

    it('should emit studentSelected event', (done) => {
      const student = mockStudents[0];

      component.studentSelected.subscribe((selectedStudent) => {
        expect(selectedStudent).toEqual(student);
        done();
      });

      component.selectStudent(student);
    });

    it('should change selected student when selecting different student', () => {
      component.selectStudent(mockStudents[0]);
      expect(component.selectedStudent()).toEqual(mockStudents[0]);

      component.selectStudent(mockStudents[1]);
      expect(component.selectedStudent()).toEqual(mockStudents[1]);
    });
  });

  describe('isSelected', () => {
    beforeEach(() => {
      studentService.getAll.and.returnValue(of(mockStudents));
      fixture.detectChanges();
    });

    it('should return true for selected student', () => {
      component.selectStudent(mockStudents[0]);

      expect(component.isSelected(mockStudents[0])).toBeTruthy();
    });

    it('should return false for non-selected student', () => {
      component.selectStudent(mockStudents[0]);

      expect(component.isSelected(mockStudents[1])).toBeFalsy();
    });

    it('should return false when no student is selected', () => {
      expect(component.isSelected(mockStudents[0])).toBeFalsy();
    });
  });

  describe('onStudentCreated', () => {
    beforeEach(() => {
      studentService.getAll.and.returnValue(of(mockStudents));
      fixture.detectChanges();
    });

    it('should add new student to the list', () => {
      const newStudent: Student = {
        id: 3,
        name: 'Charlie Brown',
        grade: '11th Grade',
        school: 'Lincoln High',
        createdAt: '2024-12-08T11:00:00'
      };

      const initialCount = component.students().length;

      component.onStudentCreated(newStudent);

      expect(component.students().length).toBe(initialCount + 1);
      expect(component.students()).toContain(newStudent);
    });

    it('should hide add form after student creation', () => {
      const newStudent: Student = {
        id: 3,
        name: 'Charlie Brown',
        grade: '11th Grade',
        school: 'Lincoln High'
      };

      component.showAddForm.set(true);

      component.onStudentCreated(newStudent);

      expect(component.showAddForm()).toBeFalsy();
    });

    it('should preserve existing students when adding new one', () => {
      const newStudent: Student = {
        id: 3,
        name: 'Charlie Brown',
        grade: '11th Grade',
        school: 'Lincoln High'
      };

      component.onStudentCreated(newStudent);

      expect(component.students()).toContain(mockStudents[0]);
      expect(component.students()).toContain(mockStudents[1]);
      expect(component.students()).toContain(newStudent);
    });
  });

  describe('toggleAddForm', () => {
    beforeEach(() => {
      studentService.getAll.and.returnValue(of(mockStudents));
      fixture.detectChanges();
    });

    it('should toggle showAddForm from false to true', () => {
      component.showAddForm.set(false);

      component.toggleAddForm();

      expect(component.showAddForm()).toBeTruthy();
    });

    it('should toggle showAddForm from true to false', () => {
      component.showAddForm.set(true);

      component.toggleAddForm();

      expect(component.showAddForm()).toBeFalsy();
    });

    it('should toggle multiple times correctly', () => {
      expect(component.showAddForm()).toBeFalsy();

      component.toggleAddForm();
      expect(component.showAddForm()).toBeTruthy();

      component.toggleAddForm();
      expect(component.showAddForm()).toBeFalsy();

      component.toggleAddForm();
      expect(component.showAddForm()).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null selected student when checking isSelected', () => {
      studentService.getAll.and.returnValue(of(mockStudents));
      fixture.detectChanges();

      component.selectedStudent.set(null);

      expect(component.isSelected(mockStudents[0])).toBeFalsy();
    });

    it('should handle student without id', () => {
      const studentWithoutId: Student = {
        name: 'No ID Student',
        grade: '9th Grade',
        school: 'Test School'
      };

      studentService.getAll.and.returnValue(of([studentWithoutId]));
      fixture.detectChanges();

      expect(component.students().length).toBe(1);
    });

    it('should handle selecting student without id', () => {
      const studentWithoutId: Student = {
        name: 'No ID Student',
        grade: '9th Grade',
        school: 'Test School'
      };

      studentService.getAll.and.returnValue(of([studentWithoutId]));
      fixture.detectChanges();

      component.selectStudent(studentWithoutId);

      expect(component.selectedStudent()).toEqual(studentWithoutId);
      expect(component.isSelected(studentWithoutId)).toBeTruthy();
    });
  });
});
