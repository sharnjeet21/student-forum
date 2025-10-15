import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../config/firebase'
import { User } from '../../types'
import toast from 'react-hot-toast'

interface ProfileSettingsProps {
  user: User
}

interface ProfileForm {
  displayName: string
  bio: string
  location: string
  website: string
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const { firebaseUser } = useAuth()
  const [loading, setLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      displayName: user.displayName,
      bio: '',
      location: '',
      website: ''
    }
  })

  const onSubmit = async (data: ProfileForm) => {
    if (!firebaseUser) return

    setLoading(true)
    try {
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: data.displayName
      })

      // Update Firestore user document
      const userRef = doc(db, 'users', user.id)
      await updateDoc(userRef, {
        displayName: data.displayName,
        bio: data.bio,
        location: data.location,
        website: data.website,
        updatedAt: new Date()
      })

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
          <p className="text-gray-600">Update your personal information and preferences</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              {...register('displayName', { required: 'Display name is required' })}
              type="text"
              className="input-modern"
              placeholder="Your display name"
            />
            {errors.displayName && (
              <p className="mt-2 text-sm text-red-600">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input-modern bg-gray-50 cursor-not-allowed"
            />
            <p className="mt-2 text-sm text-gray-500">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              className="input-modern resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                {...register('location')}
                type="text"
                className="input-modern"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website
              </label>
              <input
                {...register('website')}
                type="url"
                className="input-modern"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Account Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Account Type:</span>
                <span className="font-medium text-blue-900">
                  {user.isAdmin ? 'Administrator' : 'Student'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Reputation:</span>
                <span className="font-medium text-blue-900">{user.reputation} points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Member Since:</span>
                <span className="font-medium text-blue-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}