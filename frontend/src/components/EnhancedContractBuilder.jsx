import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function EnhancedContractBuilder({ onGenerate, isLoading }) {
  const [preferences, setPreferences] = useState({
    risk_tolerance: 'low',
    legal_stance: 'neutral'
  });

  const [contractData, setContractData] = useState({
    contractType: 'Employment Agreement',
    requirements: '',
    clientName: '',
    otherPartyName: '',
    jurisdiction: 'California'
  });

  const contractTypes = [
    { value: 'Employment Agreement', label: 'Employment Agreement' },
    { value: 'NDA', label: 'Non-Disclosure Agreement (NDA)' },
    { value: 'Service Contract', label: 'Service Contract' },
    { value: 'Independent Contractor', label: 'Independent Contractor Agreement' }
  ];

  const jurisdictions = [
    'California', 'New York', 'Texas', 'Florida', 'Illinois', 'Pennsylvania', 
    'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia',
    'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri',
    'Maryland', 'Wisconsin', 'Colorado', 'Minnesota', 'South Carolina', 'Alabama'
  ];

  const handleGenerate = () => {
    if (!contractData.contractType || !contractData.requirements || !contractData.clientName || 
        !contractData.otherPartyName || !contractData.jurisdiction) {
      return;
    }

    onGenerate({
      contractType: "employment_agreement",
      parameters: {
        clientName: contractData.clientName,
        otherPartyName: contractData.otherPartyName,
        "Employee Name": contractData.otherPartyName,
        "Company Name": contractData.clientName,
        "State": contractData.jurisdiction,
        "Job Title": "Employee",
        "Supervisor Title": "Manager",
        "Work Location": "Company offices and/or remote",
        "exempt/non-exempt": "exempt",
        "amount": "competitive salary",
        "hour/year": "year",
        "Arbitration Provider, e.g., JAMS": "JAMS",
        "Specify County, e.g., Los Angeles County": "Los Angeles County",
        "Salary Amount": "competitive salary",
        "Pay Period": "year",
        "Company Type": "corporation",
        "Supervisor Name": "Manager",
        title: contractData.contractType,
        jurisdiction: contractData.jurisdiction,
        requirements: contractData.requirements
      },
      preferences: preferences
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Professional Contract Generation</span>
            <Badge variant="secondary">Pro Plan</Badge>
          </CardTitle>
          <CardDescription>
            AI-powered contract generation with professional legal positioning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pro Plan Controls */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <Label className="text-sm font-medium text-blue-900">Risk Tolerance</Label>
              <Select 
                value={preferences.risk_tolerance}
                onValueChange={(value) => setPreferences(prev => ({...prev, risk_tolerance: value}))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low (Conservative)</SelectItem>
                  <SelectItem value="moderate">🟡 Moderate (Balanced)</SelectItem>
                  <SelectItem value="high">🔴 High (Aggressive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-blue-900">Legal Stance</Label>
              <Select 
                value={preferences.legal_stance}
                onValueChange={(value) => setPreferences(prev => ({...prev, legal_stance: value}))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro_employee">🔵 Pro-Employee</SelectItem>
                  <SelectItem value="neutral">⚪ Neutral</SelectItem>
                  <SelectItem value="pro_employer">🟣 Pro-Employer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contract Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="contractType">Contract Type *</Label>
              <Select 
                value={contractData.contractType} 
                onValueChange={(value) => setContractData(prev => ({...prev, contractType: value}))}
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
                value={contractData.jurisdiction} 
                onValueChange={(value) => setContractData(prev => ({...prev, jurisdiction: value}))}
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
            <div>
              <Label htmlFor="clientName">Your Name/Company *</Label>
              <Input
                id="clientName"
                value={contractData.clientName}
                onChange={(e) => setContractData(prev => ({...prev, clientName: e.target.value}))}
                placeholder="Your name or company name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="otherPartyName">Other Party Name *</Label>
              <Input
                id="otherPartyName"
                value={contractData.otherPartyName}
                onChange={(e) => setContractData(prev => ({...prev, otherPartyName: e.target.value}))}
                placeholder="Name of the other party"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="requirements">Contract Requirements *</Label>
            <Textarea
              id="requirements"
              value={contractData.requirements}
              onChange={(e) => setContractData(prev => ({...prev, requirements: e.target.value}))}
              placeholder="Describe your contract requirements in detail..."
              className="mt-1 min-h-[120px]"
            />
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
                <p className="text-sm font-medium text-gray-700 mb-2">Example for Service Contract:</p>
                <p className="text-sm text-gray-600 italic">
                  "Web development services, 3-month project duration, $5,000 total fee paid in 3 installments, 
                  includes website design and development, 2 rounds of revisions, client provides content, 
                  30-day warranty period, intellectual property transfers to client upon final payment."
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            className="w-full"
            disabled={isLoading || !contractData.contractType || !contractData.requirements || 
                     !contractData.clientName || !contractData.otherPartyName || !contractData.jurisdiction}
          >
            {isLoading ? 'Generating Professional Contract...' : 'Generate Professional Contract'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
