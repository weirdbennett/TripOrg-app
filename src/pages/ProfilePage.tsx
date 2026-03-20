import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { apiAdapter } from '@/services/apiAdapter';
import { getAvatarUrl } from '@/utils/avatar';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, refreshUser } = useUser();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    themePreference: theme,
  });

  // Sync formData with user when user changes (to reflect current settings)
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        email: user.email,
        themePreference: theme,
      });
    }
  }, [user, theme]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        email: formData.email,
      });
      setTheme(formData.themePreference);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);
    try {
      await apiAdapter.uploadAvatar(user.id, file);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user || !user.avatar) return;
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    setIsUploadingAvatar(true);
    setError(null);
    try {
      await apiAdapter.deleteAvatar(user.id);
      await refreshUser();
    } catch (err) {
      console.error('Failed to delete avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile</h1>

      {/* Avatar Section */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <div 
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden border-4 border-primary-200 dark:border-primary-800"
            >
              {getAvatarUrl(user.avatar) ? (
                <img 
                  src={getAvatarUrl(user.avatar)!} 
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-gray-500 dark:text-gray-400 font-semibold">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {isUploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Profile Photo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Click the image to upload a new photo. Max 5MB.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAvatarClick} disabled={isUploadingAvatar}>
                {user.avatar ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {user.avatar && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={handleDeleteAvatar}
                  disabled={isUploadingAvatar}
                  className="text-red-600 dark:text-red-400"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 text-sm">
              Profile updated successfully!
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
            />
          </div>

          <Input
            label="Display Name"
            value={formData.displayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />

          <Select
            label="Theme Preference"
            value={formData.themePreference}
            onChange={(e) => handleChange('themePreference', e.target.value)}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
