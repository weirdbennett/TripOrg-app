const getBackendUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
  if (apiUrl.startsWith('http')) {
    return apiUrl.replace(/\/api\/v1$/, '');
  }
  return '';
};

// Resolves relative avatar paths to full URLs for the backend
export const getAvatarUrl = (avatar: string | undefined | null): string | null => {
  if (!avatar) return null;
  
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  if (avatar.startsWith('/api/')) {
    return getBackendUrl() + avatar;
  }
  
  return avatar;
};
