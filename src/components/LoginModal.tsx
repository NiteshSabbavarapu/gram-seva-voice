
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, Shield, User } from "lucide-react";

// Employee fixed values
const EMPLOYEE_MOBILE = "9999912345"; // Change this to your desired fixed employee number
const EMPLOYEE_OTP = "123456";        // Use this OTP for the fixed employee

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

  // Track if this is an employee login session
  const isEmployee = phone === EMPLOYEE_MOBILE;

  const handleSendOTP = () => {
    if (!phone || phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      toast({
        title: "OTP Sent!",
        description: `Verification code sent to ${phone}. Demo OTP: ${EMPLOYEE_OTP}`,
        className: "bg-green-50 text-green-800 border-green-200"
      });
    }, 1000);
  };

  const handleVerifyOTP = () => {
    // Only allow EMPLOYEE_OTP for the fixed employee number
    if (isEmployee && otp !== EMPLOYEE_OTP) {
      toast({
        title: "Invalid OTP",
        description: `Please enter the correct OTP: ${EMPLOYEE_OTP} (for demo)`,
        variant: "destructive"
      });
      return;
    }
    // For demo simplicity, OTP for any user currently is also EMPLOYEE_OTP
    if (!isEmployee && otp !== EMPLOYEE_OTP) {
      toast({
        title: "Invalid OTP",
        description: `Please enter the correct OTP: ${EMPLOYEE_OTP} (for demo)`,
        variant: "destructive"
      });
      return;
    }

    setStep('name');
    toast({
      title: "OTP Verified!",
      description: "Phone number verified successfully.",
      className: "bg-green-50 text-green-800 border-green-200"
    });
  };

  const handleCompleteLogin = () => {
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive"
      });
      return;
    }

    login(phone, name.trim());
    toast({
      title: "Welcome!",
      description: `Logged in successfully as ${name}`,
      className: "bg-green-50 text-green-800 border-green-200"
    });

    if (isEmployee) {
      // Redirect employee to official-login page after login
      onClose();
      navigate("/official-login");
    } else {
      onClose();
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
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="mt-2"
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                />
                <div className="text-xs text-gray-500 mt-1">
                  <span>
                    For Employee Login, use: <b>{EMPLOYEE_MOBILE}</b>&nbsp;
                  </span>
                </div>
              </div>
              <Button 
                onClick={handleSendOTP}
                disabled={isLoading || phone.length !== 10}
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
                <p className="font-semibold text-ts-primary">{phone}</p>
                <p className="text-sm text-ts-text-secondary mt-2">Demo OTP: {EMPLOYEE_OTP}</p>
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
                  disabled={otp.length !== 6}
                  className="flex-1 bg-ts-primary hover:bg-ts-primary-dark"
                >
                  Verify OTP
                </Button>
              </div>
            </div>
          )}

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
                onClick={handleCompleteLogin}
                disabled={!name.trim()}
                className="w-full bg-ts-primary hover:bg-ts-primary-dark"
              >
                Complete Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginModal;

