import config from '../config.js';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  FileText, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  Trash2,
  Search,
  Filter,
  Zap,
  Users,
  MessageSquare
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [contractStats, setContractStats] = useState({
    totalCount: 0,
    monthlyCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, title }
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [savedChats, setSavedChats] = useState([]);
  const [savedChatsLoading, setSavedChatsLoading] = useState(false);
  const [savedChatsError, setSavedChatsError] = useState('');
  const [activeTab, setActiveTab] = useState('contracts');

  useEffect(() => {
    fetchContracts();
    fetchSavedChats();
  }, []);

  const fetchContracts = async () => {
    console.log('Fetching contracts...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/user-contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setContracts(data.contracts);
        setContractStats({
          totalCount: data.totalCount || 0,
          monthlyCount: data.monthlyCount || 0
        });
      } else {
        // If token is expired, redirect to login
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        setError(data.error || 'Failed to fetch contracts');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedChats = async () => {
    try {
      setSavedChatsLoading(true);
      setSavedChatsError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/ai/chat/saved`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedChats(data.chats || []);
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        setSavedChatsError('Failed to load saved chats');
      }
    } catch (err) {
      setSavedChatsError('Network error. Please try again.');
    } finally {
      setSavedChatsLoading(false);
    }
  };

  const deleteContract = async (contractId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/contracts/${contractId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setContracts(contracts.filter(contract => contract.id !== contractId));
        setContractStats(prev => ({
          totalCount: Math.max(0, prev.totalCount - 1),
          monthlyCount: Math.max(0, prev.monthlyCount - 1) // Assumes deleted contract was from this month
        }));
        setDeleteConfirm(null);
      } else {
        setError(data.error || 'Failed to delete contract');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
      'Employment Agreement': 'bg-gray-100 text-gray-800', // Basic → Grey
      'CA Employment Agreement': 'bg-gray-100 text-gray-800', // Basic → Grey
      'Enhanced Employment Agreement': 'bg-blue-100 text-blue-800', // Enhanced → Blue
      'Conversational AI Employment Agreement': 'bg-purple-100 text-purple-800' // AI Chat → Purple
    };

    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Filter and search contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contract_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contract.contract_type === filterType;
    return matchesSearch && matchesType;
  });

  const contractTypes = ['all', ...new Set(contracts.map(c => c.contract_type))];


  const stats = [
    {
      title: 'Total Contracts',
      value: contractStats.totalCount,
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      description: 'Contracts created'
    },
    {
      title: 'This Month',
      value: contractStats.monthlyCount,
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      description: 'Contracts generated'
    },
    {
      title: 'Subscription',
      value: user?.subscription_tier === 'basic' ? 'Basic' : user?.subscription_tier === 'pro' ? 'Pro' : 'Basic',
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      description: 'Current plan'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Beta Banner */}
        <div className="mb-6 beta-banner">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <span className="text-blue-600 font-bold text-sm">β</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">
                      Welcome to VibeLegal Beta!
                    </h3>
                    <p className="text-sm text-blue-700">
                      You're part of our exclusive beta program. Help us improve by sharing your feedback!
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    // This will be implemented with proper state management later
                    document.querySelector('.beta-banner').style.display = 'none';
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.email}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Create California employment agreements through natural conversation with AI
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
          <div className="grid md:grid-cols-3 gap-6">
            {/* Primary Action */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Start New Contract</CardTitle>
                <CardDescription>
                  Generate California-compliant employment contracts in minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link to="/create-contract" className="block">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Standard Employment</h3>
                            <p className="text-sm text-gray-600">Full-time, at-will employment</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/create-contract" className="block">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Zap className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">AI Conversational</h3>
                            <p className="text-sm text-gray-600">Chat-based contract creation</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/create-contract" className="block">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Executive Level</h3>
                            <p className="text-sm text-gray-600">Enhanced terms & severance</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link to="/create-contract" className="block">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Part-Time / Remote</h3>
                            <p className="text-sm text-gray-600">Flexible arrangements</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Upgrade Action - Only show for Basic users */}
            {user?.subscription_tier === 'basic' ? (
              <Card>
                <CardHeader>
                  <CardTitle>Upgrade to Pro</CardTitle>
                  <CardDescription>
                    Join our exclusive beta program with unlimited contracts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-900">Pro Benefits</h4>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Unlimited contracts</li>
                        <li>• Advanced AI features</li>
                        <li>• Premium templates</li>
                        <li>• Priority support</li>
                      </ul>
                    </div>
                    <Link to="/pricing">
                      <Button variant="outline" size="lg" className="w-full">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        View Pricing
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Pro Member</CardTitle>
                  <CardDescription>
                    You're part of our exclusive beta program
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-medium text-green-900">Your Pro Benefits</h4>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>✓ Unlimited contracts</li>
                        <li>✓ Advanced AI features</li>
                        <li>✓ Premium templates</li>
                        <li>✓ Priority support</li>
                        <li>✓ Beta pricing locked</li>
                      </ul>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600">Thank you for being a founding member!</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Usage Limit Warning */}
        {user?.subscription_tier === 'basic' && contractStats.monthlyCount >= 20 && (
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
                      You've used {contractStats.monthlyCount} of 5 contracts this month. 
                      Consider upgrading to Pro for unlimited contracts and advanced features.
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contracts" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Contracts ({contracts.length})
                </TabsTrigger>
                <TabsTrigger value="chats" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Saved Chats ({savedChats.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contracts" className="space-y-4">
                {contracts.length > 0 && (
                  <div className="flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search contracts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-48">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type === 'all' ? 'All Types' : type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
                ) : filteredContracts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2" />
                    <p>No contracts match your search criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Link
                          to={`/contracts/${contract.id}`}
                          className="flex items-center space-x-4 flex-1 hover:text-blue-600 transition-colors"
                        >
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
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
                        </Link>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setDeleteConfirm({ id: contract.id, title: contract.title })}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete contract"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-gray-500">Saved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="chats" className="space-y-4">
                {savedChatsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : savedChatsError ? (
                  <div className="text-center py-8 text-red-600">{savedChatsError}</div>
                ) : savedChats.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-500 space-y-2">
                      <MessageSquare className="w-12 h-12 mx-auto text-gray-400" />
                      <p>No saved chats yet</p>
                      <p className="text-sm text-gray-400">
                        Use the "Save Chat" button in AI Chat to save conversations
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  savedChats.map((chat) => {
                    let messageCount = 0;
                    try {
                      const state = chat.conversation_state ? JSON.parse(chat.conversation_state) : {};
                      messageCount = Array.isArray(state.messages) ? state.messages.length : 0;
                    } catch (err) {
                      console.error('Failed to parse conversation state', err);
                    }

                    return (
                      <Card key={chat.id} className="hover:border-purple-300 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium">{chat.name || 'Untitled Chat'}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>{new Date(chat.created_at).toLocaleDateString()}</span>
                              <span>{messageCount} messages</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => navigate(`/create-contract?resumeChat=${chat.id}`)}
                            variant="outline"
                            size="sm"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>


        {/* Quick Start Shortcuts */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
            <CardDescription>Create a contract with one of our recommended flows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Link to="/create-contract" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Standard Employment</h3>
                        <p className="text-sm text-gray-600">Full-time, at-will employment</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/create-contract" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">AI Conversational</h3>
                        <p className="text-sm text-gray-600">Chat-based contract creation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/create-contract" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Executive Level</h3>
                        <p className="text-sm text-gray-600">Enhanced terms & severance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/create-contract" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Part-Time / Remote</h3>
                        <p className="text-sm text-gray-600">Flexible arrangements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>



        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete Contract
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteContract(deleteConfirm.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}      </div>
    </div>
  );
};


export default Dashboard;
