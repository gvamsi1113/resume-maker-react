import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
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
    console.log('[useAuth useEffect] Hook mounted, running checkAuthStatus.');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    console.log('[useAuth checkAuthStatus] Running...');
    try {
      const accessToken = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      console.log('[useAuth checkAuthStatus] localStorage accessToken:', accessToken);
      console.log('[useAuth checkAuthStatus] localStorage userData:', userData);

      if (accessToken && userData) {
        console.log('[useAuth checkAuthStatus] Token and user data FOUND. Setting authenticated.');
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          accessToken,
        });

        if (typeof window !== "undefined") {
            console.log('[useAuth checkAuthStatus] ABOUT TO DISPATCH myWebAppAuthSuccess (from checkAuthStatus)');
            const event = new CustomEvent('myWebAppAuthSuccess', {
              detail: { token: accessToken, source: 'checkAuthStatus' }
            });
            window.dispatchEvent(event);
            console.log('[useAuth checkAuthStatus] DISPATCHED myWebAppAuthSuccess (from checkAuthStatus)');
        }
      } else {
        console.log('[useAuth checkAuthStatus] Token or user data NOT found. Setting unauthenticated.');
        // Only dispatch logout if it was previously authenticated, to avoid spamming on initial load when not logged in.
        const previouslyAuthenticated = authState.isAuthenticated;
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          accessToken: null,
        });
        if (typeof window !== "undefined" && previouslyAuthenticated) {
            console.log('[useAuth checkAuthStatus] ABOUT TO DISPATCH myWebAppLogout (from checkAuthStatus - was previously authenticated)');
            const event = new CustomEvent('myWebAppLogout', { detail: {source: 'checkAuthStatus'} });
            window.dispatchEvent(event);
            console.log('[useAuth checkAuthStatus] DISPATCHED myWebAppLogout (from checkAuthStatus)');
        }
      }
    } catch (error) {
      console.error('[useAuth checkAuthStatus] Error parsing user data or other issue:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
      });
       if (typeof window !== "undefined" && authState.isAuthenticated) { // If an error occurs while previously authenticated
            console.log('[useAuth checkAuthStatus] ABOUT TO DISPATCH myWebAppLogout due to error (was previously authenticated)');
            const event = new CustomEvent('myWebAppLogout', { detail: {source: 'checkAuthStatusError'} });
            window.dispatchEvent(event);
            console.log('[useAuth checkAuthStatus] DISPATCHED myWebAppLogout due to error');
        }
    }
  };

  const login = (user: User, tokens: { access: string; }) => {
    console.log('[useAuth login] Attempting login. User:', user, 'Tokens:', tokens);

    if (!user || !tokens || !tokens.access) {
      console.error('[useAuth login] Invalid user or tokens received. Not updating localStorage or state.');
      setAuthState(prevState => ({
        ...prevState,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
      }));
      return;
    }

    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('user', JSON.stringify(user));
    console.log('[useAuth login] Stored in localStorage - access_token:', tokens.access);
    console.log('[useAuth login] Stored in localStorage - user:', JSON.stringify(user));

    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
      accessToken: tokens.access,
    });

    if (typeof window !== "undefined") {
        console.log('[useAuth login] ABOUT TO DISPATCH myWebAppAuthSuccess (from login)');
        const event = new CustomEvent('myWebAppAuthSuccess', {
          detail: { token: tokens.access, source: 'login' }
        });
        window.dispatchEvent(event);
        console.log('[useAuth login] DISPATCHED myWebAppAuthSuccess (from login)');
    }
  };

  const logout = () => {
    console.log('[useAuth logout] Logging out.');
    const tokenBeforeLogout = localStorage.getItem('access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    console.log('[useAuth logout] Removed tokens from localStorage.');

    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
    });

    if (typeof window !== "undefined") {
        console.log('[useAuth logout] ABOUT TO DISPATCH myWebAppLogout (from logout)');
        const event = new CustomEvent('myWebAppLogout', {detail: {source: 'logout', tokenExisted: !!tokenBeforeLogout}});
        window.dispatchEvent(event);
        console.log('[useAuth logout] DISPATCHED myWebAppLogout (from logout)');
    }
    // router.push('/login'); // Or your desired logout destination
  };

  const requireAuth = (redirectTo: string = '/login') => { // Changed default to /login
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