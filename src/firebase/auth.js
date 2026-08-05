import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './config'

/**
 * Verifica si el usuario autenticado tiene role: admin en Firestore.
 * Soporta documento en users/{uid} o users/{email}.
 */
export async function fetchAdminProfile(user) {
  if (!user || !db) return null

  const candidates = [user.uid]
  if (user.email) {
    candidates.push(user.email)
    const lower = user.email.toLowerCase()
    if (lower !== user.email) candidates.push(lower)
  }

  for (const id of candidates) {
    const snap = await getDoc(doc(db, 'users', id))
    if (!snap.exists()) continue
    const data = snap.data()
    if (data.role === 'admin') {
      return {
        uid: user.uid,
        email: user.email || data.email || '',
        name: data.name || '',
        role: 'admin',
        docId: snap.id,
      }
    }
  }

  return null
}

export async function loginAdmin(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase no está configurado')
  }

  const cred = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  )
  const profile = await fetchAdminProfile(cred.user)

  if (!profile) {
    await signOut(auth)
    throw new Error(
      'Tu usuario no tiene rol admin. Creá el documento en Firestore: users/{uid} con { role: "admin", email: "..." }',
    )
  }

  return profile
}

export async function logoutAdmin() {
  if (auth) await signOut(auth)
}

export function subscribeAdminAuth(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null)
      return
    }
    try {
      const profile = await fetchAdminProfile(user)
      if (!profile) {
        await signOut(auth)
        callback(null)
        return
      }
      callback(profile)
    } catch (err) {
      console.error(err)
      callback(null)
    }
  })
}
