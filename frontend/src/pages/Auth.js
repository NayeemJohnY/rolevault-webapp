import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const strengthLabel = (score) => {
    switch (score) {
        case 0:
        case 1:
            return 'Weak';
        case 2:
            return 'Fair';
        case 3:
            return 'Good';
        case 4:
            return 'Strong';
        default:
            return '';
    }
};

const getPasswordScore = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
};

export default function Auth() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, verifyTOTP, register } = useAuth();

    // Determine active tab from URL - no state needed
    const activeTab = location.pathname === '/register' ? 'register' : 'login';

    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    // Register form state
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // TOTP verification state
    const [totpRequired, setTotpRequired] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [totpCode, setTotpCode] = useState('');

    // Common state
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showTestAccounts, setShowTestAccounts] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    const handleTabChange = (tab) => {
        navigate(tab === 'register' ? '/register' : '/login');
        setFieldErrors({});
        setGeneralError('');
        setTotpRequired(false);
        setTotpCode('');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setGeneralError('');

        const result = await login(loginData.email, loginData.password);

        if (result.requiresTOTP) {
            // TOTP verification required
            setTotpRequired(true);
            setTempToken(result.tempToken);
            setLoading(false);
        } else if (result.success) {
            navigate('/dashboard');
        } else {
            setGeneralError(result.error || 'Login failed');
        }
    };

    const handleTotpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setGeneralError('');

        const result = await verifyTOTP(tempToken, totpCode);

        if (result.success) {
           navigate('/dashboard');
        } else {
            setGeneralError(result.error || 'Invalid TOTP code');
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setTotpRequired(false);
        setTotpCode('');
        setTempToken('');
        setGeneralError('');
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});
        setGeneralError('');

        if (!registerData.name.trim()) {
            setFieldErrors({ name: 'Name is required' });
            setLoading(false);
            return;
        }
        if (registerData.password !== registerData.confirmPassword) {
            setFieldErrors({ confirmPassword: 'Passwords do not match' });
            setLoading(false);
            return;
        }

        const result = await register({
            name: registerData.name,
            email: registerData.email,
            password: registerData.password
        });

        if (result.success) {
            navigate('/dashboard');
        } else {
            if (result.fieldErrors) {
                setFieldErrors(result.fieldErrors);
            } else {
                setGeneralError(result.error || 'Registration failed');
            }
        }

        setLoading(false);
    };

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegisterChange = (e) => {
        setRegisterData({
            ...registerData,
            [e.target.name]: e.target.value
        });
    };

    const testAccounts = [
        { email: 'admin@rolevault.com', password: 'admin123', role: 'Admin' },
        { email: 'contributor@rolevault.com', password: 'contrib123', role: 'Contributor' },
        { email: 'viewer@rolevault.com', password: 'viewer123', role: 'Viewer' }
    ];

    const loginWithTestAccount = (email, password) => {
        setLoginData({ email, password });
    };

    const passwordScore = getPasswordScore(registerData.password);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Role Vault
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Secure role-based vault
                    </p>
                </div>

                {/* Container */}
                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => handleTabChange('login')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${activeTab === 'login'
                                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            data-testid="login-tab"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => handleTabChange('register')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${activeTab === 'register'
                                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            data-testid="register-tab"
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        {activeTab === 'login' ? (
                            totpRequired ? (
                                /* TOTP Verification Form */
                                <form onSubmit={handleTotpSubmit} className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                                            <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Two-Factor Authentication
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Enter the 6-digit code from your authenticator app
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="totp-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                                            Authentication Code
                                        </label>
                                        <input
                                            id="totp-code"
                                            name="totpCode"
                                            type="text"
                                            maxLength="6"
                                            pattern="[0-9]{6}"
                                            autoComplete="off"
                                            required
                                            value={totpCode}
                                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                            placeholder="000000"
                                            data-testid="totp-code-input"
                                            autoFocus
                                        />
                                    </div>

                                    {generalError && (
                                        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg" data-testid="form-error">
                                            {generalError}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <button
                                            type="submit"
                                            disabled={loading || totpCode.length !== 6}
                                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                            data-testid="totp-verify-submit"
                                        >
                                            {loading ? <LoadingSpinner size="sm" /> : 'Verify & Sign In'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleBackToLogin}
                                            disabled={loading}
                                            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                                            data-testid="back-to-login"
                                        >
                                            Back to Login
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* Login Form */
                                <form onSubmit={handleLoginSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            id="login-email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={loginData.email}
                                            onChange={handleLoginChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                            placeholder="Enter your email"
                                            data-testid="login-email-input"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="login-password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                required
                                                value={loginData.password}
                                                onChange={handleLoginChange}
                                                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                                placeholder="Enter your password"
                                                data-testid="login-password-input"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                                data-testid="toggle-password"
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {generalError && (
                                        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg" data-testid="form-error">
                                            {generalError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                        data-testid="login-submit"
                                    >
                                        {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                                    </button>

                                    {/* Test Accounts */}
                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowTestAccounts(!showTestAccounts)}
                                            className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
                                            data-testid="show-test-accounts"
                                        >
                                            {showTestAccounts ? 'Hide' : 'Show'} Test Accounts
                                        </button>

                                        {showTestAccounts && (
                                            <div className="mt-4 space-y-2">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                                    Quick login with test accounts:
                                                </p>
                                                {testAccounts.map((account) => (
                                                    <button
                                                        key={account.email}
                                                        type="button"
                                                        onClick={() => loginWithTestAccount(account.email, account.password)}
                                                        className="w-full text-left px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                                                        data-testid={`test-account-${account.role.toLowerCase()}`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {account.role}
                                                            </span>
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                                {account.email}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )
                        ) : (
                            /* Register Form */
                            <form onSubmit={handleRegisterSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        id="register-name"
                                        name="name"
                                        type="text"
                                        required
                                        value={registerData.name}
                                        onChange={handleRegisterChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                        placeholder="Enter your full name"
                                        data-testid="register-name"
                                    />
                                    {fieldErrors.name && (
                                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">{fieldErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="register-email"
                                        name="email"
                                        type="email"
                                        required
                                        value={registerData.email}
                                        onChange={handleRegisterChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                        placeholder="Enter your email"
                                        data-testid="register-email"
                                    />
                                    {fieldErrors.email && (
                                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">{fieldErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="register-password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={registerData.password}
                                            onChange={handleRegisterChange}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                            placeholder="Create a password"
                                            data-testid="register-password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {fieldErrors.password && (
                                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">{fieldErrors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="register-confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="register-confirm"
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={registerData.confirmPassword}
                                        onChange={handleRegisterChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
                                        placeholder="Confirm your password"
                                        data-testid="register-confirm"
                                    />
                                    {fieldErrors.confirmPassword && (
                                        <p className="text-red-600 dark:text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                                    )}
                                </div>

                                {/* Password Strength Indicator */}
                                {registerData.password && (
                                    <div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-lg overflow-hidden">
                                            <div
                                                style={{ width: `${(passwordScore / 4) * 100}%` }}
                                                className={`h-2 transition-all duration-300 ${passwordScore < 2
                                                    ? 'bg-red-500'
                                                    : passwordScore === 2
                                                        ? 'bg-yellow-400'
                                                        : passwordScore === 3
                                                            ? 'bg-green-400'
                                                            : 'bg-green-600'
                                                    }`}
                                            />
                                        </div>
                                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                            Password Strength: {strengthLabel(passwordScore)}
                                        </div>
                                    </div>
                                )}

                                {generalError && (
                                    <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                        {generalError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                    data-testid="register-submit"
                                >
                                    {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Secure • Reliable • Easy to Use
                    </p>
                </div>
            </div>
        </div>
    );
}
