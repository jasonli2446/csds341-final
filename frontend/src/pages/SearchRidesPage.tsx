import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Clock, Users, Loader2 } from "lucide-react";
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
import { searchRides, Ride } from "@/lib/api";

export default function SearchRidesPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Load initial rides on mount
  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async (params?: { origin?: string; destination?: string; date?: string }) => {
    setIsLoading(true);
    setError("");
    try {
      const results = await searchRides(params || {});
      setRides(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rides");
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadRides({
      origin: origin || undefined,
      destination: destination || undefined,
      date: date || undefined,
    });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Ride</h1>
        <p className="text-muted-foreground">
          Search for rides going your way
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">From</Label>
              <Input
                id="origin"
                placeholder="Origin location"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">To</Label>
              <Input
                id="destination"
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {hasSearched
            ? `Available Rides (${rides.length})`
            : "Loading rides..."}
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : rides.length === 0 && hasSearched ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No rides found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your search filters.</p>
            </CardContent>
          </Card>
        ) : (
          rides.map((ride) => {
            const { date: rideDate, time: rideTime } = formatDateTime(ride.departure_time);
            return (
              <Card key={ride.ride_id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {ride.origin_location} → {ride.destination_location}
                      </CardTitle>
                      <CardDescription>
                        {ride.seats_available} seat{ride.seats_available !== 1 ? "s" : ""} available
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${parseFloat(ride.price_per_seat).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">per seat</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {rideDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {rideTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {ride.seats_available} seats
                    </span>
                  </div>
                  <Button asChild>
                    <Link to={`/rides/${ride.ride_id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
