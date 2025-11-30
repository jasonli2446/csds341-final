import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Calendar,
  MapPin,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMyRides, getMyBookings, Ride, Booking } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoadingRides, setIsLoadingRides] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [ridesError, setRidesError] = useState("");
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    loadMyRides();
    loadMyBookings();
  }, []);

  const loadMyRides = async () => {
    setIsLoadingRides(true);
    setRidesError("");
    try {
      const rides = await getMyRides();
      setMyRides(rides);
    } catch (err) {
      setRidesError(err instanceof Error ? err.message : "Failed to load rides");
    } finally {
      setIsLoadingRides(false);
    }
  };

  const loadMyBookings = async () => {
    setIsLoadingBookings(true);
    setBookingsError("");
    try {
      const bookings = await getMyBookings();
      setMyBookings(bookings);
    } catch (err) {
      setBookingsError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}
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
            {isLoadingRides ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : ridesError ? (
              <div className="text-center py-8 text-destructive">
                <p>{ridesError}</p>
                <Button variant="link" onClick={loadMyRides} className="mt-2">
                  Try again
                </Button>
              </div>
            ) : myRides.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>You haven't offered any rides yet.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/rides/create">Create your first ride</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRides.map((ride) => {
                  const { date: rideDate, time: rideTime } = formatDateTime(ride.departure_time);
                  return (
                    <Link
                      key={ride.ride_id}
                      to={`/rides/${ride.ride_id}`}
                      className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {ride.origin_location} → {ride.destination_location}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            ride.status === "scheduled"
                              ? "bg-green-100 text-green-800"
                              : ride.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ride.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {rideDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rideTime}
                        </span>
                        <span>{ride.seats_available} seats left</span>
                      </div>
                    </Link>
                  );
                })}
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
            {isLoadingBookings ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : bookingsError ? (
              <div className="text-center py-8 text-destructive">
                <p>{bookingsError}</p>
                <Button variant="link" onClick={loadMyBookings} className="mt-2">
                  Try again
                </Button>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>You haven't booked any rides yet.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/rides/search">Find a ride</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => {
                  const { date: rideDate, time: rideTime } = formatDateTime(
                    booking.ride?.departure_time || ""
                  );
                  return (
                    <Link
                      key={booking.booking_id}
                      to={`/rides/${booking.ride_id}`}
                      className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {booking.ride?.origin_location || "Unknown"} →{" "}
                            {booking.ride?.destination_location || "Unknown"}
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
                          {rideDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rideTime}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
