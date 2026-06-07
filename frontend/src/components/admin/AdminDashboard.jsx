import React, { useState, useEffect } from 'react';
import { AdminMetricsCard } from './AdminMetricsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  UserPlus,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * AdminDashboard Component
 * Main admin overview page displaying system metrics and recent activity
 */
export function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [auditLog, setAuditLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);

      // Fetch metrics, recent activity, and audit log in parallel
      const [metricsRes, activityRes, auditRes] = await Promise.all([
        fetch('/api/admin/metrics/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/metrics/recent-activity?limit=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/audit-log?limit=15', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!metricsRes.ok || !activityRes.ok || !auditRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const metricsData = await metricsRes.json();
      const activityData = await activityRes.json();
      const auditData = await auditRes.json();

      setMetrics(metricsData.metrics);
      setRecentActivity(activityData);
      setAuditLog(auditData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const subscriptionPieData = metrics?.subscriptionBreakdown ?
    Object.entries(metrics.subscriptionBreakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    })) : [];

  const COLORS = {
    'Basic': '#9ca3af',
    'Pro': '#3b82f6',
    'Enterprise': '#8b5cf6'
  };

  // Mock trend data (in production, this would come from the backend)
  const trendData = [
    { month: 'Jul', users: metrics?.totalUsers ? Math.floor(metrics.totalUsers * 0.75) : 0, contracts: metrics?.totalContracts ? Math.floor(metrics.totalContracts * 0.7) : 0, revenue: metrics?.mrr ? Math.floor(metrics.mrr * 0.6) : 0 },
    { month: 'Aug', users: metrics?.totalUsers ? Math.floor(metrics.totalUsers * 0.85) : 0, contracts: metrics?.totalContracts ? Math.floor(metrics.totalContracts * 0.82) : 0, revenue: metrics?.mrr ? Math.floor(metrics.mrr * 0.75) : 0 },
    { month: 'Sep', users: metrics?.totalUsers ? Math.floor(metrics.totalUsers * 0.93) : 0, contracts: metrics?.totalContracts ? Math.floor(metrics.totalContracts * 0.91) : 0, revenue: metrics?.mrr ? Math.floor(metrics.mrr * 0.88) : 0 },
    { month: 'Oct', users: metrics?.totalUsers || 0, contracts: metrics?.totalContracts || 0, revenue: metrics?.mrr || 0 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load dashboard: {error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          System overview and recent activity
        </p>
      </div>

      {/* Revenue Overview - Prominent Display */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <DollarSign className="mr-2 h-6 w-6 text-blue-600" />
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* MRR */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Recurring Revenue</p>
              <p className="text-4xl font-bold text-blue-600">
                ${(metrics?.mrr || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on current subscription tiers
              </p>
            </div>

            {/* Revenue Breakdown */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Revenue by Tier</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pro ($29/mo):</span>
                  <span className="font-semibold">
                    ${metrics?.revenueByTier?.pro || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Enterprise ($99/mo):</span>
                  <span className="font-semibold">
                    ${metrics?.revenueByTier?.enterprise || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Basic (Free):</span>
                  <span className="font-semibold">
                    ${metrics?.revenueByTier?.basic || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Failed Payments Alert */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Payment Health</p>
              {metrics?.failedPayments > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        {metrics.failedPayments} Failed Payment{metrics.failedPayments !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Review payment issues
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-800">
                    ✓ All payments processing successfully
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    No failed payments this month
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminMetricsCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          description={
            <span className="flex items-center">
              {metrics?.newUsersThisMonth || 0} new this month
              {metrics?.userGrowthRate !== undefined && metrics.userGrowthRate !== 0 && (
                <Badge
                  variant={metrics.userGrowthRate > 0 ? 'default' : 'destructive'}
                  className="ml-2 text-xs"
                >
                  {metrics.userGrowthRate > 0 ? (
                    <ArrowUp className="h-3 w-3 inline mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 inline mr-1" />
                  )}
                  {Math.abs(metrics.userGrowthRate)}%
                </Badge>
              )}
            </span>
          }
          icon={Users}
        />
        <AdminMetricsCard
          title="Total Contracts"
          value={metrics?.totalContracts || 0}
          description={
            <span className="flex items-center">
              {metrics?.contractsThisMonth || 0} created this month
              {metrics?.contractGrowthRate !== undefined && metrics.contractGrowthRate !== 0 && (
                <Badge
                  variant={metrics.contractGrowthRate > 0 ? 'default' : 'destructive'}
                  className="ml-2 text-xs"
                >
                  {metrics.contractGrowthRate > 0 ? (
                    <ArrowUp className="h-3 w-3 inline mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 inline mr-1" />
                  )}
                  {Math.abs(metrics.contractGrowthRate)}%
                </Badge>
              )}
            </span>
          }
          icon={FileText}
        />
        <AdminMetricsCard
          title="Active Users"
          value={metrics?.activeSubscriptions || 0}
          description="Users with contracts this month"
          icon={TrendingUp}
        />
        <AdminMetricsCard
          title="Paid Subscriptions"
          value={
            (metrics?.subscriptionBreakdown?.pro || 0) +
            (metrics?.subscriptionBreakdown?.enterprise || 0)
          }
          description={`${metrics?.subscriptionBreakdown?.pro || 0} Pro, ${
            metrics?.subscriptionBreakdown?.enterprise || 0
          } Enterprise`}
          icon={DollarSign}
        />
      </div>

      {/* Data Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <p className="text-sm text-gray-600">Users, Contracts & Revenue over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Users" strokeWidth={2} />
                <Line type="monotone" dataKey="contracts" stroke="#10b981" name="Contracts" strokeWidth={2} />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" name="Revenue ($)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <p className="text-sm text-gray-600">User breakdown by tier</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-4">
              {subscriptionPieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[entry.name] }} />
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Subscription Tier</CardTitle>
          <p className="text-sm text-gray-600">Monthly recurring revenue breakdown</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { tier: 'Basic', revenue: metrics?.revenueByTier?.basic || 0, users: metrics?.subscriptionBreakdown?.basic || 0 },
              { tier: 'Pro', revenue: metrics?.revenueByTier?.pro || 0, users: metrics?.subscriptionBreakdown?.pro || 0 },
              { tier: 'Enterprise', revenue: metrics?.revenueByTier?.enterprise || 0, users: metrics?.subscriptionBreakdown?.enterprise || 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tier" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
              <Bar yAxisId="right" dataKey="users" fill="#10b981" name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity?.recentContracts?.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.recentContracts.slice(0, 5).map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        New {contract.contract_type} contract
                      </p>
                      <p className="text-xs text-gray-500">
                        Created by {contract.user_email}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-600 font-medium">
                        {new Date(contract.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(contract.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent contracts</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity?.recentSignups?.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.recentSignups.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        user.subscription_tier === 'enterprise'
                          ? 'default'
                          : user.subscription_tier === 'pro'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="ml-4"
                    >
                      {user.subscription_tier}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent signups</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Activity Log / Audit Trail */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Admin Activity Log
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Recent admin actions and system events
              </p>
            </div>
            <Badge variant={autoRefresh ? 'default' : 'outline'} className="flex items-center gap-1">
              {autoRefresh && <RefreshCw className="h-3 w-3 animate-spin" />}
              {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {auditLog?.actions?.length > 0 ? (
            <div className="space-y-2">
              {auditLog.actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        action.action_type === 'subscription_change' ? 'default' :
                        action.action_type === 'user_impersonation' ? 'destructive' :
                        'secondary'
                      }>
                        {action.action_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        by {action.admin_email}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {action.description}
                    </p>
                    {action.target_email && (
                      <p className="text-xs text-gray-500 mt-1">
                        Target: {action.target_email}
                      </p>
                    )}
                    {action.metadata && (
                      <div className="text-xs text-gray-400 mt-1 font-mono">
                        {action.metadata.reason && `Reason: ${action.metadata.reason}`}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-600">
                      {new Date(action.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(action.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No admin activity recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
            autoRefresh
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          {autoRefresh ? 'Disable Auto-refresh' : 'Enable Auto-refresh'}
        </button>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Activity className="mr-2 h-4 w-4" />
          Refresh Data
        </button>
      </div>
    </div>
  );
}
