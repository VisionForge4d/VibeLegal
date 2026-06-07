import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';

/**
 * UserImpersonation Component
 * Modal for generating impersonation tokens to view platform as user
 */
export function UserImpersonation({ user, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [impersonationData, setImpersonationData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateToken = async () => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${user.id}/impersonate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate impersonation token');
      }

      const data = await response.json();
      const normalizedData = {
        ...data,
        impersonation_token: data?.impersonation_token || data?.token || '',
        expires_in: typeof data?.expires_in === 'number'
          ? data.expires_in
          : (typeof data?.expiresIn === 'number' ? data.expiresIn : 3600)
      };
      setImpersonationData(normalizedData);
    } catch (err) {
      console.error('Failed to generate impersonation token:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = () => {
    if (!impersonationData?.impersonation_token) return;

    // Store the impersonation token in localStorage
    const currentToken = localStorage.getItem('token');
    localStorage.setItem('admin_token', currentToken); // Save admin token
    localStorage.setItem('token', impersonationData.impersonation_token);

    // Redirect to user dashboard
    window.location.href = '/dashboard';
  };

  const handleCopyToken = () => {
    if (!impersonationData?.impersonation_token) return;

    navigator.clipboard.writeText(impersonationData.impersonation_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setImpersonationData(null);
      setCopied(false);
      onClose();
    }
  };

  const formatExpiresIn = (seconds) => {
    const totalSeconds = typeof seconds === 'number' ? seconds : Number(seconds);
    if (Number.isNaN(totalSeconds)) {
      return 'Unknown';
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Impersonate User</DialogTitle>
          <DialogDescription>
            Generate a temporary token to view the platform as {user?.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important Security Notice</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>This action will be logged in the audit trail</li>
                  <li>You will have full access to this user's account</li>
                  <li>Token expires in 1 hour for security</li>
                  <li>Use only for debugging or customer support</li>
                  {user?.is_admin && (
                    <li className="text-red-600 font-medium">
                      ⚠️ Cannot impersonate another admin user
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* User Info */}
          {!impersonationData && (
            <div className="space-y-2 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium">{user?.name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subscription:</span>
                <span className="text-sm font-medium capitalize">{user?.subscription_tier}</span>
              </div>
            </div>
          )}

          {/* Generated Token Info */}
          {impersonationData && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Impersonation token generated</p>
                  <p className="mt-1">
                    Expires in: {formatExpiresIn(impersonationData.expires_in)}
                  </p>
                </div>
              </div>

              {/* Token Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Token</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={impersonationData.impersonation_token}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50"
                  />
                  <button
                    onClick={handleCopyToken}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                    title="Copy token"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600">Token copied to clipboard!</p>
                )}
              </div>

              {/* Impersonate Button */}
              <button
                onClick={handleImpersonate}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Start Impersonation Session
              </button>

              <p className="text-xs text-gray-500 text-center">
                Click to automatically log in as this user. Your admin session will be saved.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {impersonationData ? 'Close' : 'Cancel'}
          </button>
          {!impersonationData && (
            <button
              onClick={handleGenerateToken}
              disabled={loading || user?.is_admin}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Token'}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
