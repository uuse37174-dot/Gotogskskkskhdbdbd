import React, { useState } from "react";
import { Mail, Lock, Send, Sparkles, Shield, AlertCircle } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    // Simulate small latency for premium feels
    setTimeout(() => {
      const emailLower = trimmedEmail.toLowerCase();
      
      // Admin Validation
      if (emailLower === "beatbounce181@gmail.com") {
        if (trimmedPassword === "Dayal@123Avijit@123") {
          setIsLoading(false);
          onLoginSuccess(trimmedEmail);
          return;
        } else {
          setIsLoading(false);
          setError("Invalid administrator password. Access denied.");
          return;
        }
      }

      // Normal User Validation / Registration (Any Email)
      try {
        const usersStr = localStorage.getItem("tg_sender_users");
        const users = usersStr ? JSON.parse(usersStr) : {};

        if (users[emailLower]) {
          // Existing user - verify password
          if (users[emailLower] === trimmedPassword) {
            setIsLoading(false);
            onLoginSuccess(trimmedEmail);
          } else {
            setIsLoading(false);
            setError("Incorrect password for this email account. Please try again.");
          }
        } else {
          // New user - automatically register
          users[emailLower] = trimmedPassword;
          localStorage.setItem("tg_sender_users", JSON.stringify(users));
          setIsLoading(false);
          onLoginSuccess(trimmedEmail);
        }
      } catch (err) {
        setIsLoading(false);
        setError("An error occurred during authentication.");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans" id="login-page">
      <div className="sm:mx-auto w-full max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/10">
            <Send className="w-6 h-6 transform -rotate-12 translate-x-px -translate-y-px" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-800">
          Telegram Blaster Dashboard
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 font-medium">
          Multi-Group Broadcast Management Workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200 shadow-sm sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 flex items-start space-x-2 text-xs text-rose-700 animate-fadeIn" id="login-error">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400 leading-normal">
                If you are a new user, entering a new password will automatically create and secure your private workspace.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                id="login-submit-btn"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <span>Access Dashboard</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center space-x-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure, end-to-end sandbox storage.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
