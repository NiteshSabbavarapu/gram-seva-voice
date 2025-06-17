
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  SUPERVISOR_MOBILE, 
  ADMIN_MOBILE, 
  SUPERVISOR_NAME, 
  ADMIN_NAME, 
  SUPERVISOR_ROLE, 
  ADMIN_ROLE, 
  LOCATION_NAME,
  COLLEGE_SUPERVISOR_MOBILE,
  COLLEGE_SUPERVISOR_NAME,
  COLLEGE_SUPERVISOR_ROLE,
  COLLEGE_LOCATION_NAME
} from "@/constants/authConstants";

// Fixed OTP for all users
const FIXED_OTP = "123456";

export const useAuthLogin = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Track user roles including college supervisor
  const getSpecialUser = (phone: string) => {
    if (phone === SUPERVISOR_MOBILE) {
      return { name: SUPERVISOR_NAME, role: SUPERVISOR_ROLE as "employee" | "admin" | "citizen" };
    }
    if (phone === COLLEGE_SUPERVISOR_MOBILE) {
      return { name: COLLEGE_SUPERVISOR_NAME, role: COLLEGE_SUPERVISOR_ROLE as "employee" | "admin" | "citizen" };
    }
    if (phone === ADMIN_MOBILE) {
      return { name: ADMIN_NAME, role: ADMIN_ROLE as "employee" | "admin" | "citizen" };
    }
    return null;
  };

  const ensureSpecialUser = async (phone: string) => {
    const specialUser = getSpecialUser(phone);
    if (!specialUser) return;
    
    const { name, role } = specialUser;
    await supabase.from("users").upsert(
      [{ name, phone, role }], 
      { onConflict: "phone" }
    );
    
    // Handle location assignments for supervisors
    if (phone === SUPERVISOR_MOBILE) {
      let locRes = await supabase.from("locations").select("id").eq("name", LOCATION_NAME).maybeSingle();
      let locId = locRes?.data?.id;
      if (!locId) {
        const insertLoc = await supabase
          .from("locations")
          .insert([{ name: LOCATION_NAME, type: "city" }])
          .select("id")
          .single();
        locId = insertLoc.data?.id;
      }
      const userRes = await supabase.from("users").select("id").eq("phone", SUPERVISOR_MOBILE).maybeSingle();
      const userId = userRes?.data?.id;
      if (userId && locId) {
        await supabase
          .from("employee_assignments")
          .upsert([{ user_id: userId, location_id: locId }], { onConflict: "user_id,location_id" });
      }
    }

    // Handle college supervisor assignment
    if (phone === COLLEGE_SUPERVISOR_MOBILE) {
      let locRes = await supabase.from("locations").select("id").eq("name", COLLEGE_LOCATION_NAME).maybeSingle();
      let locId = locRes?.data?.id;
      if (!locId) {
        const insertLoc = await supabase
          .from("locations")
          .insert([{ name: COLLEGE_LOCATION_NAME, type: "city" }])
          .select("id")
          .single();
        locId = insertLoc.data?.id;
      }
      const userRes = await supabase.from("users").select("id").eq("phone", COLLEGE_SUPERVISOR_MOBILE).maybeSingle();
      const userId = userRes?.data?.id;
      if (userId && locId) {
        await supabase
          .from("employee_assignments")
          .upsert([{ user_id: userId, location_id: locId }], { onConflict: "user_id,location_id" });
      }
    }
  };

  // Check if user exists in database and get their name
  const getExistingUserName = async (phone: string) => {
    const { data: user } = await supabase
      .from("users")
      .select("name")
      .eq("phone", phone)
      .maybeSingle();
    
    return user?.name || null;
  };

  const sendOTP = async (phone: string) => {
    setIsLoading(true);
    console.log("Sending fixed OTP for phone:", "+91" + phone);
    
    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "OTP Sent!",
      description: `A verification code was sent to +91${phone}. Use ${FIXED_OTP} to login.`,
      className: "bg-green-50 text-green-800 border-green-200"
    });
    
    setIsLoading(false);
    return { success: true };
  };

  const verifyOTP = async (phone: string, otp: string) => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive"
      });
      return { success: false };
    }
    
    if (otp !== FIXED_OTP) {
      toast({
        title: "Invalid OTP",
        description: `Please enter the correct OTP: ${FIXED_OTP}`,
        variant: "destructive"
      });
      return { success: false };
    }
    
    setIsLoading(true);
    console.log("Verifying fixed OTP for phone:", "+91" + phone);
    
    // Check if user exists and get their name
    const existingName = await getExistingUserName(phone);
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsLoading(false);
    return { success: true, existingName };
  };

  const completeLogin = async (phone: string, finalName?: string, closeModal = true, onClose?: () => void) => {
    const specialUser = getSpecialUser(phone);
    const loginName = specialUser?.name || finalName?.trim();
    
    if (!loginName) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive"
      });
      return false;
    }

    // Save user data to database for non-special users
    if (!specialUser) {
      await supabase
        .from("users")
        .upsert([{ phone, name: loginName, role: "citizen" }], { onConflict: "phone" });
    }
    
    login(phone, loginName);

    toast({
      title: "Welcome!",
      description: `Logged in successfully as ${loginName}`,
      className: "bg-green-50 text-green-800 border-green-200"
    });

    // Navigation logic
    if (phone === ADMIN_MOBILE) {
      onClose?.();
      navigate("/admin-dashboard");
    } else if (phone === SUPERVISOR_MOBILE || phone === COLLEGE_SUPERVISOR_MOBILE) {
      onClose?.();
      navigate("/official-login");
    } else {
      if (closeModal) onClose?.();
    }
    
    return true;
  };

  return {
    isLoading,
    sendOTP,
    verifyOTP,
    completeLogin,
    ensureSpecialUser,
    getSpecialUser,
    getExistingUserName
  };
};
