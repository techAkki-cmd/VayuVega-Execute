import React from "react";
import { NavLink } from "react-router-dom";
import BreadcrumbDash from "./BreadcrumbDash";
import SwitchTheme from "./SwitchTheme";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  LogOut,
  Users,
  BarChart
} from "lucide-react";

// Navigation items configuration
const navigationItems = [
  { 
    name: "Overview", 
    path: "/dashboard", 
    icon: Home,
    exact: true 
  },
  { 
    name: "Products", 
    path: "/dashboard/products", 
    icon: Users 
  },
  { 
    name: "Analyze Feedback", 
    path: "/dashboard/analyze", 
    icon: BarChart 
  }
];

const DashboardLayout = ({ children }) => {
  const { signOut } = useSupabaseAuth();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background flex flex-col">
        <div className="p-4 font-semibold text-lg flex items-center">
          <span className="ml-2">Dashboard</span>
        </div>
        
        <Separator />
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink 
                key={item.path}
                to={item.path} 
                end={item.exact}
                className={({ isActive }) => 
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all ${
                    isActive 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        
        {/* Bottom section with logout */}
        <div className="p-4 mt-auto">
          <Separator className="my-2" />
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <BreadcrumbDash />
            <SwitchTheme />
          </div>
          <div className="rounded-lg">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;