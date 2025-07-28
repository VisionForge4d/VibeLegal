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
      const response = await fetch('http://localhost:5000/api/generate-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to results page with contract data
        navigate('/contract-result', { 
          state: { 
            contract: data.contract,
            contractType: data.contractType,
            clientName: data.clientName,
            otherPartyName: data.otherPartyName,
            jurisdiction: data.jurisdiction
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
          <p className="text-lg text-gray-600 mt-2">
            Describe your contract needs and let AI generate a professional legal document
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
            <CardDescription>
              Fill out the form below to generate your custom contract
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    onValueChange={(value) => handleInputChange('contractType', value)}
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
                    onValueChange={(value) => handleInputChange('jurisdiction', value)}
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
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="Enter client name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="otherPartyName">Other Party Name *</Label>
                  <Input
                    id="otherPartyName"
                    type="text"
                    value={formData.otherPartyName}
                    onChange={(e) => handleInputChange('otherPartyName', e.target.value)}
                    placeholder="Enter other party name"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Contract Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Describe your contract needs in plain English... For example: 'I need an employment contract for a software developer position with a 90-day probation period, $80,000 annual salary, standard benefits, and a 2-week notice period for termination.'"
                  className="mt-1 min-h-[120px]"
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be as specific as possible. Include details about terms, conditions, compensation, duration, and any special requirements.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
                <p className="text-sm text-blue-800">
                  All generated contracts include a legal disclaimer and should be reviewed by a qualified attorney before use. 
                  This service does not constitute legal advice.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Contract'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractForm;

