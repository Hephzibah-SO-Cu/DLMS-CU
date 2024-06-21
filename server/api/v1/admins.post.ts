import { createUserAuth, createUserData } from '~/server/utils';
import { userSchema } from '../../../utils/validations';
import { User } from '~/types';


export default defineEventHandler(async (event) => {
  try {
    const body = await readValidatedBody(event, userSchema.safeParse)
    if (!body.success) {
      throw createError({
        statusCode: 400,
        data: body.error.formErrors.fieldErrors
      })

    }
    const { email, firstName, lastName, role } = body.data
    const displayName = `${lastName.toLowerCase()} ${firstName.toLowerCase()}`

    const authUser = await createUserAuth({
      displayName,
      email,
      role
    })

    const createdUser: User = {
      name: displayName,
      email,
      role,
      createdAt: new Date().toISOString(),
    }
    await createUserData(authUser.uid, createdUser)

    return {
      message: 'Admin Created Successfully',
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


