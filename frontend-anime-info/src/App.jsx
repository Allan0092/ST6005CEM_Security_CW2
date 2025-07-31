import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import Dashboard from "./components/Dashboard";
import EmailVerification from "./components/EmailVerification";
import Favorites from "./components/Favorites";
import ForgotPassword from "./components/ForgotPassword";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import OTPVerification from "./components/OTPVerification";
import Profile from "./components/Profile";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import Search from "./components/Search";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/reset-password/:resetToken"
              element={<ResetPassword />}
            />{" "}
            <Route
              path="/verify-email/:token"
              element={<EmailVerification />}
            />
            {/* Protected routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            {/* For 404 pages */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
