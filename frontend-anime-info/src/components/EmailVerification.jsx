import { useEffect, useState } from "react";
import { FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../utils/api";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await authAPI.verifyEmail(token);
      if (response.success) {
        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Email verified successfully! Please log in to continue.",
            },
          });
        }, 3000);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error.message ||
          "Email verification failed. The link may be expired or invalid."
      );
    }
  };

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <>
            <FaSpinner className="text-6xl text-slate-400 mb-6 animate-spin" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Verifying Email...
            </h2>
            <p className="text-slate-300">
              Please wait while we verify your email address.
            </p>
          </>
        );

      case "success":
        return (
          <>
            <FaCheckCircle className="text-6xl text-emerald-400 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Email Verified!
            </h2>
            <p className="text-slate-300 mb-6">{message}</p>
            <div className="animate-pulse text-slate-400">
              Redirecting to login page...
            </div>
          </>
        );

      case "error":
        return (
          <>
            <FaTimesCircle className="text-6xl text-red-400 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Verification Failed
            </h2>
            <p className="text-slate-300 mb-8">{message}</p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="inline-block bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Go to Login
              </Link>
              <div className="block">
                <Link
                  to="/register"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Create new account
                </Link>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
      }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.15) 100%)",
          }}
        ></div>
      </div>

      <div className="relative text-center">
        <div
          className="backdrop-blur-lg rounded-2xl shadow-2xl p-12 max-w-md mx-auto"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
