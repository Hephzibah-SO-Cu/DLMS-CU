import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { User } from "~/types"

export async function createUserData(uId: string, data: User) {
    try {
        const db = getFirestore()
        const userRef = db.collection('users').doc(uId)
        await userRef.create(data)
    } catch (error: any) {
        throw createError({
            message: error.message
        })
    }
}

export async function createUserAuth(data: { email: string, displayName: string, role: 'student' | 'admin' | 'instructor' }) {
    try {
        const auth = getAuth()
        const password = '123456789'


        const user = await auth.createUser({
            email: data.email,
            displayName: data.displayName,
            password
        })

        await auth.setCustomUserClaims(user.uid, {
            role: data.role
        })
        return user
    } catch (error: any) {
        throw createError({
            message: error.message
        })
    }
}

export async function deleteUserAuth(uid: string): Promise<void> {
    const auth = getAuth();
    await auth.deleteUser(uid);
}