
export interface Complaint {
  id: string;
  name: string;
  phone: string;
  location: string;
  areaType?: "Village" | "City" | ""; // NEW
  forwardedTo?: string; // NEW
  category: string;
  description: string;
  status: "Submitted" | "In Progress" | "Resolved";
  submittedDate: string;
  assignedOfficer: string | null;
  image?: File | null;
}

// Simple in-memory store for complaints
class ComplaintsStore {
  private complaints: Complaint[] = [
    {
      id: "TS123456",
      name: "Ravi Kumar",
      phone: "9876543210",
      location: "Yellandu, Khammam",
      areaType: "Village",
      forwardedTo: "Gram Panchayat – Yellandu",
      category: "Roads & Infrastructure",
      description: "Pothole on main road causing traffic issues",
      status: "Submitted",
      submittedDate: "2024-06-10",
      assignedOfficer: null
    },
    {
      id: "TS123457", 
      name: "Lakshmi Devi",
      phone: "9876543211",
      location: "Warangal Urban",
      areaType: "City",
      forwardedTo: "Warangal Municipality Office",
      category: "Water Supply",
      description: "No water supply for 3 days in our area",
      status: "In Progress",
      submittedDate: "2024-06-09",
      assignedOfficer: "Sri Ramesh Kumar"
    },
    {
      id: "TS123458",
      name: "Mahesh Reddy",
      phone: "9876543212", 
      location: "Nizamabad",
      areaType: "City",
      forwardedTo: "Nizamabad Municipality Office",
      category: "Electricity",
      description: "Frequent power cuts in the village",
      status: "Resolved",
      submittedDate: "2024-06-08",
      assignedOfficer: "Smt. Priya Sharma"
    }
  ];

  private listeners: (() => void)[] = [];

  addComplaint(complaint: Omit<Complaint, 'id' | 'status' | 'submittedDate' | 'assignedOfficer'>) {
    const newComplaint: Complaint = {
      ...complaint,
      id: `TS${Date.now().toString().slice(-6)}`,
      status: "Submitted",
      submittedDate: new Date().toISOString().split('T')[0],
      assignedOfficer: null
    };
    
    this.complaints.unshift(newComplaint);
    this.notifyListeners();
    return newComplaint.id;
  }

  getComplaints(): Complaint[] {
    return [...this.complaints];
  }

  getComplaintById(id: string): Complaint | undefined {
    return this.complaints.find(complaint => complaint.id === id);
  }

  updateComplaintStatus(id: string, status: Complaint['status'], assignedOfficer?: string) {
    const complaint = this.complaints.find(c => c.id === id);
    if (complaint) {
      complaint.status = status;
      if (assignedOfficer) {
        complaint.assignedOfficer = assignedOfficer;
      }
      this.notifyListeners();
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const complaintsStore = new ComplaintsStore();
