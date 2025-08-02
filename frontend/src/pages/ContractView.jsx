import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus, Loader2, AlertTriangle } from 'lucide-react';

const ContractView = () => {
  const { id } = useParams(); // This hook reads the contract ID from the URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/contracts/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 404) {
          setError('Contract not found or you do not have permission to view it.');
        } else if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'An unexpected error occurred.');
        } else {
          const data = await response.json();
          setContract(data.contract);
        }
      } catch (err) {
        console.error('Fetch contract error:', err);
        setError('A network error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]); // This effect runs whenever the contract ID in the URL changes

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Error
            </CardTitle>
            <CardDescription className="text-red-500">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Link to="/create-contract">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Contract
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{contract?.title}</CardTitle>
            <CardDescription>
              Contract Type: {contract?.contract_type} | Created on: {new Date(contract?.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-6 min-h-[600px] overflow-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {contract?.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractView;