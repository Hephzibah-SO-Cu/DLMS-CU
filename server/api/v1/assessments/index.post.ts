import { z } from 'zod'
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { AnsweredAssessment, Assessment } from '~/types';


const schema = z.object({
  assessmentId: z.string().min(1, { message: 'Assessment ID is required' }),
  studentId: z.string().min(1, { message: 'Student ID is required' }),
  instructorId: z.string().min(1, { message: 'Instructor ID is required' }),
  title: z.string().min(1, { message: 'Title is required' }),
  courseId: z.string().min(1, { message: 'Course ID is required' }),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(
        z.object({
          option: z.string(),
          isCorrect: z.oboolean(),
        })
      ),
      answer: z.string().optional(),
    })
  ),
})

export default defineEventHandler(async (event) => {
  try {
    const { error, data } = await readValidatedBody(event, schema.safeParse)
    if (error) {
      throw createError({
        message: 'Invalid request body',
        status: 400,
      })
    }
    const { assessmentId, questions: userAnswers, instructorId, studentId, title, courseId } = data

    const result: Omit<AnsweredAssessment, 'studentIds' | 'students'> =
    {
      assessmentId,
      courseId,
      title,
      instructorId,
      createdAt: new Date().toISOString(),
    }
    const questionsData = await getQuestionsData(assessmentId);
    const score = userAnswers.reduce((acc, userAnswer) => {
      const question = questionsData.find(q => q.id === userAnswer.id);
      if (question) {
        const correctIndex = question.options.findIndex(option => option.isCorrect);
        if (userAnswer.answer === String(correctIndex)) {
          acc++;
        }
      }
      return acc;
    }, 0);

    storeAnsweredAssessmentData(assessmentId, studentId, score, result)

    return {
      score,
      totalQuestions: questionsData.length,
    }

  } catch (error: any) {
    throw createError({
      message: error.message,
      status: error.status || 500,
    })

  }
})

// function to get the questions data from firestore using the assessmentId
export async function getQuestionsData(assessmentId: string) {
  // fetch the questions data from firestore
  const db = getFirestore();

  // get the questions data from firestore
  const questionsData = await db.collection('assessments').doc(assessmentId).get();
  if (questionsData.exists) {
    const data = questionsData.data() as Assessment;
    return data.questions;
  } else {
    throw createError({
      message: 'Assessment not found',
      status: 404,
    });
  }
}


export async function storeAnsweredAssessmentData(assessmentId: string, studentId: string, score: number, data: any) {
  const db = getFirestore();
  const answeredAssessmentRef = db.collection('answeredassessments').doc(assessmentId);
  const answeredAssessmentData = await answeredAssessmentRef.get();

  if (answeredAssessmentData.exists) {
    const answeredAssessment = answeredAssessmentData.data() as AnsweredAssessment ;

    let students = answeredAssessment.students || [];

    const studentIndex = students.findIndex((student: any) => student.studentId === studentId);

    if (studentIndex > -1) {
      // Update existing student's score
      students[studentIndex] = {
        ...students[studentIndex],
        score,
        answeredAt: new Date().toISOString()
      };
    } else {
      // Add new student
      students.push({
        studentId,
        score,
        answeredAt: new Date().toISOString(),
        ...data // Assuming 'data' includes other relevant fields
      });
    }

    await answeredAssessmentRef.update({
      studentIds: FieldValue.arrayUnion(studentId),
      students
    });
  } else {
    // Create new document
    await answeredAssessmentRef.set({
      studentIds: [studentId],
      students: [{
        studentId,
        score,
        answeredAt: new Date().toISOString(),
        ...data // Assuming 'data' includes other relevant fields
      }],
      ...data // Assuming 'data' includes other relevant fields
    });
  }
}

