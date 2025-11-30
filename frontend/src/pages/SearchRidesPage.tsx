import { Search, MapPin, Calendar, Clock, DollarSign } from "lucide-react";
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

// Placeholder ride data
const placeholderRides = [
  {
    id: "1",
    origin: "Campus Library",
    destination: "Downtown Mall",
    departureTime: "2025-12-02 09:00",
    seatsAvailable: 3,
    pricePerSeat: 5.0,
    driverName: "Alice J.",
  },
  {
    id: "2",
    origin: "Student Center",
    destination: "Airport",
    departureTime: "2025-12-02 14:30",
    seatsAvailable: 2,
    pricePerSeat: 15.0,
    driverName: "Bob S.",
  },
  {
    id: "3",
    origin: "Dormitory A",
    destination: "Train Station",
    departureTime: "2025-12-03 10:00",
    seatsAvailable: 4,
    pricePerSeat: 8.0,
    driverName: "Alice J.",
  },
];

export default function SearchRidesPage() {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual search
    console.log("Search submitted");
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
              <Input id="origin" placeholder="Origin location" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">To</Label>
              <Input id="destination" placeholder="Destination" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Available Rides ({placeholderRides.length})
        </h2>

        {placeholderRides.map((ride) => (
          <Card key={ride.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {ride.origin} → {ride.destination}
                  </CardTitle>
                  <CardDescription>Driver: {ride.driverName}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    ${ride.pricePerSeat.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">per seat</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {ride.departureTime.split(" ")[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {ride.departureTime.split(" ")[1]}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {ride.seatsAvailable} seats available
                </span>
              </div>
              <Button asChild>
                <a href={`/rides/${ride.id}`}>View Details</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
