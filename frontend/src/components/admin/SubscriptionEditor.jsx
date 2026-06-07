import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * SubscriptionEditor Component
 * Modal for changing a user's subscription tier with audit logging
 */
export function SubscriptionEditor({ user, isOpen, onClose, onUpdate }) {
  const [newTier, setNewTier] = useState(user?.subscription_tier || 'basic');
  const [reason, setReason] = useState('');
  const [stripeSync, setStripeSync] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;
    if (newTier === user.subscription_tier) {
      setError('New tier must be different from current tier');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${user.id}/subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier: newTier,
          reason: reason.trim() || undefined,
          stripe_sync: stripeSync
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update subscription');
      }

      const data = await response.json();
      setSuccess(true);

      // Call the onUpdate callback to refresh user data
      if (onUpdate) {
        await onUpdate();
      }

      // Close modal after short delay to show success message
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to update subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      setReason('');
      setNewTier(user?.subscription_tier || 'basic');
      onClose();
    }
  };

  const getTierBadgeVariant = (tier) => {
    switch (tier) {
      case 'enterprise':
        return 'default';
      case 'pro':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTierDescription = (tier) => {
    switch (tier) {
      case 'basic':
        return 'Free tier - 2 contracts/month';
      case 'pro':
        return 'Pro tier - 10 contracts/month, $29/month';
      case 'enterprise':
        return 'Enterprise tier - Unlimited contracts, $99/month';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Change subscription tier for {user?.email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Tier */}
          <div className="space-y-2">
            <Label>Current Tier</Label>
            <div className="flex items-center gap-2">
              <Badge variant={getTierBadgeVariant(user?.subscription_tier)}>
                {user?.subscription_tier}
              </Badge>
              <span className="text-sm text-gray-600">
                {getTierDescription(user?.subscription_tier)}
              </span>
            </div>
          </div>

          {/* New Tier Selection */}
          <div className="space-y-2">
            <Label htmlFor="tier">New Tier</Label>
            <Select value={newTier} onValueChange={setNewTier}>
              <SelectTrigger id="tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Basic</span>
                    <span className="text-xs text-gray-500">2 contracts/month</span>
                  </div>
                </SelectItem>
                <SelectItem value="pro">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Pro</span>
                    <span className="text-xs text-gray-500">10 contracts/month, $29/month</span>
                  </div>
                </SelectItem>
                <SelectItem value="enterprise">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Enterprise</span>
                    <span className="text-xs text-gray-500">Unlimited, $99/month</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              {getTierDescription(newTier)}
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Internal note explaining this change (e.g., 'Customer service gesture - billing issue')"
              rows={3}
            />
          </div>

          {/* Stripe Sync */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="stripeSync"
              checked={stripeSync}
              onChange={(e) => setStripeSync(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="stripeSync" className="cursor-pointer">
              Sync with Stripe (update Stripe subscription)
            </Label>
          </div>

          {/* Warning Message */}
          {newTier !== user?.subscription_tier && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Manual subscription change</p>
                <p className="mt-1">
                  This action will be logged in the audit trail.
                  {stripeSync && ' Stripe subscription will be updated.'}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-green-800">Subscription updated successfully!</p>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || newTier === user?.subscription_tier}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Subscription'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
