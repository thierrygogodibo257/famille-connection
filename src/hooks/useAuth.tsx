import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants/routes';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  signOut: async () => {},
  signIn: async () => {},
  signUp: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    let unsub: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        setError(null);
        // 1. Vérifier la session existante
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
        // 2. Configurer le listener d'état d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mounted) return;
            setSession(newSession);
            setUser(newSession?.user ?? null);
            if (event === 'SIGNED_OUT') {
              // Nettoyer le stockage local
              localStorage.removeItem('supabase.auth.token');
              sessionStorage.removeItem('supabase.auth.token');
              // Supprimer les cookies
              document.cookie.split(';').forEach(cookie => {
                const [name] = cookie.trim().split('=');
                if (name.includes('supabase') || name.includes('sb-')) {
                  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                }
              });
              navigate(ROUTES.AUTH.LOGIN);
            }
          }
        );
        unsub = () => subscription.unsubscribe();
      } catch (err) {
        if (mounted) {
          console.error('Auth initialization error:', err);
          setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    initializeAuth();
    return () => {
      mounted = false;
      if (unsub) unsub();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err : new Error('Erreur lors de la déconnexion'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err : new Error('Erreur lors de la connexion'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err : new Error('Erreur lors de l\'inscription'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    error,
    signOut,
    signIn,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
