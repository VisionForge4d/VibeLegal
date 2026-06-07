import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { ConversationalContractBuilder } from './ConversationalContractBuilder';
import { ProLimitModal } from './ProLimitModal';

const ContractForm = () => {
  const [formData, setFormData] = useState({
    contractType: 'Employment Agreement',
    requirements: '',
    clientName: '',
    otherPartyName: '',
    jurisdiction: 'California'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProModal, setShowProModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const resumeChatSessionId = searchParams.get('resumeChat');

  const [isEnhancedMode, setIsEnhancedMode] = useState(true);
  const [useConversationalAI, setUseConversationalAI] = useState(false);

  // Handle resuming conversation from contract result page
  useEffect(() => {
    if (location.state?.useConversationalAI) {
      setIsEnhancedMode(true);
      setUseConversationalAI(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (resumeChatSessionId) {
      setIsEnhancedMode(true);
      setUseConversationalAI(true);
    }
  }, [resumeChatSessionId]);

  // Reset conversational AI toggle when switching out of enhanced mode
  useEffect(() => {
    if (!isEnhancedMode) {
      setUseConversationalAI(false);
    }
  }, [isEnhancedMode]);
  // MVP: Limited to California Employment Contracts only
  const contractTypes = [
    { value: 'Employment Agreement', label: 'Employment Agreement' }
  ];
  const jurisdictions = [
    'California'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const contractTemplates = [
    {
      name: "Standard Full-Time Employee",
      description: "Comprehensive employment agreement for full-time positions",
      requirements: "Full-time software developer position, $85,000 annual salary, standard benefits including health insurance and 401k matching, 15 days PTO, standard confidentiality and IP assignment clauses, at-will employment, remote work allowed 2 days per week."
    },
    {
      name: "Senior Executive",
      description: "Executive-level employment with enhanced terms",
      requirements: "Senior executive position, $150,000+ annual salary, executive benefits package, equity compensation, 4 weeks PTO, enhanced confidentiality provisions, 90-day notice period, severance provisions."
    },
    {
      name: "Remote Worker",
      description: "Employment agreement optimized for remote work",
      requirements: "Remote software developer position, $80,000 annual salary, home office expense reimbursement, internet and phone allowances, standard benefits, flexible working hours, results-focused performance metrics."
    },
    {
      name: "Part-Time Employee",
      description: "Part-time employment with prorated benefits",
      requirements: "Part-time position (20 hours/week), $35/hour rate, prorated benefits eligibility, flexible scheduling, standard confidentiality clauses, at-will employment."
    },
    {
      name: "Contract-to-Hire",
      description: "Initial contract period with potential for full-time conversion",
      requirements: "6-month contract position with conversion opportunity, $75,000 annual equivalent, limited benefits during contract period, full benefits upon conversion, performance milestones for conversion evaluation."
    }
  ];

  const applyTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      requirements: template.requirements
    }));
    // Switch to Basic mode so user can see the populated requirements
    setIsEnhancedMode(false);
    setUseConversationalAI(false);
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
            "State": formData.jurisdiction,
            "Job Title": "Employee",
            "Supervisor Title": "Manager",
            "Supervisor Name": "Manager",
            "Work Location": "Company offices and/or remote",
            "exempt/non-exempt": "exempt",
            "Annual Salary": "$85,000",
            "amount": "$85,000",
            "hour/year": "year",
            "Salary Amount": "$85,000",
            "Pay Period": "year",
            "Company Type": "corporation",
            "State of Incorporation": formData.jurisdiction,
            "Company Address": "123 Business Street, City, " + formData.jurisdiction + " 12345",
            "Employee Address": "456 Residential Avenue, City, " + formData.jurisdiction + " 67890",
            "Company Registration": "C123456789",
            "Employee SSN": "[To be provided by employee]",
            "Date": new Date().toLocaleDateString(),
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
        // If token is expired, redirect to login
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
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
        // Determine contract type based on generation method
        const contractType = userInput.generationMethod === "conversational_ai" 
          ? "Conversational AI Employment Agreement"
          : "Enhanced Employment Agreement";
        
        const version = userInput.generationMethod === "conversational_ai" 
          ? "conversational_ai" 
          : "enhanced";

        navigate("/contract-result", {
          state: {
            contract: data.contract,
            metadata: data.metadata,
            contractType: contractType,
            clientName: userInput.parameters.clientName || userInput.parameters["Company Name"],
            otherPartyName: userInput.parameters.otherPartyName || userInput.parameters["Employee Name"],
            version: version,
            conversationalData: userInput.conversationalData || null,
            canReturnToChat: userInput.generationMethod === "conversational_ai"
          }
        });
      } else {
        // If token is expired, redirect to login
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
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
          <h1 className="text-3xl font-bold text-gray-900">Create California Employment Contract</h1>
          <p className="text-lg text-gray-600 mt-2">
            Choose your preferred creation method - quick templates, enhanced forms, or conversational AI
          </p>
        </div>

        {/* Template Selection Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Templates</h2>
          <p className="text-sm text-gray-600 mb-4">Click a template to populate the contract requirements and switch to Basic mode for editing</p>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {contractTemplates.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md hover:bg-blue-50 transition-all duration-200 border-2 hover:border-blue-300" onClick={() => applyTemplate(template)}>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-2 rounded-lg mb-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-600 leading-tight">{template.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contract Details</CardTitle>
                <CardDescription>Fill out the form below to generate your contract</CardDescription>
              </div>
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-4">
                  {/* Basic/Pro Toggle */}
                  <div className="flex items-center gap-2">
                    <span className={isEnhancedMode ? "text-gray-500" : "font-medium text-sm"}>Basic</span>
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
                    <span className={isEnhancedMode ? "font-medium text-blue-600 text-sm" : "text-gray-500 text-sm"}>
                      Pro <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">ENHANCED</span>
                    </span>
                  </div>

                  {/* Conversational AI Toggle (with consistent spacing) */}
                  <div className={`flex items-center gap-2 border-l pl-4 transition-opacity ${
                    isEnhancedMode ? 'opacity-100' : 'opacity-50 pointer-events-none'
                  }`}>
                    <span className={!useConversationalAI ? "font-medium text-sm" : "text-gray-500 text-sm"}>Form</span>
                    <button
                      onClick={() => isEnhancedMode && setUseConversationalAI(!useConversationalAI)}
                      disabled={!isEnhancedMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        useConversationalAI && isEnhancedMode ? "bg-purple-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useConversationalAI && isEnhancedMode ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className={useConversationalAI && isEnhancedMode ? "font-medium text-purple-600 text-sm" : "text-gray-500 text-sm"}>
                      AI Chat <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">NEW</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEnhancedMode && useConversationalAI ? (
              <ConversationalContractBuilder 
                onContractGenerate={handleEnhancedGenerate}
                isLoading={loading}
                resumeData={location.state?.conversationalData || null}
                resumeSessionId={resumeChatSessionId}
              />
            ) : isEnhancedMode ? (
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
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600 font-medium">
                    Be as specific as possible. Include details about terms, conditions, compensation, duration, and any special requirements.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Example for Employment Agreement:</p>
                    <p className="text-sm text-gray-600 italic">
                      "Software developer position, full-time, $85,000 annual salary, 90-day probation period, 
                      15 days PTO, health insurance, 401k matching, remote work allowed 2 days per week, 
                      standard confidentiality and IP assignment clauses, 2-week notice period for termination."
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Example for Employment Agreement:</p>
                    <p className="text-sm text-gray-600 italic">
                      "Web development services, 3-month project duration, $5,000 total fee paid in 3 installments, 
                      includes website design and development, 2 rounds of revisions, client provides content, 
                      30-day warranty period, intellectual property transfers to client upon final payment."
                    </p>
                  </div>
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

        {/* Pro Limit Modal */}
        <ProLimitModal 
          isOpen={showProModal}
          onClose={() => setShowProModal(false)}
          contractsUsed={3}
          monthlyLimit={3}
        />
      </div>
    </div>
  );
};

export default ContractForm;
