import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { ArrowLeft, Eye, FileText, Home, User, Phone, Volume2, Play, Pause } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import FeedbackForm from "../components/FeedbackForm";

type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];

interface Complaint {
  id: string;
  name: string | null;
  phone: string | null;
  location_name: string | null;
  category: string | null;
  description: string;
  status: ComplaintStatus;
  submitted_at: string | null;
  area_type: string | null;
  assigned_officer_id: string | null;
  voice_message: string | null;
  voice_duration: number | null;
}

const MyComplaints = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, boolean>>({});
  const [checkingFeedback, setCheckingFeedback] = useState<Record<string, boolean>>({});
  const [showFeedbackForm, setShowFeedbackForm] = useState<Record<string, boolean>>({});
  const [supervisorNames, setSupervisorNames] = useState<Record<string, string>>({});
  
  // Use authenticated user's phone or fallback to URL param
  const phoneNumber = user?.phone || searchParams.get('phone');
  
  useEffect(() => {
    if (isAuthenticated && phoneNumber) {
      loadUserComplaints();
    }
  }, [isAuthenticated, phoneNumber]);

  const loadUserComplaints = async () => {
    if (!phoneNumber) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('phone', phoneNumber)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setComplaints(data || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
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
        setPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
      });

      audio.play();
      setPlayingAudio(complaintId);

    } catch (error) {
      console.error("Error playing voice message:", error);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check feedback for a complaint
  const checkFeedback = useCallback(async (complaintId: string) => {
    setCheckingFeedback(prev => ({ ...prev, [complaintId]: true }));
    const { data } = await supabase
      .from("supervisor_feedback")
      .select("id")
      .eq("complaint_id", complaintId)
      .single();
    setFeedbackStatus(prev => ({ ...prev, [complaintId]: !!data }));
    setCheckingFeedback(prev => ({ ...prev, [complaintId]: false }));
  }, []);

  useEffect(() => {
    // For all resolved complaints, check feedback status
    complaints.forEach((complaint) => {
      if (
        complaint.status?.toLowerCase() === "resolved" &&
        complaint.assigned_officer_id &&
        feedbackStatus[complaint.id] === undefined &&
        !checkingFeedback[complaint.id]
      ) {
        checkFeedback(complaint.id);
      }
    });
  }, [complaints, feedbackStatus, checkingFeedback, checkFeedback]);

  useEffect(() => {
    // Fetch supervisor names for all complaints with assigned_officer_id
    const fetchSupervisorNames = async () => {
      const ids = complaints
        .map((c) => c.assigned_officer_id)
        .filter((id): id is string => !!id && !supervisorNames[id]);
      if (ids.length === 0) return;
      const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .in("id", ids);
      if (!error && data) {
        const names: Record<string, string> = {};
        data.forEach((u) => {
          names[u.id] = u.name || "Unknown Supervisor";
        });
        setSupervisorNames((prev) => ({ ...prev, ...names }));
      }
    };
    fetchSupervisorNames();
    // eslint-disable-next-line
  }, [complaints]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-ts-text mb-4">
                Login Required
              </h3>
              <p className="text-ts-text-secondary mb-6">
                Please login to view your complaints.
              </p>
              <Button 
                onClick={() => setShowLoginModal(true)}
                className="bg-ts-primary hover:bg-ts-primary-dark text-white"
              >
                Login to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusDisplay = (status: ComplaintStatus) => {
    switch (status) {
      case "submitted": return "Submitted";
      case "in_progress": return "In Progress";
      case "resolved": return "Resolved";
      default: return status;
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (activeTab === "all") return true;
    return complaint.status === activeTab.replace("-", "_");
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your complaints...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-ts-accent hover:text-ts-primary transition-colors">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <span className="text-ts-text-secondary mx-2">/</span>
          <span className="text-ts-text">My Complaints</span>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ts-text mb-2 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-ts-primary" />
              My Complaints
            </h1>
            <p className="text-ts-text-secondary font-telugu mb-4">
              మీ ఫిర్యాదుల స్థితిని ట్రాక్ చేయండి
            </p>
            
            {/* User Info */}
            {user && (
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800 flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {user.name}
                      </h3>
                      <p className="text-green-700 flex items-center text-sm">
                        <Phone className="mr-2 h-3 w-3" />
                        {user.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">Total Complaints</p>
                      <p className="text-2xl font-bold text-green-800">{complaints.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {complaints.length === 0 ? (
            <Card className="shadow-lg rounded-xl border-0 text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ts-text mb-2">
                  No Complaints Found
                </h3>
                <p className="text-ts-text-secondary mb-6">
                  You haven't submitted any complaints yet.
                </p>
                <Link to="/submit-complaint">
                  <Button className="bg-ts-primary hover:bg-ts-primary-dark text-white">
                    Submit Your First Complaint
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Status Filter Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-4 bg-white rounded-lg shadow-sm border">
                  <TabsTrigger value="all" className="data-[state=active]:bg-ts-primary data-[state=active]:text-white">
                    All ({complaints.length})
                  </TabsTrigger>
                  <TabsTrigger value="submitted" className="data-[state=active]:bg-ts-primary data-[state=active]:text-white">
                    Submitted ({complaints.filter(c => c.status === "submitted").length})
                  </TabsTrigger>
                  <TabsTrigger value="in_progress" className="data-[state=active]:bg-ts-primary data-[state=active]:text-white">
                    In Progress ({complaints.filter(c => c.status === "in_progress").length})
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="data-[state=active]:bg-ts-primary data-[state=active]:text-white">
                    Resolved ({complaints.filter(c => c.status === "resolved").length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  <div className="space-y-4">
                    {filteredComplaints.map((complaint) => (
                      <Card key={complaint.id} className="shadow-lg rounded-xl border-0 hover:shadow-xl transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg font-semibold text-ts-text">
                                {complaint.category}
                              </CardTitle>
                              <p className="text-sm text-ts-text-secondary mt-1">
                                ID: {complaint.id.slice(0, 8)}... • {formatDate(complaint.submitted_at)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={`${getStatusColor(complaint.status)} border font-medium`}>
                                {getStatusDisplay(complaint.status)}
                              </Badge>
                              {complaint.voice_message && (
                                <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                                  <Volume2 className="h-3 w-3" />
                                  Voice
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="mb-3">
                            <p className="text-ts-text line-clamp-2">
                              {complaint.description}
                            </p>
                            {complaint.location_name && (
                              <p className="text-sm text-ts-text-secondary mt-2">
                                📍 {complaint.location_name}
                              </p>
                            )}
                            
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
                            
                            {/* Show Area Type and ForwardedTo */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs md:text-sm text-gray-700">
                              <span>
                                <span className="font-bold">Area Type:</span>{" "}
                                {complaint.area_type === "Village"
                                  ? "Village (గ్రామం)"
                                  : complaint.area_type === "City"
                                  ? "City (నగరం)"
                                  : "-"}
                              </span>
                            </div>
                            {complaint.assigned_officer_id && (
                              <p className="text-sm text-ts-accent mt-1">
                                👤 Assigned to: {supervisorNames[complaint.assigned_officer_id] || complaint.assigned_officer_id}
                              </p>
                            )}
                            {/* Feedback Form for resolved complaints with button */}
                            {complaint.status?.toLowerCase() === "resolved" && complaint.assigned_officer_id && (
                              <div className="mt-4">
                                {checkingFeedback[complaint.id] ? (
                                  <span className="text-gray-500 text-sm">Checking feedback...</span>
                                ) : feedbackStatus[complaint.id] ? (
                                  <span className="text-green-700 font-semibold text-sm">Thank you for your feedback!</span>
                                ) : showFeedbackForm[complaint.id] ? (
                                  <FeedbackForm
                                    complaintId={complaint.id}
                                    supervisorId={complaint.assigned_officer_id}
                                    onSubmitted={() => {
                                      setFeedbackStatus(prev => ({ ...prev, [complaint.id]: true }));
                                      setShowFeedbackForm(prev => ({ ...prev, [complaint.id]: false }));
                                    }}
                                  />
                                ) : (
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => setShowFeedbackForm(prev => ({ ...prev, [complaint.id]: true }))}
                                  >
                                    Give Feedback
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-end">
                            <Link to={`/track-complaint?id=${complaint.id}`}>
                              <Button 
                                size="sm" 
                                className="bg-ts-primary hover:bg-ts-primary-dark text-white"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MyComplaints;
