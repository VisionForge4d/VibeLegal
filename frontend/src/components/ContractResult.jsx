import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  FileText, 
  Download, 
  Save, 
  Edit3, 
  Eye, 
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

const ContractResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contractContent, setContractContent] = useState('');
  const [contractTitle, setContractTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!location.state || !location.state.contract) {
      navigate('/create-contract');
      return;
    }

    const { contract, contractType, clientName, otherPartyName } = location.state;
    setContractContent(contract);
    setContractTitle(`${contractType} - ${clientName} & ${otherPartyName}`);
  }, [location.state, navigate]);

  const handleSave = async () => {
    if (!contractTitle.trim()) {
      setError('Please enter a title for the contract');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/save-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: contractTitle,
          contractType: location.state.contractType,
          content: contractContent
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || 'Failed to save contract');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    // Create a simple HTML document for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${contractTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .contract-content { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${contractTitle}</h1>
        <div class="contract-content">${contractContent}</div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contractTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!location.state) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="mr-3 h-8 w-8 text-blue-600" />
                Contract Generated Successfully
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Review, edit, and save your contract
              </p>
            </div>
            
            {saved && (
              <Alert className="w-auto bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Contract saved successfully!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contract Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contract Content</CardTitle>
                    <CardDescription>
                      {isEditing ? 'Edit your contract below' : 'Review your generated contract'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </>
                    ) : (
                      <>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={contractContent}
                    onChange={(e) => setContractContent(e.target.value)}
                    className="min-h-[600px] font-mono text-sm"
                    placeholder="Contract content..."
                  />
                ) : (
                  <div className="bg-white border rounded-lg p-6 min-h-[600px]">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {contractContent}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            {/* Contract Details */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Contract Title</Label>
                  <Input
                    id="title"
                    value={contractTitle}
                    onChange={(e) => setContractTitle(e.target.value)}
                    placeholder="Enter contract title"
                    className="mt-1"
                  />
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Type:</strong> {location.state.contractType}</p>
                  <p><strong>Client:</strong> {location.state.clientName}</p>
                  <p><strong>Other Party:</strong> {location.state.otherPartyName}</p>
                  <p><strong>Jurisdiction:</strong> {location.state.jurisdiction}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Save or download your contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Contract
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as HTML
                </Button>

                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/create-contract')}
                    className="w-full"
                  >
                    Create Another Contract
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Legal Disclaimer */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-yellow-800">Legal Disclaimer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700">
                  This document is generated by AI and should be reviewed by a qualified attorney before use. 
                  This does not constitute legal advice. Always consult with a legal professional for important contracts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractResult;

