import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { user, token, isAuthenticated, setUser, setToken, logout: logoutStore } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { user, token } = response.data.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      const { user, token } = response.data.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      navigate('/');
    },
  });

  const logout = () => {
    authApi.logout().finally(() => {
      logoutStore();
      localStorage.removeItem('token');
      queryClient.clear();
      navigate('/login');
    });
  };

  return {
    user,
    token,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error,
  };
};
