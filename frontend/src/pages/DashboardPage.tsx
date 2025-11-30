import { Link } from "react-router-dom";
import {
  Car,
  Calendar,
  MapPin,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Placeholder data
const placeholderUser = {
  name: "Alice Johnson",
  email: "alice@student.edu",
  role: "student",
};

const placeholderMyRides = [
  {
    id: "1",
    origin: "Campus Library",
    destination: "Downtown Mall",
    departureTime: "2025-12-02 09:00",
    seatsAvailable: 3,
    status: "scheduled",
  },
  {
    id: "2",
    origin: "Student Center",
    destination: "Airport",
    departureTime: "2025-12-02 14:30",
    seatsAvailable: 2,
    status: "scheduled",
  },
];

const placeholderMyBookings = [
  {
    id: "b1",
    rideOrigin: "Gym",
    rideDestination: "Downtown Mall",
    departureTime: "2025-12-02 10:30",
    status: "confirmed",
    driverName: "Bob S.",
  },
  {
    id: "b2",
    rideOrigin: "Student Center",
    rideDestination: "Beach",
    departureTime: "2025-12-03 08:00",
    status: "confirmed",
    driverName: "Bob S.",
  },
];

export default function DashboardPage() {
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {placeholderUser.name}
          </p>
        </div>
        <Button asChild>
          <Link to="/rides/create">
            <Plus className="mr-2 h-4 w-4" />
            Offer a Ride
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Rides (as driver) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              My Rides (as Driver)
            </CardTitle>
            <CardDescription>Rides you're offering to others</CardDescription>
          </CardHeader>
          <CardContent>
            {placeholderMyRides.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>You haven't offered any rides yet.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/rides/create">Create your first ride</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {placeholderMyRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {ride.origin} → {ride.destination}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          ride.status === "scheduled"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ride.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {ride.departureTime.split(" ")[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ride.departureTime.split(" ")[1]}
                      </span>
                      <span>{ride.seatsAvailable} seats left</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Bookings (as passenger) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Bookings
            </CardTitle>
            <CardDescription>Rides you've booked as a passenger</CardDescription>
          </CardHeader>
          <CardContent>
            {placeholderMyBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>You haven't booked any rides yet.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/rides/search">Find a ride</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {placeholderMyBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {booking.rideOrigin} → {booking.rideDestination}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.status === "confirmed" && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {booking.status === "cancelled" && (
                          <XCircle className="h-3 w-3" />
                        )}
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {booking.departureTime.split(" ")[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.departureTime.split(" ")[1]}
                      </span>
                      <span>Driver: {booking.driverName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
