import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus, Loader2, AlertTriangle } from 'lucide-react';
import api from '../api/api';

const ContractView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const data = await api.get(`/contracts/${id}`);
        setContract(data.contract);
      } catch (err) {
        // Auth errors are handled by the api utility, so this only catches other errors.
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id]);

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