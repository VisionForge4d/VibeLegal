import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    fetchContracts();
  }, []);

  const handleContractClick = (contractId) => {
    navigate(`/contracts/${contractId}`);
  };
  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user-contracts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getContractTypeColor = (type) => {
    const colors = {
      'Employment Agreement': 'bg-blue-100 text-blue-800',
      'NDA': 'bg-green-100 text-green-800',
      'Service Contract': 'bg-purple-100 text-purple-800',
      'Independent Contractor': 'bg-orange-100 text-orange-800',
      'Purchase Agreement': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const stats = [
    {
      title: 'Total Contracts',
      value: contracts.length,
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      description: 'Contracts created'
    },
    {
      title: 'This Month',
      value: user?.contracts_used_this_month || 0,
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      description: 'Contracts generated'
    },
    {
      title: 'Subscription',
      value: user?.subscription_tier === 'basic' ? 'Basic' : 'Premium',
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      description: 'Current plan'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.email}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage your contracts and create new ones with AI assistance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with creating your next contract
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/create-contract">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Contract
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Limit Warning */}
        {user?.subscription_tier === 'basic' && user?.contracts_used_this_month >= 20 && (
          <div className="mb-8">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">
                      Approaching Monthly Limit
                    </h3>
                    <p className="text-yellow-700">
                      You've used {user.contracts_used_this_month} of 25 contracts this month. 
                      Consider upgrading to Premium for unlimited contracts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Contracts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Contracts</CardTitle>
                <CardDescription>
                  Your recently created contracts
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
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No contracts yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first contract to get started
                </p>
                <Link to="/create-contract">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Contract
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    onClick={() => handleContractClick(contract.id)}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {contract.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={getContractTypeColor(contract.contract_type)}
                          >
                            {contract.contract_type}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Created {formatDate(contract.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-500">Saved</span>
                    </div>
                  </div>
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

