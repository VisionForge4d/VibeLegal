import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, FileText, Calendar, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const raw = localStorage.getItem('token');
      const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/user-contracts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setContracts(data.contracts);
      } else {
        setError(data.error || 'Failed to fetch contracts');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const stats = [
    {
      title: 'Total Contracts',
      value: contracts.length,
      icon: <FileText className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'This Month',
      value: user?.contracts_used_this_month || 0,
      icon: <Calendar className="h-6 w-6 text-green-600" />,
    },
    {
      title: 'Subscription',
      value: user?.subscription_tier === 'basic' ? 'Basic' : 'Premium',
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.email}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage your contracts and create new ones with AI assistance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Contracts</CardTitle>
                <CardDescription>
                  Your recently created contracts. Click one to view.
                </CardDescription>
              </div>
              <Link to="/create-contract">
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Contract
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No contracts yet</h3>
                <p className="text-gray-600">
                  Create your first contract to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <Link
                    to={`/contracts/${contract.id}`}
                    key={contract.id}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{contract.title}</h3>
                          <p className="text-sm text-gray-500">
                            Created {formatDate(contract.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {contract.contract_type}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
