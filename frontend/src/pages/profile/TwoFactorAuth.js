import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ShieldCheckIcon, QrCodeIcon, KeyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TwoFactorAuth = () => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [setupMode, setSetupMode] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [disablePassword, setDisablePassword] = useState('');
    const [disableCode, setDisableCode] = useState('');
    const [showDisableForm, setShowDisableForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSetupTOTP = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/totp/setup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setQrCode(data.qrCode);
                setSecret(data.secret);
                setSetupMode(true);
                setSuccess(data.message);
            } else {
                setError(data.message || 'Failed to setup TOTP');
            }
        } catch (err) {
            setError('Failed to setup TOTP');
        }

        setLoading(false);
    };

    const handleVerifySetup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/totp/verify-setup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: verifyCode })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Two-factor authentication has been enabled')
                setSuccess('Two-factor authentication has been enabled successfully!');
                setSetupMode(false);
                setQrCode('');
                setSecret('');
                setVerifyCode('');
                // Refresh user data
                if (refreshUser) {
                    await refreshUser();
                } else {
                    // Fallback: reload the page
                    setTimeout(() => window.location.reload(), 2000);
                }
            } else {
                setError(data.message || 'Invalid verification code');
            }
        } catch (err) {
            setError('Failed to verify TOTP code');
        }

        setLoading(false);
    };

    const handleDisableTOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/totp/disable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: disablePassword,
                    token: disableCode
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Two-factor authentication has been disabled')
                setSuccess('Two-factor authentication has been disabled');
                setShowDisableForm(false);
                setDisablePassword('');
                setDisableCode('');
                // Refresh user data
                if (refreshUser) {
                    await refreshUser();
                } else {
                    // Fallback: reload the page
                    setTimeout(() => window.location.reload(), 2000);
                }
            } else {
                setError(data.message || 'Failed to disable TOTP');
            }
        } catch (err) {
            setError('Failed to disable TOTP');
        }

        setLoading(false);
    };

    const cancelSetup = () => {
        setSetupMode(false);
        setQrCode('');
        setSecret('');
        setVerifyCode('');
        setError('');
        setSuccess('');
    };

    const cancelDisable = () => {
        setShowDisableForm(false);
        setDisablePassword('');
        setDisableCode('');
        setError('');
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex items-center mb-6">
                    <ShieldCheckIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Two-Factor Authentication
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Add an extra layer of security to your account
                        </p>
                    </div>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {/* Current Status */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Status:</p>
                            <p className={`text-sm ${user?.totpEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                {user?.totpEnabled ? 'Enabled ✓' : 'Disabled'}
                            </p>
                        </div>
                        {user?.totpEnabled && (
                            <ShieldCheckIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                        )}
                    </div>
                </div>

                {/* Setup Mode */}
                {setupMode ? (
                    <div className="space-y-6">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <QrCodeIcon className="h-6 w-6 mr-2" />
                                Step 1: Scan QR Code
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                            </p>
                            {qrCode && (
                                <div className="flex justify-center mb-4">
                                    <img src={qrCode} alt="TOTP QR Code" className="border border-gray-300 dark:border-gray-600 rounded-lg" />
                                </div>
                            )}

                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    Or enter this code manually:
                                </p>
                                <code className="text-sm font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 block text-center">
                                    {secret}
                                </code>
                            </div>
                        </div>

                        <form onSubmit={handleVerifySetup} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <KeyIcon className="h-6 w-6 mr-2" />
                                Step 2: Verify Code
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Enter the 6-digit code from your authenticator app to complete setup
                            </p>

                            <div className="mb-4">
                                <input
                                    type="text"
                                    maxLength="6"
                                    pattern="[0-9]{6}"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="000000"
                                    required
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={loading || verifyCode.length !== 6}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    {loading ? <LoadingSpinner size="sm" /> : 'Enable 2FA'}
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelSetup}
                                    disabled={loading}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : showDisableForm ? (
                    /* Disable Form */
                    <form onSubmit={handleDisableTOTP} className="space-y-6">
                        <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Disable Two-Factor Authentication
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                To disable 2FA, please verify your identity with your password and current authentication code.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="disable-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Password
                                    </label>
                                    <input
                                        id="disable-password"
                                        type="password"
                                        value={disablePassword}
                                        onChange={(e) => setDisablePassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="disable-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Authentication Code
                                    </label>
                                    <input
                                        id="disable-code"
                                        type="text"
                                        maxLength="6"
                                        pattern="[0-9]{6}"
                                        value={disableCode}
                                        onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="000000"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={loading || disableCode.length !== 6}
                                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    {loading ? <LoadingSpinner size="sm" /> : 'Disable 2FA'}
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelDisable}
                                    disabled={loading}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    /* Main Actions */
                    <div className="space-y-4">
                        {!user?.totpEnabled ? (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Enable Two-Factor Authentication
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Protect your account with an additional security layer. You'll need an authenticator app on your phone.
                                </p>
                                <button
                                    onClick={handleSetupTOTP}
                                    disabled={loading}
                                    className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                >
                                    {loading ? <LoadingSpinner size="sm" /> : 'Setup 2FA'}
                                </button>
                            </div>
                        ) : (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Two-Factor Authentication is Active
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Your account is protected with two-factor authentication. You'll be asked for a code from your authenticator app when you sign in.
                                </p>
                                <button
                                    onClick={() => setShowDisableForm(true)}
                                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                                >
                                    Disable 2FA
                                </button>
                            </div>
                        )}

                        {/* Info Section */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                What is Two-Factor Authentication?
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-400">
                                Two-factor authentication (2FA) adds an extra layer of security to your account.
                                Even if someone knows your password, they won't be able to access your account without
                                the verification code from your authenticator app.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TwoFactorAuth;
