import { useApp } from '../context/AppContext';

export const useAuth = () => {
  const {
    currentUser,
    userProfile,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile
  } = useApp();

  return {
    user: currentUser,
    profile: userProfile,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };
};
