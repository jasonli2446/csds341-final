import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Loader2, Plus } from "lucide-react";
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
import { getMyVehicles, createRide, Vehicle } from "@/lib/api";

export default function CreateRidePage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setIsLoadingVehicles(true);
    setVehiclesError("");
    try {
      const data = await getMyVehicles();
      setVehicles(data);
    } catch (err) {
      setVehiclesError(err instanceof Error ? err.message : "Failed to load vehicles");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Combine date and time into ISO string
      const departureDateTime = new Date(`${departureDate}T${departureTime}`);

      await createRide({
        vehicle_id: vehicleId,
        origin_location: origin,
        destination_location: destination,
        departure_time: departureDateTime.toISOString(),
        seats_available: parseInt(seats),
        price_per_seat: parseFloat(price),
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ride");
    } finally {
      setIsSubmitting(false);
    }
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
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Route */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">From (Origin)</Label>
                <Input
                  id="origin"
                  placeholder="e.g., Campus Library"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">To (Destination)</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Downtown Mall"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Date/Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input
                  id="departureDate"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <Label htmlFor="vehicle">Select Vehicle</Label>
              {isLoadingVehicles ? (
                <div className="flex items-center gap-2 h-10 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading vehicles...
                </div>
              ) : vehiclesError ? (
                <div className="text-destructive text-sm">
                  {vehiclesError}{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={loadVehicles}>
                    Try again
                  </Button>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="border rounded-md p-4 text-center text-muted-foreground">
                  <p className="mb-2">You don't have any vehicles registered.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/vehicles/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Add a Vehicle
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <select
                    id="vehicle"
                    aria-label="Select Vehicle"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Choose a vehicle...</option>
                    {vehicles.map((v) => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>
                        {v.make} {v.model} ({v.license_plate})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Don't see your vehicle?{" "}
                    <Link to="/vehicles/create" className="text-primary hover:underline">
                      Add a new vehicle
                    </Link>
                  </p>
                </>
              )}
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
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  required
                  disabled={isSubmitting}
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
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || vehicles.length === 0}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Ride
              </Button>
              <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                <Link to="/dashboard">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
