export interface Student {
  id?: number;
  name: string;
  grade: string;
  school: string;
  createdAt?: string;
}

export interface CreateStudentRequest {
  name: string;
  grade: string;
  school: string;
}

export interface UpdateStudentRequest {
  name: string;
  grade: string;
  school: string;
}
