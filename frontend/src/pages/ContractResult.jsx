import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

const ContractResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contractContent, setContractContent] = useState('');

  useEffect(() => {
    // This effect runs when the page loads.
    // It checks if contract data was passed from the previous page.
    if (location.state && location.state.contract) {
      setContractContent(location.state.contract);
    } else {
      // If no contract data is found, redirect back to the dashboard.
      // This prevents users from visiting this page directly.
      navigate('/dashboard');
    }
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/create-contract')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Create Another Contract
          </Button>
          
          <div className="flex items-center">
            <FileText className="mr-3 h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Contract Generated Successfully
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Review your generated document below. It has been saved to your dashboard.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generated Contract</CardTitle>
            <CardDescription>
              Please review the full text of the generated document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-6 min-h-[600px] overflow-auto">
              {/* The 'pre' tag preserves whitespace and formatting like line breaks */}
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {contractContent}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractResult;