import { getFirestore } from 'firebase-admin/firestore'
import { AnsweredAssessment, Assessment } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const { studentId } = getQuery(event)
    if (!studentId) {
      throw createError({
        message: 'Student ID is required',
        status: 400,
      });
    }

    if (!id) {
      throw createError({
        message: 'Assessment ID is required',
        status: 400,
      });
    }
    const assessment = await getAssesmentData(id);
    const score = await getStudentScore(id, studentId as string);
    const total = `Total Score: ${score} / ${assessment.questions.length}`
    return {
      total,
      hasDone: !!score,
      assessment,
    };
  } catch (error: any) {
    throw createError({
      message: error.message,
      status: error.status || 500,
    });

  }
})

export async function getAssesmentData(assessmentId: string) {
  const db = getFirestore();
  const assessmentData = await db.collection('assessments').doc(assessmentId).get();
  if (assessmentData.exists) {
    const data = assessmentData.data() as Assessment;
    const questions = data.questions.map(({ id, question, options }) => {
      return {
        id,
        question,
        options: options.map(({ option }) => ({ option }))
      }
    })
    const result: Assessment = {
      id: assessmentData.id,
      ...data,
      questions,
    }
    return result
  } else {
    throw createError({
      message: 'Assessment not found',
      status: 404,
    });
  }
}

export async function getStudentScore(assessmentId: string, studentId: string) {
  const db = getFirestore();
  const answeredAssessmentRef = db.collection('answeredassessments').doc(assessmentId);
  const answeredAssessmentData = await answeredAssessmentRef.get();

  if (answeredAssessmentData.exists) {
    const data = answeredAssessmentData.data() as AnsweredAssessment;
    if (data.studentIds.includes(studentId)) {
      const studentData = data.students.find(student => student.studentId === studentId);
      return studentData ? studentData.score : null;
    }
  }

  return null;
}