import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { emailValidation, passwordValidation } from '../services/auth';
import type { PasswordStrength } from '../types';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    businessName?: string;
    general?: string;
  }>({});

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding'); // Redirect to onboarding wizard after registration
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      businessName?: string;
    } = {};

    // Email validation
    const emailError = emailValidation.getErrorMessage(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Password validation
    const passwordError = passwordValidation.getErrorMessage(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Business name validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      // Successful registration will trigger redirect via useEffect
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Registration failed. Please try again or contact support.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Update password strength when password changes
    if (field === 'password') {
      const { strength } = passwordValidation.calculateStrength(value);
      setPasswordStrength(strength);
    }

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getPasswordStrengthColor = (): string => {
    switch (passwordStrength) {
      case 'weak':
        return '#f50538'; // Audi red
      case 'fair':
        return '#ff9800'; // Orange
      case 'good':
        return '#2196f3'; // Blue
      case 'strong':
        return '#4caf50'; // Green
      default:
        return '#8a8d8f'; // Audi gray
    }
  };

  const getPasswordStrengthWidth = (): string => {
    switch (passwordStrength) {
      case 'weak':
        return '25%';
      case 'fair':
        return '50%';
      case 'good':
        return '75%';
      case 'strong':
        return '100%';
      default:
        return '0%';
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Your Account</h1>
          <p>Join us and start managing your auto shop</p>
        </div>

        {errors.general && (
          <div className="error-banner" role="alert">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="form-group">
            <label htmlFor="businessName">Business Name</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className={errors.businessName ? 'error' : ''}
              placeholder="Enter your business name"
              autoComplete="organization"
              required
              aria-invalid={!!errors.businessName}
              aria-describedby={errors.businessName ? 'businessName-error' : undefined}
              disabled={isLoading}
            />
            {errors.businessName && (
              <span className="error-message" id="businessName-error" role="alert">
                {errors.businessName}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              autoComplete="email"
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isLoading}
            />
            {errors.email && (
              <span className="error-message" id="email-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onFocus={() => setShowPasswordRequirements(true)}
              className={errors.password ? 'error' : ''}
              placeholder="Create a strong password"
              autoComplete="new-password"
              required
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : 'password-requirements'}
              disabled={isLoading}
            />
            {errors.password && (
              <span className="error-message" id="password-error" role="alert">
                {errors.password}
              </span>
            )}

            {formData.password && (
              <div className="password-strength">
                <div className="password-strength-bar">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: getPasswordStrengthWidth(),
                      backgroundColor: getPasswordStrengthColor(),
                    }}
                  ></div>
                </div>
                <span className="password-strength-label" style={{ color: getPasswordStrengthColor() }}>
                  {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                </span>
              </div>
            )}

            {showPasswordRequirements && (
              <div className="password-requirements" id="password-requirements">
                <p className="requirements-title">Password must contain:</p>
                <ul>
                  <li className={formData.password.length >= 8 ? 'met' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
                    One lowercase letter
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
                    One uppercase letter
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>One number</li>
                  <li className={/[^a-zA-Z0-9]/.test(formData.password) ? 'met' : ''}>
                    One special character (recommended)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <span className="error-message" id="confirmPassword-error" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign in
            </Link>
          </p>
        </div>

        <div className="oauth-section">
          <div className="divider">
            <span>Or sign up with</span>
          </div>
          <div className="oauth-buttons">
            <button type="button" className="oauth-button google" disabled>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button type="button" className="oauth-button microsoft" disabled>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#f25022" d="M1 1h10v10H1z" />
                <path fill="#00a4ef" d="M13 1h10v10H13z" />
                <path fill="#7fba00" d="M1 13h10v10H1z" />
                <path fill="#ffb900" d="M13 13h10v10H13z" />
              </svg>
              Microsoft
            </button>
          </div>
          <p className="oauth-note">OAuth integration coming soon</p>
        </div>
      </div>
    </div>
  );
}
