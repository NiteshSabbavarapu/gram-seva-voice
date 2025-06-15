
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationDetectorProps {
  onLocationDetected: (location: string, areaType: "Village" | "City" | "") => void;
}

const AREA_TYPE_LABELS = {
  Village: "Village (గ్రామం)",
  City: "City (నగరం)",
  "": "",
};

const reverseGeocode = async (lat: number, lon: number) => {
  // Use OpenStreetMap Nominatim
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Reverse geocoding failed");
  return await resp.json();
};

function determineAreaType(address: any): "Village" | "City" | "" {
  const addressString = JSON.stringify(address).toLowerCase();

  // Check for Village keywords
  if (
    addressString.includes("village") ||
    addressString.includes("gram") ||
    addressString.includes("mandal") ||
    addressString.includes("revenue village") ||
    addressString.includes("rural")
  ) {
    return "Village";
  }

  if (
    addressString.includes("municipality") ||
    addressString.includes("city") ||
    addressString.includes("urban") ||
    addressString.includes("town") ||
    addressString.includes("ghmc") ||
    addressString.includes("municipal corporation")
  ) {
    return "City";
  }
  // Fallback: if there's a town field, treat as City; if village, treat as Village
  if (address?.village) return "Village";
  if (address?.city || address?.town || address?.municipality) return "City";
  return "";
}

const LocationDetector: React.FC<LocationDetectorProps> = ({ onLocationDetected }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();
  const [manualAreaType, setManualAreaType] = useState<"Village" | "City" | "">("");

  const [lastCoords, setLastCoords] = useState<{ lat: number; lon: number } | null>(null);

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
          setLastCoords({ lat: latitude, lon: longitude });
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

          // Area type logic
          const areaType = determineAreaType(address);

          // Autofill
          onLocationDetected(locationString, areaType);

          toast({
            title: "Location Detected!",
            description: `Current location auto-filled as "${locationString}"`,
            className: "bg-green-50 text-green-800 border-green-200"
          });

          setManualAreaType(""); // reset any prior manual
        } catch (error) {
          toast({
            title: "Location Error",
            description: "Could not determine location details. Please enter manually.",
            variant: "destructive"
          });
          // allow manual fallback
          setManualAreaType("");
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
        setManualAreaType("");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Manual area type fallback if user is stuck or geocode didn't resolve
  const handleAreaTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const areaType = e.target.value as "Village" | "City" | "";
    setManualAreaType(areaType);
    onLocationDetected("", areaType); // Only areaType changing; let parent know (location will persist if already set)
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
      {/* Fallback manual area type selection if geocoding fails */}
      {manualAreaType === "" && (
        <div className="mt-3">
          <label className="block text-sm text-gray-700 font-bold mb-1">
            Select Area Type (if not auto-filled): 
            <span className="ml-1 text-xs text-gray-500">ప్రాంత రకం</span>
          </label>
          <select
            className="block w-full rounded-lg border-gray-300 focus:border-ts-primary"
            value={manualAreaType}
            onChange={handleAreaTypeChange}
          >
            <option value="">-- Select --</option>
            <option value="Village">Village (గ్రామం)</option>
            <option value="City">City (నగరం)</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default LocationDetector;
