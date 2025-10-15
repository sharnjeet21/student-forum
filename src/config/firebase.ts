import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyB8aOwIXPsB3xcO-DazRsh4oclVrYoDjAE",
  authDomain: "forum-4efb9.firebaseapp.com",
  projectId: "forum-4efb9",
  storageBucket: "forum-4efb9.firebasestorage.app",
  messagingSenderId: "35725923717",
  appId: "1:35725923717:web:c39f6ad8f3f1f7a7dc20ec"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app