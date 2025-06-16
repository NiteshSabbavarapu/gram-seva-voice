
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameStepProps {
  name: string;
  setName: (name: string) => void;
  onCompleteLogin: () => void;
  isLoading: boolean;
}

const NameStep: React.FC<NameStepProps> = ({ name, setName, onCompleteLogin, isLoading }) => {
  return (
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
        onClick={onCompleteLogin}
        disabled={!name.trim() || isLoading}
        className="w-full bg-ts-primary hover:bg-ts-primary-dark"
      >
        {isLoading ? "Completing..." : "Complete Login"}
      </Button>
    </div>
  );
};

export default NameStep;
