
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface OTPStepProps {
  phone: string;
  otp: string;
  setOtp: (otp: string) => void;
  onVerifyOTP: () => void;
  onBack: () => void;
  isLoading: boolean;
  isSpecialUser: boolean;
}

const OTPStep: React.FC<OTPStepProps> = ({ 
  phone, 
  otp, 
  setOtp, 
  onVerifyOTP, 
  onBack, 
  isLoading, 
  isSpecialUser 
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-ts-text mb-2">Enter the OTP sent to</p>
        <p className="font-semibold text-ts-primary">+91{phone}</p>
        {!isSpecialUser && (
          <p className="text-sm text-ts-text-secondary mt-2">Check your SMS for the OTP.</p>
        )}
        {isSpecialUser && (
          <p className="text-sm text-blue-600 mt-2">Demo mode: any 6-digit OTP will work.</p>
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
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={onVerifyOTP}
          disabled={otp.length !== 6 || isLoading}
          className="flex-1 bg-ts-primary hover:bg-ts-primary-dark"
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>
      </div>
    </div>
  );
};

export default OTPStep;
