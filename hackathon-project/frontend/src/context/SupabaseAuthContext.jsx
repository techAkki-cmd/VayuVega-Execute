import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SupabaseAuthContext = createContext({});

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Track admin status
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async (sessionUser) => {
      if (sessionUser) {
        const { data, error } = await supabase
          .from("users")
          .select("is_admin")
          .eq("email", sessionUser.email)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.is_admin || false);
        }
      }
    };

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      fetchUserData(session?.user);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      fetchUserData(session?.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (username, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Store user details in the `users` table
      await supabase.from("users").insert([{ username, email, password }]);

      toast.success("Check your email for the confirmation link!");
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch `is_admin` status
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("email", email)
        .single();

      if (userError) {
        console.error("Error fetching admin status:", userError);
        setIsAdmin(false);
      } else {
        setIsAdmin(userData?.is_admin || false);
      }

      toast.success("Signed in successfully!");
      navigate("/dashboard");
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setIsAdmin(false);
      toast.success("Signed out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    isAdmin,
    loading,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error(
      "useSupabaseAuth must be used within a SupabaseAuthProvider"
    );
  }
  return context;
};
