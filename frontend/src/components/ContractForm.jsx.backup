import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Loader2 } from 'lucide-react';
import config from '../config.js';
import { EnhancedContractBuilder } from './EnhancedContractBuilder';

const ContractForm = () => {
  const [formData, setFormData] = useState({
    contractType: '',
    requirements: '',
    clientName: '',
    otherPartyName: '',
    jurisdiction: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [isEnhancedMode, setIsEnhancedMode] = useState(false);
  const contractTypes = [
    { value: 'Employment Agreement', label: 'Employment Agreement' },
    { value: 'NDA', label: 'Non-Disclosure Agreement (NDA)' },
    { value: 'Service Contract', label: 'Service Contract' },
    { value: 'Independent Contractor', label: 'Independent Contractor Agreement' },
    { value: 'Purchase Agreement', label: 'Purchase Agreement' }
  ];

  const jurisdictions = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form
    if (!formData.contractType || !formData.requirements || !formData.clientName || 
        !formData.otherPartyName || !formData.jurisdiction) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/generate-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contractType: "employment_agreement",
          parameters: {
            clientName: formData.clientName,
            otherPartyName: formData.otherPartyName,
            "Employee Name": formData.otherPartyName,
            "Company Name": formData.clientName,
            "State": "California",
            "Job Title": "Employee",
            "Supervisor Title": "Manager",
            "Work Location": "Company offices and/or remote",
            "exempt/non-exempt": "exempt",
            "amount": "competitive salary",
            "hour/year": "year",
            "Arbitration Provider, e.g., JAMS": "JAMS",
            "Specify County, e.g., Los Angeles County": "Los Angeles County",
            title: formData.contractType,
            jurisdiction: formData.jurisdiction,
            requirements: formData.requirements
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to results page with contract data
        navigate('/contract-result', { 
          state: { 
            contract: data.contract,
            contractType: formData.contractType,
            clientName: formData.clientName,
            otherPartyName: formData.otherPartyName,
            jurisdiction: formData.jurisdiction,
            requirements: formData.requirements
          }
        });
      } else {
        setError(data.error || 'Failed to generate contract');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancedGenerate = async (userInput) => {
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.API_BASE_URL}/api/generate-contract-enhanced`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userInput }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/contract-result", {
          state: {
            contract: data.contract,
            metadata: data.metadata,
            contractType: "Enhanced Employment Agreement",
            version: "enhanced"
          }
        });
      } else {
        setError(data.error || "Failed to generate enhanced contract");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
          <p className="text-lg text-gray-600 mt-2">
            Describe your contract needs in natural language and let our AI generate a professional legal document
          </p>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <div className="text-sm text-blue-800 text-left space-y-1">
              <p>1. Select your contract type and jurisdiction</p>
              <p>2. Describe your specific needs in plain English</p>
              <p>3. Our AI will generate a customized contract based on your requirements</p>
              <p>4. Review, edit, and download your contract</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contract Details</CardTitle>
                <CardDescription>Fill out the form below to generate your contract</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className={isEnhancedMode ? "text-gray-500" : "font-medium"}>Basic</span>
                <button
                  onClick={() => setIsEnhancedMode(!isEnhancedMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnhancedMode ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnhancedMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className={isEnhancedMode ? "font-medium text-blue-600" : "text-gray-500"}>
                  Pro <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">ENHANCED</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEnhancedMode ? (
              <EnhancedContractBuilder 
                onGenerate={handleEnhancedGenerate}
                isLoading={loading}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contractType">Contract Type *</Label>
                    <Select 
                      value={formData.contractType} 
                      onValueChange={(value) => handleInputChange("contractType", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="jurisdiction">State/Jurisdiction *</Label>
                    <Select 
                      value={formData.jurisdiction} 
                      onValueChange={(value) => handleInputChange("jurisdiction", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {jurisdictions.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="clientName">Your Name/Company *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange("clientName", e.target.value)}
                      placeholder="Your name or company name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="otherPartyName">Other Party Name *</Label>
                    <Input
                      id="otherPartyName"
                      value={formData.otherPartyName}
                      onChange={(e) => handleInputChange("otherPartyName", e.target.value)}
                      placeholder="Name of the other party"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="requirements">Contract Requirements *</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange("requirements", e.target.value)}
                    placeholder="Describe your contract requirements in detail..."
                    className="mt-1 min-h-[120px]"
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Contract"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractForm;

