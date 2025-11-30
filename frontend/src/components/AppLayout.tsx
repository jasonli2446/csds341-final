import { Link, Outlet, useNavigate } from "react-router-dom";
import { Car, LogIn, LogOut, Menu, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// TODO: Replace with actual auth state
const isLoggedIn = false;
const currentUser = { name: "Test User", email: "test@example.com" };

export default function AppLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement actual logout
    console.log("Logout clicked");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
            <Car className="h-6 w-6" />
            <span>Campus Carpool</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/rides/search"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Find Rides
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/rides/create"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Offer Ride
                </Link>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/rides/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Offer a Ride
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/rides/search")}>
                  <Search className="mr-2 h-4 w-4" />
                  Find Rides
                </DropdownMenuItem>
                {isLoggedIn && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/rides/create")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Offer Ride
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-muted/50">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Campus Carpool - CSDS 341 Final Project
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <Link to="/rides/search" className="hover:text-foreground">
              Find Rides
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
