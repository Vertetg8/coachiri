import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error.message);
          return;
        }
        
        if (sessionData?.session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', sessionData.session.user.id)
            .single();
            
          if (userError) {
            console.error('Error fetching user data:', userError.message);
            return;
          }
          
          if (userData) {
            setUser({
              user_id: userData.user_id,
              email: userData.email,
            });
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser({
          user_id: session.user.id,
          email: session.user.email || '',
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }
      
      const { data, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (userError) {
        return { error: userError.message };
      }
      
      setUser({
        user_id: data.user_id,
        email: data.email,
      });
      
      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return { error: 'Invalid admin credentials' };
      }

      // Simple password check (Note: In a real app, use proper password hashing)
      if (data.password !== password) {
        return { error: 'Invalid admin credentials' };
      }

      setIsAdmin(true);
      setUser({
        user_id: data.admin_id,
        email: data.email,
      });

      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { error: 'Email already in use' };
      }

      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        return { error: signUpError.message };
      }

      if (authData.user) {
        const { error: insertError } = await supabase.from('users').insert({
          user_id: authData.user.id,
          email,
          password: 'hashed_password', // In real app, never store plain text passwords
          registration_date: new Date().toISOString(),
        });

        if (insertError) {
          return { error: insertError.message };
        }

        setUser({
          user_id: authData.user.id,
          email,
        });
      }

      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    loading,
    isAdmin,
    login,
    adminLogin,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};