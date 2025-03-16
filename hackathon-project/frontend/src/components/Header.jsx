import React from "react";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";
import SwitchTheme from "./SwitchTheme";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "./ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, Home } from "lucide-react";

const Header = () => {
  const { isAuthenticated, signOut, user } = useSupabaseAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 w-full flex h-16 items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="font-bold text-xl"
            onClick={() => navigate("/")}
          >
            <img className="h-8 rounded-lg" src="/logo.png" ></img>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start"
                            onClick={() => navigate("/dashboard")}
                          >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Button>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive"
                            onClick={signOut}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </Button>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/signup")}>
                Sign up
              </Button>
            </div>
          )}
          <SwitchTheme />
        </div>
      </div>
    </header>
  );
};

export default Header;