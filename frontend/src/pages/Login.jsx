import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { API_BASE, peekPendingAction } from "../utils/auth";
import { FiMail, FiLock } from 'react-icons/fi';



const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loginError, setLoginError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const navigateAfterLogin = (user) => {
    const pending = peekPendingAction();
    const from = location.state?.from;

    if (user.role === "admin") {
      navigate("/admin");
      return;
    }

    if (pending?.returnTo) {
      navigate(pending.returnTo);
      return;
    }

    if (from) {
      navigate(from);
      return;
    }

    navigate("/");
  };

  const persistAuth = (result) => {
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    navigateAfterLogin(result.user);
  };

  useEffect(() => {
    if (!googleClientId) return;

    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => setLoginError('Failed to load Google Sign-In. Please try again later.');

    document.body.appendChild(script);
  }, [googleClientId]);

  // On submit
  const onSubmit = async (data) => {
    setLoginError(''); // Clear previous errors
    
    try {
      const response = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await response.json();

      if (response.ok && result.status === "ok") {
        persistAuth(result);
      } else {
        setLoginError(result.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setLoginError("Network error. Please try again.");
      console.error("Login error:", err);
    }
  }

  const handleGoogleSignIn = async () => {
    setLoginError('');

    if (!googleClientId) {
      setLoginError('Google Sign-In is not configured. Please add VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    if (!window.google?.accounts?.id) {
      setLoginError('Google Sign-In is still loading. Please wait a moment and try again.');
      return;
    }

    setGoogleLoading(true);

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        try {
          if (!response?.credential) {
            setLoginError('Google Sign-In was cancelled. Please try again.');
            return;
          }

          const backendRes = await fetch(`${API_BASE}/user/google-signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ credential: response.credential }),
            credentials: 'include',
          });

          const result = await backendRes.json().catch(() => ({}));
          if (backendRes.ok && result.status === 'ok') {
            persistAuth(result);
          } else {
            setLoginError(result.message || 'Google Sign-In failed. Please try again.');
          }
        } catch (err) {
          console.error('Google login error:', err);
          setLoginError('Google Sign-In failed. Please try again.');
        } finally {
          setGoogleLoading(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setGoogleLoading(false);
      }
    });
  };

  const handleError = (error) => {
    console.log(error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">E</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">ExamVault</h2>
            <p className="mt-2 text-gray-400">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
              {loginError}
            </div>
          )}
          {errors.root?.message && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
              {errors.root.message}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit, handleError)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  {...register("email", { required: true })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-white placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  {...register("password", { required: true })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-white placeholder-gray-500"
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                Login as
              </label>
              <div className="flex gap-3">
                <label className="flex items-center flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    {...register("role", { required: true })}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="ml-2 text-gray-300">Student</span>
                </label>
                <label className="flex items-center flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    {...register("role", { required: true })}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="ml-2 text-gray-300">Admin</span>
                </label>
              </div>
              {errors.role && (
                <p className="text-red-400 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 mt-6"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-sm text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || !googleReady}
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Opening Google...' : 'Continue with Google'}
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

