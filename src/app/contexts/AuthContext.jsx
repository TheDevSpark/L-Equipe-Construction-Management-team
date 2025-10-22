"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClinet';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist (PGRST116 error), create one automatically
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile for user:', userId);
          await createProfileForExistingUser(userId);
          return;
        }
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createProfileForExistingUser = async (userId) => {
    try {
      setProfileLoading(true);
      
      // Get user data from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user data:', userError);
        return;
      }

      // Create profile with available data
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          // Don't specify role - let database use default value
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile for existing user:', error);
        return;
      }

      console.log('Profile created successfully for existing user');
      setProfile(data);
    } catch (error) {
      console.error('Error creating profile for existing user:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/auth/signin');
  };

  const createProfile = async (userData, additionalData = {}) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userData.id,
          email: userData.email,
          first_name: userData.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: userData.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          // Don't specify role - let database use default value
          ...additionalData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return { error };
      }

      setProfile(data);
      return { data };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { error };
      }

      setProfile(data);
      return { data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    profileLoading,
    signOut,
    createProfile,
    updateProfile,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
