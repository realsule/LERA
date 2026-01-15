import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authSchemas, validateField } from '../utils/validations';

const Login = () => {
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: authSchemas.login,
    onSubmit: async (values, { setSubmitting }) => {
      setFieldErrors({});
      try {
        const result = await login(values);
        
        if (result && result.success) {
          navigate(from, { replace: true });
        } else {
          // Handle specific field errors if they exist
          const errorMsg = result?.error || 'Login failed. Please check your credentials.';
          if (errorMsg.includes('email')) {
            setFieldErrors({ email: errorMsg });
          } else if (errorMsg.includes('password')) {
            setFieldErrors({ password: errorMsg });
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        setFieldErrors({ email: 'Login failed. Please try again.' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFieldBlur = async (field, value) => {
    const validation = await validateField(authSchemas.login, field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? null : validation.error
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <User className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
                    fieldErrors.email || formik.errors.email
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Enter your email"
                  value={formik.values.email}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: null }));
                    }
                  }}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('email', e.target.value);
                  }}
                />
              </div>
              {(fieldErrors.email || formik.errors.email) && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {fieldErrors.email || formik.errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${
                    fieldErrors.password || formik.errors.password
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={(e) => {
                    formik.handleChange(e);
                    if (fieldErrors.password) {
                      setFieldErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    handleFieldBlur('password', e.target.value);
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {(fieldErrors.password || formik.errors.password) && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {fieldErrors.password || formik.errors.password}
                </div>
              )}
            </div>
          </div>

          {/* General Error Display */}
          {error && !fieldErrors.email && !fieldErrors.password && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Login failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || formik.isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || formik.isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        {/* Demo Account Info */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Demo Account (for testing):
            </p>
            <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-700">
              <p><strong>Email:</strong> demo@example.com</p>
              <p><strong>Password:</strong> Demo123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;