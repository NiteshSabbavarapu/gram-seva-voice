
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationDetectorProps {
  onLocationDetected: (location: string) => void;
}

const LocationDetector: React.FC<LocationDetectorProps> = ({ onLocationDetected }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location detection.",
        variant: "destructive"
      });
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // For demo purposes, we'll use the coordinates directly
          // In a real app, you'd use a reverse geocoding service
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          onLocationDetected(locationString);
          
          toast({
            title: "Location Detected!",
            description: "Current location has been added to your complaint.",
            className: "bg-green-50 text-green-800 border-green-200"
          });
        } catch (error) {
          toast({
            title: "Location Error",
            description: "Failed to get location details. Please enter manually.",
            variant: "destructive"
          });
        }
        setIsDetecting(false);
      },
      (error) => {
        setIsDetecting(false);
        let message = "Please enter your location manually.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enter manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location unavailable. Please enter manually.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out. Please enter manually.";
            break;
        }
        
        toast({
          title: "Location Detection Failed",
          description: message,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={detectLocation}
      disabled={isDetecting}
      className="flex items-center space-x-2 border-ts-primary text-ts-primary hover:bg-ts-primary hover:text-white"
    >
      {isDetecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MapPin className="h-4 w-4" />
      )}
      <span>{isDetecting ? "Detecting..." : "📍 Detect My Location"}</span>
    </Button>
  );
};

export default LocationDetector;
