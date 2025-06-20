
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationDetectorProps {
  onLocationDetected: (location: string) => void;
}

const reverseGeocode = async (lat: number, lon: number) => {
  // Use OpenStreetMap Nominatim
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Reverse geocoding failed");
  return await resp.json();
};

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
          // Reverse geocode
          const result = await reverseGeocode(latitude, longitude);
          const address = result.address || {};
          // Compose display location string
          let locationString =
            address.village ||
            address.town ||
            address.city ||
            address.municipality ||
            address.hamlet ||
            address.suburb ||
            address.state_district ||
            address.state ||
            result.display_name ||
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          // Add Mandal/District/State info if available
          if (address.county) locationString += `, ${address.county}`;
          if (address.state) locationString += `, ${address.state}`;

          // Autofill
          onLocationDetected(locationString);

          toast({
            title: "Location Detected!",
            description: `Current location auto-filled as "${locationString}"`,
            className: "bg-green-50 text-green-800 border-green-200"
          });

        } catch (error) {
          toast({
            title: "Location Error",
            description: "Could not determine location details. Please enter manually.",
            variant: "destructive"
          });
        }
        setIsDetecting(false);
      },
      (error) => {
        setIsDetecting(false);
        toast({
          title: "Location Detection Failed",
          description: "Please enter your location manually.",
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
    <div>
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
    </div>
  );
};

export default LocationDetector;
