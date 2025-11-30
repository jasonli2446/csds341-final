import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchRidesPage from "./pages/SearchRidesPage";
import RideDetailsPage from "./pages/RideDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import CreateRidePage from "./pages/CreateRidePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="rides/search" element={<SearchRidesPage />} />
        <Route path="rides/create" element={<CreateRidePage />} />
        <Route path="rides/:rideId" element={<RideDetailsPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export default App;
