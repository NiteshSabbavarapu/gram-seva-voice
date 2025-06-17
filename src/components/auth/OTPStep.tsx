
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
          <p className="text-sm text-green-700 font-medium">
            Fixed OTP for all users: <span className="font-bold text-lg">123456</span>
          </p>
        </div>
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
