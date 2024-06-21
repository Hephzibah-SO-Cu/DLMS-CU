
export interface User {
  id?: string
  name: string,
  email: string,
  role: 'admin' | 'student' | 'instructor',
  createdAt?: string
  updatedAt?: string
  passwordChanged?: boolean
}

export interface Course {
  id?: string
  title: string
  description: string
  createdAt?: string
  updatedAt?: string
  instructorId: string
}

export interface CourseResource {
  id?: string
  title: string
  url: string
  storageId: string
  createdAt?: string
  updatedAt?: string
  courseId: string
  instructorId?: string
}

export interface EnrolledStudent extends User {
  enrolledAt?: string
}

export interface EnrolledCourse {
  id?: string
  title: string
  courseId: string
  studentIds: string[]
  students: {
    studentId: string
    enrolledAt: string
  }[]
  instructorId: string
  createdAt?: string
  updatedAt?: string
}

export interface Assessment {
  id?: string
  title: string;
  questions: Question[];
  courseId: string
  instructorId: string
  createdAt?: string
  updatedAt?: string
}

export interface Question {
  options: {
    option: string;
    isCorrect?: boolean;
  }[];
  question: string;
  id?: string
}

export interface AnsweredAssessment {
  id?: string
  title: string
  assessmentId: string
  courseId: string
  studentIds: string[]
  students: {
    studentId: string
    score: number
    answeredAt: string
  }[]
  instructorId: string
  createdAt?: string
  updatedAt?: string
}

export interface Assignment {
  id?: string;
  title: string;
  description: string;
  courseId: string;
  instructorId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmittedAssignment extends Assignment {
  assignmentId: string;
  studentIds: string[];
  students: {
    studentId: string;
    url: string;
    storageId: string;
    submittedAt: string;
  }[];
}


// assignments/assignmentId/
/*
  {
    couresId: string
    instructorId: string
    title: string
    createdAt: string
    updatedAt: string
    
  }
*/