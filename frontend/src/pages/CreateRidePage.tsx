import { Link } from "react-router-dom";
import { ArrowLeft, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Placeholder vehicles
const placeholderVehicles = [
  { id: "v1", make: "Toyota", model: "Camry", licensePlate: "ABC-1234" },
  { id: "v2", make: "Honda", model: "CR-V", licensePlate: "XYZ-5678" },
];

export default function CreateRidePage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual ride creation
    console.log("Create ride submitted");
  };

  return (
    <div className="container py-8 max-w-2xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <CardTitle>Offer a Ride</CardTitle>
          </div>
          <CardDescription>
            Share your trip with other students and split costs
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Route */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">From (Origin)</Label>
                <Input
                  id="origin"
                  placeholder="e.g., Campus Library"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">To (Destination)</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Downtown Mall"
                  required
                />
              </div>
            </div>

            {/* Date/Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input id="departureDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input id="departureTime" type="time" required />
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <Label htmlFor="vehicle">Select Vehicle</Label>
              <select
                id="vehicle"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Choose a vehicle...</option>
                {placeholderVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.licensePlate})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Don't see your vehicle?{" "}
                <Link to="/dashboard" className="text-primary hover:underline">
                  Add a new vehicle
                </Link>
              </p>
            </div>

            {/* Seats and Price */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seats">Available Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="e.g., 3"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Seat ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.50"
                  placeholder="e.g., 5.00"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Create Ride
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
