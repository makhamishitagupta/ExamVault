import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE, isAuthenticated } from '../utils/auth';
import { useForm } from "react-hook-form";
import { FiUser, FiAtSign, FiMail, FiLock } from 'react-icons/fi';
const Register = () => {
  const navigate = useNavigate();
  const { register: registerForm, handleSubmit: handleSubmitForm, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const response = await fetch(`${API_BASE}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (result.message === "User registered successfully") {
      navigate('/login');
    } else {
      console.log(result.message);
    }
  }

  const handleError = (error) => {
    console.log(error);
  }

  useEffect(() => {
    // Redirect if already logged in
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

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
            <p className="mt-2 text-gray-400">Create your account</p>
          </div>

          {/* Error Message */}
          {errors.root?.message && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
              {errors.root.message}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmitForm(onSubmit, handleError)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  {...registerForm("name", { required: true })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-white placeholder-gray-500"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <FiAtSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  {...registerForm("username", { required: true })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-white placeholder-gray-500"
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
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
                  {...registerForm("email", { required: true })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-white placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
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
                  {...registerForm("password", { required: true })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-white placeholder-gray-500"
                  placeholder="Create a password"
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 mt-6"
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

