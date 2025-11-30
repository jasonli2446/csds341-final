import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Car,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Placeholder ride data
const placeholderRide = {
  id: "1",
  origin: "Campus Library",
  destination: "Downtown Mall",
  departureTime: "2025-12-02T09:00:00Z",
  arrivalTime: "2025-12-02T09:45:00Z",
  seatsAvailable: 3,
  pricePerSeat: 5.0,
  status: "scheduled",
  driver: {
    name: "Alice Johnson",
    email: "alice@student.edu",
  },
  vehicle: {
    make: "Toyota",
    model: "Camry",
    color: "Silver",
    licensePlate: "ABC-1234",
    year: 2020,
  },
};

export default function RideDetailsPage() {
  const { rideId } = useParams();

  const handleBookRide = () => {
    // TODO: Implement actual booking
    console.log("Booking ride:", rideId);
  };

  return (
    <div className="container py-8 max-w-3xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/rides/search">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Link>
      </Button>

      {/* Main Ride Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {placeholderRide.origin}
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                to {placeholderRide.destination}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">
                ${placeholderRide.pricePerSeat.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">per seat</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(placeholderRide.departureTime).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Departure</p>
                <p className="font-medium">
                  {new Date(placeholderRide.departureTime).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seats Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Available Seats</p>
                <p className="font-medium">
                  {placeholderRide.seatsAvailable} of 4 seats
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                placeholderRide.status === "scheduled"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {placeholderRide.status}
            </span>
          </div>

          <Separator />

          {/* Driver Info */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Driver</p>
              <p className="font-medium">{placeholderRide.driver.name}</p>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="flex items-center gap-3">
            <Car className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-medium">
                {placeholderRide.vehicle.year} {placeholderRide.vehicle.make}{" "}
                {placeholderRide.vehicle.model}
              </p>
              <p className="text-sm text-muted-foreground">
                {placeholderRide.vehicle.color} •{" "}
                {placeholderRide.vehicle.licensePlate}
              </p>
            </div>
          </div>

          <Separator />

          {/* Book Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleBookRide}
            disabled={placeholderRide.seatsAvailable === 0}
          >
            Book This Ride
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You'll need to be logged in to book a ride
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
