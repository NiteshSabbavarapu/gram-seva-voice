
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Shield, User } from "lucide-react";
import { useAuthLogin } from "@/hooks/useAuthLogin";
import PhoneStep from "@/components/auth/PhoneStep";
import OTPStep from "@/components/auth/OTPStep";
import NameStep from "@/components/auth/NameStep";
import { getIndianPhoneNumber, isValidIndianMobile } from "@/utils/phoneUtils";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  
  const { 
    isLoading, 
    sendOTP, 
    verifyOTP, 
    completeLogin, 
    ensureSpecialUser, 
    getSpecialUser 
  } = useAuthLogin();

  const specialUser = getSpecialUser(phone);

  // Ensure special users exist in database
  useEffect(() => {
    if (specialUser) {
      ensureSpecialUser(phone);
    }
  }, [phone, specialUser, ensureSpecialUser]);

  const handleSendOTP = async () => {
    const cleanedPhone = getIndianPhoneNumber(phone);
    
    if (!cleanedPhone || !isValidIndianMobile(cleanedPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.",
        variant: "destructive"
      });
      return;
    }

    const result = await sendOTP(cleanedPhone);
    if (result.success) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = async () => {
    const result = await verifyOTP(phone, otp);
    if (result.success) {
      if (result.user?.user_metadata?.name || specialUser) {
        await completeLogin(phone, result.user?.user_metadata?.name, true, onClose);
      } else {
        setStep('name');
        toast({
          title: "OTP Verified!",
          description: "Phone number verified successfully.",
          className: "bg-green-50 text-green-800 border-green-200"
        });
      }
    }
  };

  const handleCompleteLogin = async () => {
    await completeLogin(phone, name, true, onClose);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'phone': return <><Phone className="mr-2 h-5 w-5" /> Enter Phone Number</>;
      case 'otp': return <><Shield className="mr-2 h-5 w-5" /> Verify OTP</>;
      case 'name': return <><User className="mr-2 h-5 w-5" /> Enter Your Name</>;
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'phone': return 'మీ ఫోన్ నంబర్ నమోదు చేయండి';
      case 'otp': return 'OTP ని ధృవీకరించండి';
      case 'name': return 'మీ పేరు నమోదు చేయండి';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="bg-gradient-to-r from-ts-primary to-ts-primary-dark text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center">
            {getStepTitle()}
          </CardTitle>
          <p className="text-white/90 text-sm font-telugu">
            {getStepSubtitle()}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {step === 'phone' && (
            <PhoneStep
              phone={phone}
              setPhone={setPhone}
              onSendOTP={handleSendOTP}
              isLoading={isLoading}
            />
          )}
          {step === 'otp' && (
            <OTPStep
              phone={phone}
              otp={otp}
              setOtp={setOtp}
              onVerifyOTP={handleVerifyOTP}
              onBack={() => setStep('phone')}
              isLoading={isLoading}
              isSpecialUser={!!specialUser}
            />
          )}
          {step === 'name' && (
            <NameStep
              name={name}
              setName={setName}
              onCompleteLogin={handleCompleteLogin}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginModal;
