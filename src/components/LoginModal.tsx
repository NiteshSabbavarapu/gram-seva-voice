import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, Shield, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Constants for special users
const SUPERVISOR_MOBILE = "8000000001";
const SUPERVISOR_NAME = "FD Supervisor";
const SUPERVISOR_ROLE = "employee";
const LOCATION_NAME = "Financial District, Gandipet mandal, Telangana";

// Admin
const ADMIN_MOBILE = "9000000001";
const ADMIN_NAME = "GramSeva Admin";
const ADMIN_ROLE = "admin";

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<null | {session: any}>(null);

  // Helper to get clean Indian phone number
  const getIndianPhoneNumber = (rawInput: string): string => {
    let cleaned = rawInput.replace(/\D/g, ""); // Remove non-digits
    // Remove leading 91 if present (for pasted numbers)
    if (cleaned.startsWith("91") && cleaned.length > 10) {
      cleaned = cleaned.substring(2);
    }
    // Remove any leading zeros
    cleaned = cleaned.replace(/^0+/, "");
    // Only keep the last 10 digits if too long
    if (cleaned.length > 10) cleaned = cleaned.slice(-10);
    return cleaned;
  };

  // Track user roles
  const specialUser =
    phone === SUPERVISOR_MOBILE
      ? { name: SUPERVISOR_NAME, role: SUPERVISOR_ROLE as "employee" | "admin" | "citizen" }
      : phone === ADMIN_MOBILE
      ? { name: ADMIN_NAME, role: ADMIN_ROLE as "employee" | "admin" | "citizen" }
      : null;

  // Automatically create/ensure special users exist in supabase users table (for demo users)
  useEffect(() => {
    const ensureSpecialUser = async () => {
      if (!specialUser) return;
      const { name, role } = specialUser;
      await supabase.from("users").upsert(
        [{ name, phone, role }], 
        { onConflict: "phone" }
      );
      // Supervisor assignment logic remains as before
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
    ensureSpecialUser();
    // eslint-disable-next-line
  }, [phone]);

  // Remove legacy employee logic - ONLY supervisors/admins have fixed demo login.

  // NEW: Send OTP via Supabase for normal users
  const handleSendOTP = async () => {
    const cleanedPhone = getIndianPhoneNumber(phone);
    if (!cleanedPhone || cleanedPhone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit Indian mobile number.",
        variant: "destructive"
      });
      return;
    }

    // Special users demo bypass
    if (specialUser) {
      setStep('otp');
      toast({
        title: "OTP Sent!",
        description: `Using demo login for ${specialUser.name}. Any 6-digit OTP will work.`,
        className: "bg-green-50 text-green-800 border-green-200"
      });
      return;
    }

    setIsLoading(true);
    // Use Supabase's OTP send method
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: "+91" + cleanedPhone // Always prepend +91
    });
    setIsLoading(false);
    if (error) {
      toast({
        title: "OTP Send Failed",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    setConfirmation(data || null);
    setStep('otp');
    toast({
      title: "OTP Sent!",
      description: `A verification code was sent to +91${cleanedPhone}.`,
      className: "bg-green-50 text-green-800 border-green-200"
    });
  };

  // NEW: OTP verification/Sign-in logic
  const handleVerifyOTP = async () => {
    // For demo supervisors/admins, let any OTP work (for quick testing)
    if (specialUser) {
      handleCompleteLogin(specialUser.name, false);
      return;
    }
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    // Verify via Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      phone: "+91" + phone,
      token: otp,
      type: "sms"
    });
    setIsLoading(false);
    if (error) {
      toast({
        title: "OTP Verification Failed",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    // Success: proceed to next step or login
    if (data?.user) {
      // If the user has a name in profile, skip Name step
      // For minimal MVP, always ask for name if not present
      const { user } = data;
      if (user?.user_metadata?.name) {
        handleCompleteLogin(user.user_metadata.name, true);
      } else {
        setStep('name');
        toast({
          title: "OTP Verified!",
          description: "Phone number verified successfully.",
          className: "bg-green-50 text-green-800 border-green-200"
        });
      }
    } else {
      setStep('name');
    }
  };

  const handleCompleteLogin = async (finalName?: string, closeModal = true) => {
    const loginName =
      specialUser && specialUser.name
        ? specialUser.name
        : (finalName ?? name).trim();
    if (!loginName) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive"
      });
      return;
    }

    // Save name for new users (if not special user)
    if (!specialUser) {
      // Update user profile (if available)
      const userSession = await supabase.auth.getSession();
      const currentUser = userSession.data.session?.user;
      if (currentUser) {
        // Save name as metadata (for illustration), AND update local users table
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
    // Only supervisor/admin redirect logic remains
    if (phone === ADMIN_MOBILE) {
      onClose();
      navigate("/admin-dashboard");
    }
    else if (phone === SUPERVISOR_MOBILE) {
      onClose();
      navigate("/official-login");
    }
    else {
      if(closeModal) onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="bg-gradient-to-r from-ts-primary to-ts-primary-dark text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center">
            {step === 'phone' && <><Phone className="mr-2 h-5 w-5" /> Enter Phone Number</>}
            {step === 'otp' && <><Shield className="mr-2 h-5 w-5" /> Verify OTP</>}
            {step === 'name' && <><User className="mr-2 h-5 w-5" /> Enter Your Name</>}
          </CardTitle>
          <p className="text-white/90 text-sm font-telugu">
            {step === 'phone' && 'మీ ఫోన్ నంబర్ నమోదు చేయండి'}
            {step === 'otp' && 'OTP ని ధృవీకరించండి'}
            {step === 'name' && 'మీ పేరు నమోదు చేయండి'}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-ts-text font-medium">
                  Phone Number / ఫోన్ నంబర్
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(getIndianPhoneNumber(e.target.value))}
                  className="mt-2"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={14} // to allow some room for pasting +91, 0, etc.
                />
                <div className="text-xs text-gray-500 mt-1">
                  <span>
                    For Supervisor Login, use: <b>{SUPERVISOR_MOBILE}</b>
                  </span>
                  <br />
                  <span>
                    For Admin Login, use: <b>{ADMIN_MOBILE}</b>
                  </span>
                </div>
              </div>
              <Button 
                onClick={handleSendOTP}
                disabled={isLoading || getIndianPhoneNumber(phone).length !== 10}
                className="w-full bg-ts-primary hover:bg-ts-primary-dark"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </div>
          )}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-ts-text mb-2">Enter the OTP sent to</p>
                <p className="font-semibold text-ts-primary">+91{phone}</p>
                {!specialUser && (
                  <p className="text-sm text-ts-text-secondary mt-2">Check your SMS for the OTP.</p>
                )}
                {specialUser && (
                  <p className="text-sm text-ts-text-secondary mt-2">Demo: any 6-digit OTP will work.</p>
                )}
              </div>
              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('phone')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || isLoading}
                  className="flex-1 bg-ts-primary hover:bg-ts-primary-dark"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            </div>
          )}
          {/* Only show the name step if not a predefined user */}
          {step === 'name' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-ts-text font-medium">
                  Your Name / మీ పేరు
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                  placeholder="Enter your full name"
                />
              </div>
              <Button 
                onClick={() => handleCompleteLogin(undefined, true)}
                disabled={!name.trim() || isLoading}
                className="w-full bg-ts-primary hover:bg-ts-primary-dark"
              >
                {isLoading ? "Completing..." : "Complete Login"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginModal;
