import { createUserAuth, createUserData } from '~/server/utils';
import { userSchema } from './../../../utils/validations';
import { User } from '~/types';


export default defineEventHandler(async (event) => {

  try {
    const body = await readValidatedBody(event, userSchema.safeParse)
    if (!body.success) {
      throw createError({
        statusCode: 400,
        message: 'Wrong Data passed'
      })
    }

    const data = body.data
    const displayName = `${data.lastName.toLowerCase()} ${data.firstName.toLowerCase()}`
    const result = await createUserAuth({
      email: data.email.toLowerCase(),
      displayName,
    })
    const student = {
      name: displayName.toLowerCase(),
      email: data.email.toLowerCase(),
      role: 'student',
      createdAt: new Date().toISOString(),
      passwordChanged: false
    } as User
    await createUserData('users', result.uid, student)
    return {
      message: 'Student Created Successfully',
      statusCode: 200
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

})


