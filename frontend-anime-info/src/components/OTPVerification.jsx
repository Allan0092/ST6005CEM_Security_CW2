import { useEffect, useState } from "react";
import { FaArrowLeft, FaCheck, FaEnvelope, FaShieldAlt, FaTimes } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthStatus } = useAuth(); 
  
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [animationStep, setAnimationStep] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Get email from location state (passed from login)
  const email = location.state?.email;
  const otpExpires = location.state?.otpExpires;

  useEffect(() => {
    if (!email) {// if no email provided
      navigate("/login");
      return;
    }

    // Animation sequence
    const sequence = [0, 1, 2, 3];
    sequence.forEach((step, index) => {
      setTimeout(() => setAnimationStep(step), index * 200);
    });

    // Set initial time from expiry
    if (otpExpires) {
      const remaining = Math.max(0, Math.floor((new Date(otpExpires) - new Date()) / 1000));
      console.log('OTP expires at:', new Date(otpExpires));
      console.log('Current time:', new Date());
      console.log('Time remaining (seconds):', remaining);
      setTimeLeft(remaining);
    } else {
      setTimeLeft(600);// If no expiry time provided, default to 10 minutes
    }
  }, [email, navigate, otpExpires]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Auto-focus first input
  useEffect(() => {
    const firstInput = document.getElementById("otp-0");
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: "" }));
    }

    // Auto-focus next input
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && otpCode[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
    
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedCode = text.replace(/\D/g, "").slice(0, 6);
        if (pastedCode.length === 6) {
          setOtpCode(pastedCode.split(""));
          // Focus last input
          const lastInput = document.getElementById("otp-5");
          if (lastInput) {
            lastInput.focus();
          }
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fullOtp = otpCode.join("");
    
    if (fullOtp.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit code" });
      return;
    }

    if (timeLeft <= 0) {
      setErrors({ otp: "OTP has expired. Please request a new one." });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authAPI.verifyOTP({
        email,
        otpCode: fullOtp,
      });

      console.log('OTP verification response:', response);

      if (response.success) {
        // Store token
        const token = response.data.token;
        localStorage.setItem("token", token);
        console.log('Token stored:', token);
        
        // Refresh auth state to get user data
        await checkAuthStatus();
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate("/dashboard", {
            state: { message: "Login successful!" }
          });
        }, 500);
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      
      if (error.message.includes("Too many failed attempts")) {
        setErrors({
          otp: "Too many failed attempts. Please request a new OTP.",
        });
        setAttemptsRemaining(0);
      } else if (error.message.includes("expired")) {
        setErrors({
          otp: "OTP has expired. Please request a new one.",
        });
        setTimeLeft(0);
      } else if (error.message.includes("Invalid OTP")) {
        const remaining = Math.max(0, attemptsRemaining - 1);
        setAttemptsRemaining(remaining);
        setErrors({
          otp: `Invalid OTP code. ${remaining} attempts remaining.`,
        });
      } else {
        setErrors({
          otp: error.message || "Verification failed. Please try again.",
        });
      }
      
      // Clear OTP inputs on error
      setOtpCode(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("otp-0");
      if (firstInput) {
        firstInput.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setErrors({});

    try {
      const response = await authAPI.resendOTP({ email });
      
      if (response.success) {
        setTimeLeft(600); // Reset to 10 minutes
        setAttemptsRemaining(5); // Reset attempts
        setOtpCode(["", "", "", "", "", ""]);
        
        // Show success message briefly
        setErrors({ success: "New OTP sent to your email!" });
        setTimeout(() => setErrors({}), 3000);
        
        // Focus first input
        const firstInput = document.getElementById("otp-0");
        if (firstInput) {
          firstInput.focus();
        }
      }
    } catch (error) {
      console.error("Resend OTP failed:", error);
      setErrors({
        general: error.message || "Failed to resend OTP. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const maskedEmail = email ? 
    email.replace(/(.{2})(.*)(@.*)/, (_, start, middle, end) => 
      start + "*".repeat(middle.length) + end
    ) : "";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #201f31 0%, #1a1827 25%, #151420 50%, #1a1827 75%, #201f31 100%)",
      }}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, rgba(71, 85, 105, 0.15) 100%)",
          }}
        ></div>
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            background:
              "radial-gradient(circle, rgba(148, 163, 184, 0.25) 0%, rgba(100, 116, 139, 0.12) 100%)",
          }}
        ></div>
      </div>

      <div
        className={`relative w-full max-w-md transition-all duration-1000 ${
          animationStep >= 0
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <div
          className="backdrop-blur-xl rounded-3xl shadow-2xl p-10 relative overflow-hidden"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.2)",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div className="relative z-10">
            {/* Back Button */}
            <Link
              to="/login"
              className={`inline-flex items-center text-slate-400 hover:text-white transition-colors mb-6 ${
                animationStep >= 1
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              <FaArrowLeft className="mr-2" />
              Back to Login
            </Link>

            {/* Header */}
            <div
              className={`text-center mb-8 transition-all duration-700 delay-200 ${
                animationStep >= 1
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 relative"
                style={{
                  background:
                    "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  boxShadow: "0 8px 32px rgba(100, 116, 139, 0.3)",
                }}
              >
                <FaShieldAlt className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Verify Your Login
              </h2>
              <p className="text-slate-300 text-base mb-2">
                Enter the 6-digit code sent to
              </p>
              <p className="text-slate-200 font-medium">{maskedEmail}</p>
            </div>

            {/* Timer */}
            {timeLeft > 0 && (
              <div
                className={`text-center mb-6 transition-all duration-700 delay-300 ${
                  animationStep >= 2
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                }`}
              >
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <FaEnvelope className="mr-2" />
                  <span>Code expires in {formatTime(timeLeft)}</span>
                </div>
              </div>
            )}

            {/* Show expired message only if timeLeft is 0 and we had a valid expiry time */}
            {timeLeft === 0 && otpExpires && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-red-500/20 text-red-400">
                  <FaEnvelope className="mr-2" />
                  <span>Code has expired</span>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {errors.success && (
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center">
                  <FaCheck className="text-emerald-400 mr-2" />
                  <p className="text-emerald-400 text-sm">{errors.success}</p>
                </div>
              </div>
            )}

            {/* OTP Form */}
            <form
              onSubmit={handleSubmit}
              className={`transition-all duration-700 delay-400 ${
                animationStep >= 3
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0"
              }`}
            >
              {/* OTP Inputs */}
              <div className="mb-6">
                <div className="flex justify-center space-x-3 mb-4">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      maxLength={1}
                      className={`w-12 h-14 text-center text-2xl font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                        errors.otp
                          ? "border-red-400/60 focus:ring-red-400/50"
                          : "border-slate-500/30 focus:ring-slate-400/50"
                      }`}
                      style={{
                        backgroundColor: "rgba(71, 85, 105, 0.25)",
                        border: errors.otp
                          ? "2px solid rgba(248, 113, 113, 0.6)"
                          : "2px solid rgba(100, 116, 139, 0.3)",
                      }}
                      disabled={isLoading || (timeLeft <= 0 && otpExpires)}
                    />
                  ))}
                </div>
                
                {errors.otp && (
                  <div className="flex items-center justify-center text-red-400 text-sm">
                    <FaTimes className="mr-1" />
                    {errors.otp}
                  </div>
                )}

                {attemptsRemaining < 5 && attemptsRemaining > 0 && (
                  <p className="text-center text-amber-400 text-sm mt-2">
                    {attemptsRemaining} attempts remaining
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || (timeLeft <= 0 && otpExpires) || otpCode.join("").length !== 6}
                className={`w-full py-4 px-6 font-bold rounded-xl transition-all duration-500 transform relative overflow-hidden group text-lg ${
                  isLoading || (timeLeft <= 0 && otpExpires) || otpCode.join("").length !== 6
                    ? "cursor-not-allowed opacity-50"
                    : "hover:scale-[1.02] hover:shadow-2xl"
                }`}
                style={{
                  background:
                    isLoading || (timeLeft <= 0 && otpExpires) || otpCode.join("").length !== 6
                      ? "rgba(100, 116, 139, 0.5)"
                      : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  boxShadow:
                    isLoading || (timeLeft <= 0 && otpExpires) || otpCode.join("").length !== 6
                      ? "none"
                      : "0 15px 35px rgba(100, 116, 139, 0.4)",
                }}
              >
                <div className="relative flex items-center justify-center text-white">
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin mr-3"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <FaShieldAlt className="mr-3 group-hover:scale-110 transition-transform duration-300 text-xl" />
                      <span>Verify Code</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Resend OTP */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm mb-3">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendOTP}
                disabled={isResending || timeLeft > 540} // Can resend after 1 minute
                className={`font-medium transition-colors ${
                  isResending || timeLeft > 540
                    ? "text-slate-500 cursor-not-allowed"
                    : "text-slate-200 hover:text-white hover:underline"
                }`}
              >
                {isResending ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-t-2 border-slate-400 rounded-full animate-spin mr-2"></div>
                    Sending new code...
                  </span>
                ) : timeLeft > 540 ? (
                  `Request new code in ${formatTime(timeLeft - 540)}`
                ) : (
                  "Send new code"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;