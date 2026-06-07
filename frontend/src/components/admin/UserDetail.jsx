import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  ArrowLeft,
  User,
  CreditCard,
  FileText,
  Activity,
  Edit,
  UserCog,
  Calendar,
  Mail,
  Shield
} from 'lucide-react';
import { SubscriptionEditor } from './SubscriptionEditor';
import { UserImpersonation } from './UserImpersonation';

/**
 * UserDetail Component
 * Detailed view of a specific user with full profile, subscription, contracts, and history
 */
export function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubscriptionEditor, setShowSubscriptionEditor] = useState(false);
  const [showImpersonation, setShowImpersonation] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
      case 'succeeded':
        return 'default';
      case 'canceled':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load user: {error}</p>
          <button
            onClick={fetchUserData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { user, subscription, contracts, payment_history, recent_admin_actions } = userData;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              User Profile
            </CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSubscriptionEditor(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Subscription
              </button>
              <button
                onClick={() => setShowImpersonation(true)}
                disabled={user.is_admin}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCog className="mr-2 h-4 w-4" />
                Impersonate
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </div>
              <p className="font-medium">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{user.name || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Subscription Tier</p>
              <Badge variant={getTierBadgeVariant(user.subscription_tier)}>
                {user.subscription_tier}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 mr-2" />
                Admin Status
              </div>
              <Badge variant={user.is_admin ? 'default' : 'outline'}>
                {user.is_admin ? 'Admin' : 'User'}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Contracts This Month</p>
              <p className="font-medium">{user.contracts_used_this_month || 0}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Joined
              </div>
              <p className="font-medium">{formatDate(user.created_at)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">User ID</p>
              <p className="text-xs font-mono text-gray-500">{user.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Stripe Customer ID</p>
              <p className="text-xs font-mono text-gray-500">
                {user.stripe_customer_id || 'None'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium">{formatDate(user.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Details Card */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={getStatusBadgeVariant(subscription.status)}>
                  {subscription.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Plan Type</p>
                <Badge variant={getTierBadgeVariant(subscription.plan_type)}>
                  {subscription.plan_type}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Billing Cycle</p>
                <p className="font-medium capitalize">{subscription.billing_cycle}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Current Period</p>
                <p className="text-sm">
                  {new Date(subscription.current_period_start).toLocaleDateString()} -{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Stripe Subscription ID</p>
                <p className="text-xs font-mono text-gray-500">
                  {subscription.stripe_subscription_id || 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Contracts, Payments, and Activity */}
      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contracts">
            <FileText className="h-4 w-4 mr-2" />
            Contracts ({contracts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment History ({payment_history?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Admin Actions ({recent_admin_actions?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Contracts Tab */}
        <TabsContent value="contracts">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No contracts found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts?.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.title || 'Untitled Contract'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{contract.contract_type}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(contract.created_at)}</TableCell>
                      <TableCell>{formatDate(contract.updated_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payment_history?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No payment history</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  payment_history?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.billing_cycle}
                      </TableCell>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Admin Actions Tab */}
        <TabsContent value="activity">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent_admin_actions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No admin actions recorded</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  recent_admin_actions?.map((action, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">{action.action_type}</Badge>
                      </TableCell>
                      <TableCell>{action.description}</TableCell>
                      <TableCell className="text-sm">{action.admin_email}</TableCell>
                      <TableCell>{formatDate(action.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <SubscriptionEditor
        user={user}
        isOpen={showSubscriptionEditor}
        onClose={() => setShowSubscriptionEditor(false)}
        onUpdate={fetchUserData}
      />

      <UserImpersonation
        user={user}
        isOpen={showImpersonation}
        onClose={() => setShowImpersonation(false)}
      />
    </div>
  );
}
