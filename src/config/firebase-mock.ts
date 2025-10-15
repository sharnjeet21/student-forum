// Mock Firebase for development/testing
// Replace this with real Firebase config when ready

export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    // Mock user for testing
    setTimeout(() => {
      callback({
        uid: 'mock-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      })
    }, 100)
    return () => {} // unsubscribe function
  }
}

export const db = {}
export const storage = {}

const app = {}
export default app