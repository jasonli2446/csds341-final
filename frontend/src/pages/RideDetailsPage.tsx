import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Loader2,
  CheckCircle,
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
import { getRide, bookRide, Ride } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function RideDetailsPage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (rideId) {
      loadRide();
    }
  }, [rideId]);

  const loadRide = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getRide(rideId!);
      setRide(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ride");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookRide = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsBooking(true);
    setBookingError("");
    try {
      await bookRide(rideId!);
      setBookingSuccess(true);
      // Refresh ride data to get updated seats
      await loadRide();
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-3xl">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/rides/search">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{error || "Ride not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { date: rideDate, time: rideTime } = formatDateTime(ride.departure_time);
  const isOwnRide = user && ride.driver_id === user.user_id;
  const canBook = isAuthenticated && !isOwnRide && ride.seats_available > 0 && ride.status === "scheduled";

  return (
    <div className="container py-8 max-w-3xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/rides/search">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Link>
      </Button>

      {/* Booking Success */}
      {bookingSuccess && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>Ride booked successfully! Check your dashboard for details.</span>
        </div>
      )}

      {/* Main Ride Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {ride.origin_location}
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                to {ride.destination_location}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">
                ${parseFloat(ride.price_per_seat).toFixed(2)}
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
                <p className="font-medium">{rideDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Departure</p>
                <p className="font-medium">{rideTime}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seats Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Available Seats</p>
                <p className="font-medium">{ride.seats_available} seats</p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
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

          <Separator />

          {/* Driver Info */}
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Driver</p>
              <p className="font-medium">
                {isOwnRide ? "You are the driver" : "Contact after booking"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Booking Error */}
          {bookingError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {bookingError}
            </div>
          )}

          {/* Book Button */}
          {!bookingSuccess && (
            <>
              {isOwnRide ? (
                <div className="text-center text-muted-foreground py-4">
                  This is your ride. You can manage it from your dashboard.
                </div>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleBookRide}
                    disabled={!canBook || isBooking}
                  >
                    {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {ride.seats_available === 0
                      ? "No Seats Available"
                      : ride.status !== "scheduled"
                      ? `Ride ${ride.status}`
                      : "Book This Ride"}
                  </Button>
                  {!isAuthenticated && (
                    <p className="text-xs text-center text-muted-foreground">
                      <Link to="/login" className="text-primary hover:underline">
                        Sign in
                      </Link>{" "}
                      to book this ride
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
