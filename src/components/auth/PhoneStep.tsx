
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { getIndianPhoneNumber, isValidIndianMobile } from "@/utils/phoneUtils";
import { SUPERVISOR_MOBILE, ADMIN_MOBILE, COLLEGE_SUPERVISOR_MOBILE } from "@/constants/authConstants";

interface PhoneStepProps {
  phone: string;
  setPhone: (phone: string) => void;
  onSendOTP: () => void;
  isLoading: boolean;
}

const PhoneStep: React.FC<PhoneStepProps> = ({ phone, setPhone, onSendOTP, isLoading }) => {
  return (
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
          maxLength={14}
        />
        <div className="text-xs text-gray-500 mt-1 space-y-1">
          <div>
            <span className="font-medium text-blue-600">Demo Accounts:</span>
          </div>
          <div>
            FD Supervisor: <b>{SUPERVISOR_MOBILE}</b>
          </div>
          <div>
            College Supervisor: <b>{COLLEGE_SUPERVISOR_MOBILE}</b>
          </div>
          <div>
            Admin: <b>{ADMIN_MOBILE}</b>
          </div>
          <div className="text-green-600 text-xs mt-2">
            ✅ For all numbers, use OTP: <b>123456</b>
          </div>
        </div>
      </div>
      <Button 
        onClick={onSendOTP}
        disabled={isLoading || !isValidIndianMobile(phone)}
        className="w-full bg-ts-primary hover:bg-ts-primary-dark"
      >
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </div>
  );
};

export default PhoneStep;
