
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  FileText, 
  BarChart3, 
  Megaphone, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Supervisors",
    href: "/admin-dashboard/supervisors",
    icon: Users,
  },
  {
    title: "Locations",
    href: "/admin-dashboard/locations",
    icon: MapPin,
  },
  {
    title: "Complaints",
    href: "/admin-dashboard/complaints",
    icon: FileText,
  },
  {
    title: "Reports",
    href: "/admin-dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Announcements",
    href: "/admin-dashboard/announcements",
    icon: Megaphone,
  },
  {
    title: "Settings",
    href: "/admin-dashboard/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <h2 className="text-lg font-semibold text-ts-text">Admin Panel</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="p-2"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-ts-primary text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
