import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
  });
  
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    console.log('[useAuth checkAuthStatus] Running...');
    try {
      const accessToken = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      console.log('[useAuth checkAuthStatus] accessToken from localStorage:', accessToken);
      console.log('[useAuth checkAuthStatus] userData from localStorage:', userData);

      if (accessToken && userData) {
        console.log('[useAuth checkAuthStatus] Found token and user data. Setting authenticated.');
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          accessToken,
        });
      } else {
        console.log('[useAuth checkAuthStatus] Token or user data NOT found. Setting unauthenticated.');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          accessToken: null,
        });
      }
    } catch (error) {
      console.error('[useAuth checkAuthStatus] Error:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
      });
    }
  };

  const login = (user: User, tokens: { access: string; /* refresh token no longer passed here */ }) => {
    console.log('[useAuth login] Received user:', user);
    console.log('[useAuth login] Received tokens:', tokens);

    if (!user || !tokens || !tokens.access) {
        console.error('[useAuth login] Invalid user or tokens received. Not updating localStorage or state.');
        // Optionally, update state to reflect failed login attempt if desired
        setAuthState(prevState => ({
            ...prevState,
            isAuthenticated: false,
            isLoading: false, // Assuming loading is done after an attempt
            user: null,
            accessToken: null,
        }));
        return;
    }

    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('user', JSON.stringify(user));
    console.log('[useAuth login] Set localStorage. access_token:', localStorage.getItem('access_token'));
    console.log('[useAuth login] Set localStorage. user data:', localStorage.getItem('user'));
    
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      accessToken: tokens.access,
    });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
    });
  };

  const requireAuth = (redirectTo: string = '/register') => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push(redirectTo);
      return false;
    }
    return authState.isAuthenticated;
  };

  return {
    ...authState,
    login,
    logout,
    requireAuth,
    checkAuthStatus,
  };
}; 