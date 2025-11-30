const API_BASE = "/api";

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  created_at: string;
}

export interface Vehicle {
  vehicle_id: string;
  owner_id: string;
  make: string;
  model: string;
  color: string | null;
  license_plate: string;
  seats_total: number;
  year: number | null;
  notes: string | null;
}

export interface Ride {
  ride_id: string;
  driver_id: string;
  vehicle_id: string;
  origin_location: string;
  destination_location: string;
  departure_time: string;
  arrival_time: string | null;
  price_per_seat: string;
  seats_available: number;
  status: string;
}

export interface Booking {
  booking_id: string;
  ride_id: string;
  passenger_id: string;
  booking_time: string;
  status: string;
  ride?: Ride;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
}

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export function setToken(token: string): void {
  localStorage.setItem("access_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function setStoredUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user));
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Auth endpoints
export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<User> {
  return apiFetch<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>("/auth/me");
}

// Rides endpoints
export async function searchRides(params: {
  origin?: string;
  destination?: string;
  date?: string;
}): Promise<Ride[]> {
  const searchParams = new URLSearchParams();
  if (params.origin) searchParams.set("origin", params.origin);
  if (params.destination) searchParams.set("destination", params.destination);
  if (params.date) searchParams.set("date", params.date);

  const queryString = searchParams.toString();
  const endpoint = `/rides/search${queryString ? `?${queryString}` : ""}`;
  return apiFetch<Ride[]>(endpoint);
}

export async function getRide(rideId: string): Promise<Ride> {
  return apiFetch<Ride>(`/rides/${rideId}`);
}

export async function createRide(payload: {
  vehicle_id: string;
  origin_location: string;
  destination_location: string;
  departure_time: string;
  arrival_time?: string;
  price_per_seat: number;
  seats_available: number;
}): Promise<Ride> {
  return apiFetch<Ride>("/rides", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyRides(): Promise<Ride[]> {
  return apiFetch<Ride[]>("/rides/mine");
}

// Bookings endpoints
export async function bookRide(rideId: string): Promise<Booking> {
  return apiFetch<Booking>(`/rides/${rideId}/book`, {
    method: "POST",
  });
}

export async function getMyBookings(): Promise<Booking[]> {
  return apiFetch<Booking[]>("/bookings/mine");
}

export async function cancelBooking(bookingId: string): Promise<void> {
  return apiFetch<void>(`/bookings/${bookingId}`, {
    method: "DELETE",
  });
}

// Vehicles endpoints
export async function getMyVehicles(): Promise<Vehicle[]> {
  return apiFetch<Vehicle[]>("/vehicles/mine");
}

export async function createVehicle(payload: {
  make: string;
  model: string;
  license_plate: string;
  seats_total: number;
  color?: string;
  year?: number;
  notes?: string;
}): Promise<Vehicle> {
  return apiFetch<Vehicle>("/vehicles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
