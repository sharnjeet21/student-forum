import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const PasswordChange: React.FC = () => {
  const { firebaseUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<PasswordForm>()
  const newPassword = watch('newPassword')

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const onSubmit = async (data: PasswordForm) => {
    if (!firebaseUser || !firebaseUser.email) {
      toast.error('User not authenticated')
      return
    }

    setLoading(true)
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(firebaseUser.email, data.currentPassword)
      await reauthenticateWithCredential(firebaseUser, credential)

      // Update password
      await updatePassword(firebaseUser, data.newPassword)

      toast.success('Password updated successfully!')
      reset()
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect')
      } else if (error.code === 'auth/weak-password') {
        toast.error('New password is too weak')
      } else {
        toast.error(error.message || 'Failed to update password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              <p className="text-gray-600">Update your password to keep your account secure</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <input
                {...register('currentPassword', { required: 'Current password is required' })}
                type={showPasswords.current ? 'text' : 'password'}
                className="input-modern pr-12"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                {...register('newPassword', { 
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type={showPasswords.new ? 'text' : 'password'}
                className="input-modern pr-12"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword', { 
                  required: 'Please confirm your new password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                type={showPasswords.confirm ? 'text' : 'password'}
                className="input-modern pr-12"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Password Requirements</h3>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li className="flex items-center">
                <span className="mr-2">•</span>
                At least 6 characters long
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Mix of letters, numbers, and symbols recommended
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Avoid using personal information
              </li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Security Notice
            </h3>
            <p className="text-sm text-blue-800">
              After changing your password, you'll remain logged in on this device. 
              You may need to log in again on other devices.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => reset()}
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
                  Updating...
                </span>
              ) : (
                <span className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Update Password
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}