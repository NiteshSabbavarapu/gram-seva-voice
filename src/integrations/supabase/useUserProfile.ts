
import { useEffect, useState } from "react";
import { supabase } from "./client";
import type { Database } from "./types";

// This hook fetches the current logged-in user's profile (including role)
export function useUserProfile() {
  const [profile, setProfile] = useState<Database["public"]["Tables"]["users"]["Row"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(data ?? null);
      setLoading(false);
    };

    getProfile();
  }, []);

  return { profile, loading };
}
