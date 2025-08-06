import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
// --- CHANGE START ---
import { ArrowLeft, FileText, Download } from 'lucide-react';
// --- CHANGE END ---

const ContractResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contractContent, setContractContent] = useState('');
  // --- CHANGE START ---
  // We need to store the full contract object to get the title for the filename
  const [contract, setContract] = useState(null);
  // --- CHANGE END ---

  useEffect(() => {
    if (location.state && location.state.contract) {
      setContractContent(location.state.contract.content); // Store just the content for display
      setContract(location.state.contract); // Store the full object
    } else {
      navigate('/dashboard');
    }
  }, [location.state, navigate]);

  // --- CHANGE START ---
  const handleDownload = () => {
    if (!contract) return;

    const filename = `${contract.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${contract.title}</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
          pre { white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <pre>${contract.content}</pre>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  // --- CHANGE END ---

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
          
          <div className="flex items-center justify-between">
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
            {/* --- CHANGE START --- */}
            <Button onClick={handleDownload} disabled={!contract}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            {/* --- CHANGE END --- */}
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