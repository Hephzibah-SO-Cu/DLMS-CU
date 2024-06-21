import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { z } from "zod"

const schema = z.object({
  uid: z.string().min(5,'UID is required')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, schema.safeParse)
    if (!body.success) {
      throw createError({
        statusCode: 400,
        data: body.error.formErrors.fieldErrors
      })

    }
    const auth = getAuth()
    const db = getFirestore()

    const { uid } = body.data
    await auth.deleteUser(uid)
    await db.collection('users').doc(uid).delete()
    return {
      message: 'User deleted successfully',
      statusCode: 200
    }
  } catch (error: any) {
    console.log(error);

    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})
