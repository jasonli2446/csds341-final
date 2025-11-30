import { Link } from "react-router-dom";
import { Car, MapPin, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container flex flex-col items-center text-center gap-8">
          <div className="flex items-center gap-3">
            <Car className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Campus Carpool
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-[600px]">
            Share rides with fellow students. Save money, reduce emissions, and
            make new friends on your commute.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link to="/rides/search">Find a Ride</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <MapPin className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Search Rides</CardTitle>
              <CardDescription>
                Find rides going your way. Filter by origin, destination, and
                date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Browse available rides from fellow students heading in your
                direction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Book Your Seat</CardTitle>
              <CardDescription>
                Reserve your spot with a single click. Get confirmation
                instantly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secure booking system ensures your seat is guaranteed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Share Costs</CardTitle>
              <CardDescription>
                Split gas money fairly. Drivers set prices, passengers save.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Transparent pricing makes carpooling affordable for everyone.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-muted-foreground mb-8 max-w-[500px] mx-auto">
            Join the campus carpool community today. Create an account and start
            sharing rides.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/register">Create Account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
