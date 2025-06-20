
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Home, Check, User, MapPin, Clock, CheckCircle, AlertCircle, Play, Pause, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];

interface Complaint {
  id: string;
  name: string;
  phone: string;
  location_name: string;
  category: string;
  description: string;
  status: ComplaintStatus;
  submitted_at: string;
  voice_message: string | null;
  voice_duration: number | null;
}

const SupervisorDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [locationName, setLocationName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSupervisorData();
    }
  }, [user]);

  const loadSupervisorData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get supervisor's assigned location
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("employee_assignments")
        .select(`
          locations!inner(
            id,
            name
          )
        `)
        .eq("user_id", user.id)
        .single();

      if (assignmentError) {
        console.error("Error loading assignment:", assignmentError);
        throw assignmentError;
      }

      const location = assignmentData.locations;
      setLocationName(location.name);

      // Load complaints for this supervisor
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select("*")
        .eq("assigned_officer_id", user.id)
        .order("submitted_at", { ascending: false });

      if (complaintsError) {
        console.error("Error loading complaints:", complaintsError);
        throw complaintsError;
      }

      setComplaints(complaintsData || []);
    } catch (error) {
      console.error("Error loading supervisor data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case "submitted": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: ComplaintStatus) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", complaintId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Complaint status has been updated to ${newStatus}.`,
        className: "bg-green-50 text-green-800"
      });

      // Reload data to reflect changes
      loadSupervisorData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update complaint status.",
        variant: "destructive"
      });
    }
  };

  const playVoiceMessage = (complaintId: string, voiceMessage: string) => {
    try {
      // Stop any currently playing audio
      if (playingAudio) {
        const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      // If clicking on the same audio that's playing, stop it
      if (playingAudio === complaintId) {
        setPlayingAudio(null);
        return;
      }

      // Create audio blob from base64
      const audioBlob = new Blob([
        new Uint8Array(
          atob(voiceMessage)
            .split('')
            .map(char => char.charCodeAt(0))
        )
      ], { type: 'audio/webm' });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.id = `audio-${complaintId}`;

      audio.addEventListener('ended', () => {
        setPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
      });

      audio.addEventListener('error', () => {
        toast({
          title: "Audio Error",
          description: "Could not play voice message.",
          variant: "destructive"
        });
        setPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
      });

      audio.play();
      setPlayingAudio(complaintId);

    } catch (error) {
      console.error("Error playing voice message:", error);
      toast({
        title: "Audio Error",
        description: "Could not play voice message.",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats = {
    totalComplaints: complaints.length,
    pendingComplaints: complaints.filter(c => c.status === 'submitted').length,
    ongoingComplaints: complaints.filter(c => c.status === 'in_progress').length,
    completedComplaints: complaints.filter(c => c.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ts-background font-poppins">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-xl">Loading dashboard...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ts-background font-poppins">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-ts-accent hover:text-ts-primary transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <span className="text-ts-text-secondary mx-2">/</span>
          <span className="text-ts-text">{locationName} Dashboard</span>
        </div>

        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ts-text mb-2">{locationName} Dashboard</h1>
          <p className="text-ts-text-secondary font-telugu">{locationName} డ్యాష్‌బోర్డ్</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-ts-primary to-ts-primary-dark text-white rounded-xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{stats.totalComplaints}</h3>
              <p className="text-white/90">Total Complaints</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black rounded-xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{stats.pendingComplaints}</h3>
              <p className="text-black/80">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{stats.ongoingComplaints}</h3>
              <p className="text-white/90">In Progress</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold">{stats.completedComplaints}</h3>
              <p className="text-white/90">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Complaints List */}
        <Card className="shadow-lg rounded-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl text-ts-text">Your Assigned Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id} className="shadow-lg rounded-xl border-0">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-ts-text">
                            ID: {complaint.id.slice(0, 8)}...
                          </h3>
                          <Badge className={getStatusColor(complaint.status)}>
                            {complaint.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {complaint.voice_message && (
                            <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                              <Volume2 className="h-3 w-3" />
                              Voice
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-ts-text-secondary">
                          <p><strong>Name:</strong> {complaint.name || "Anonymous"}</p>
                          <p><strong>Phone:</strong> {complaint.phone}</p>
                          <p><strong>Category:</strong> {complaint.category}</p>
                          
                          {/* Voice Message Section */}
                          {complaint.voice_message && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-purple-800 font-medium flex items-center gap-2">
                                  <Volume2 className="h-4 w-4" />
                                  Voice Message ({formatDuration(complaint.voice_duration)})
                                </span>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => playVoiceMessage(complaint.id, complaint.voice_message!)}
                                  className="bg-purple-500 hover:bg-purple-600 text-white"
                                >
                                  {playingAudio === complaint.id ? (
                                    <>
                                      <Pause className="h-3 w-3 mr-1" />
                                      Stop
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-3 w-3 mr-1" />
                                      Play
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <p><strong>Description:</strong> {complaint.description}</p>
                          <p><strong>Submitted:</strong> {new Date(complaint.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 min-w-fit">
                        {complaint.status === "submitted" && (
                          <Button 
                            onClick={() => handleStatusUpdate(complaint.id, "in_progress")}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Start Progress
                          </Button>
                        )}
                        
                        {complaint.status === "in_progress" && (
                          <Button 
                            onClick={() => handleStatusUpdate(complaint.id, "resolved")}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </Button>
                        )}
                        
                        {complaint.status === "resolved" && (
                          <div className="flex items-center text-green-600 font-medium">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {complaints.length === 0 && (
                <Card className="shadow-lg rounded-xl border-0">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-ts-text-secondary">No complaints assigned to you yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupervisorDashboard;
