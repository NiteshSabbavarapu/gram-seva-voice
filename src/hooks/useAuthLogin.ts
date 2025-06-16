
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SUPERVISOR_MOBILE, ADMIN_MOBILE, SUPERVISOR_NAME, ADMIN_NAME, SUPERVISOR_ROLE, ADMIN_ROLE, LOCATION_NAME } from "@/constants/authConstants";

export const useAuthLogin = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<null | {session: any}>(null);

  // Track user roles
  const getSpecialUser = (phone: string) =>
    phone === SUPERVISOR_MOBILE
      ? { name: SUPERVISOR_NAME, role: SUPERVISOR_ROLE as "employee" | "admin" | "citizen" }
      : phone === ADMIN_MOBILE
      ? { name: ADMIN_NAME, role: ADMIN_ROLE as "employee" | "admin" | "citizen" }
      : null;

  const ensureSpecialUser = async (phone: string) => {
    const specialUser = getSpecialUser(phone);
    if (!specialUser) return;
    
    const { name, role } = specialUser;
    await supabase.from("users").upsert(
      [{ name, phone, role }], 
      { onConflict: "phone" }
    );
    
    // Supervisor assignment logic
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
  };

  const sendOTP = async (phone: string) => {
    const specialUser = getSpecialUser(phone);
    
    // Special users demo bypass
    if (specialUser) {
      toast({
        title: "Demo Login",
        description: `Using demo login for ${specialUser.name}. Enter any 6-digit OTP.`,
        className: "bg-blue-50 text-blue-800 border-blue-200"
      });
      return { success: true };
    }

    setIsLoading(true);
    console.log("Attempting to send OTP to:", "+91" + phone);
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: "+91" + phone
      });
      
      console.log("OTP send response:", { data, error });
      
      if (error) {
        console.error("OTP send error:", error);
        
        if (error.message.includes("Unsupported phone provider")) {
          toast({
            title: "SMS Not Available",
            description: "SMS authentication is not configured for this project. Please use demo accounts (8000000001 or 9000000001) for testing.",
            variant: "destructive"
          });
        } else if (error.message.includes("SMS quota")) {
          toast({
            title: "SMS Quota Exceeded",
            description: "SMS quota has been exceeded. Please try again later or contact support.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "OTP Send Failed",
            description: error.message || "Failed to send OTP. Please try demo accounts instead.",
            variant: "destructive"
          });
        }
        setIsLoading(false);
        return { success: false };
      }
      
      setConfirmation(data || null);
      toast({
        title: "OTP Sent!",
        description: `A verification code was sent to +91${phone}.`,
        className: "bg-green-50 text-green-800 border-green-200"
      });
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      console.error("Unexpected error sending OTP:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try demo accounts instead.",
        variant: "destructive"
      });
      setIsLoading(false);
      return { success: false };
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    const specialUser = getSpecialUser(phone);
    
    // For demo supervisors/admins, let any OTP work
    if (specialUser) {
      if (otp.length === 6) {
        return { success: true, user: null };
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please enter a 6-digit OTP.",
          variant: "destructive"
        });
        return { success: false };
      }
    }
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive"
      });
      return { success: false };
    }
    
    setIsLoading(true);
    console.log("Verifying OTP for phone:", "+91" + phone);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: "+91" + phone,
        token: otp,
        type: "sms"
      });
      
      console.log("OTP verify response:", { data, error });
      
      if (error) {
        console.error("OTP verification error:", error);
        toast({
          title: "OTP Verification Failed",
          description: error.message || "Invalid OTP. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return { success: false };
      }

      setIsLoading(false);
      return { success: true, user: data?.user };
    } catch (err) {
      console.error("Unexpected error verifying OTP:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive"
      });
      setIsLoading(false);
      return { success: false };
    }
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

    // Save name for new users (if not special user)
    if (!specialUser) {
      const userSession = await supabase.auth.getSession();
      const currentUser = userSession.data.session?.user;
      if (currentUser) {
        await supabase.auth.updateUser({ data: { name: loginName }});
        await supabase
          .from("users")
          .upsert([{ phone: currentUser.phone?.replace("+91", ""), name: loginName, role: "citizen" }], { onConflict: "phone" });
      }
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
    } else if (phone === SUPERVISOR_MOBILE) {
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
    getSpecialUser
  };
};
