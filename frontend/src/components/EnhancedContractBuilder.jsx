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
    { value: 'Service Contract', label: 'Service Contract' }
  ];

  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const handleGenerate = () => {
    onGenerate({
      contractType: 'employment_agreement',
      parameters: {
        'Employee Name': contractData.clientName,
        'Company Name': contractData.otherPartyName,
        title: contractData.contractType,
        jurisdiction: contractData.jurisdiction
      },
      requirements: contractData.requirements,
      preferences: preferences
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            California Employment Contract
            <Badge variant="secondary">Enhanced</Badge>
          </CardTitle>
          <CardDescription>
            AI-powered professional employment agreements with intelligent clause selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contract Type *</Label>
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
              <Label>State/Jurisdiction *</Label>
              <Select 
                value={contractData.jurisdiction} 
                onValueChange={(value) => setContractData(prev => ({...prev, jurisdiction: value}))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {usStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Your Name/Company *</Label>
              <Input
                value={contractData.clientName}
                onChange={(e) => setContractData(prev => ({
                  ...prev,
                  clientName: e.target.value
                }))}
                placeholder="Your name or company name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Other Party Name *</Label>
              <Input
                value={contractData.otherPartyName}
                onChange={(e) => setContractData(prev => ({
                  ...prev,
                  otherPartyName: e.target.value
                }))}
                placeholder="Name of the other party"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Contract Requirements *</Label>
            <Textarea
              value={contractData.requirements}
              onChange={(e) => setContractData(prev => ({
                ...prev,
                requirements: e.target.value
              }))}
              placeholder="Describe your contract requirements. Our AI will analyze these to generate intelligent, contextual legal language..."
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Risk Tolerance</Label>
              <Select
                value={preferences.risk_tolerance}
                onValueChange={(value) => setPreferences(prev => ({
                  ...prev,
                  risk_tolerance: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low Risk - Conservative</SelectItem>
                  <SelectItem value="moderate">🟡 Moderate Risk - Balanced</SelectItem>
                  <SelectItem value="high">🔴 High Risk - Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Legal Stance</Label>
              <Select
                value={preferences.legal_stance}
                onValueChange={(value) => setPreferences(prev => ({
                  ...prev,
                  legal_stance: value
                }))}
              >
                <SelectTrigger>
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

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating AI-Enhanced Contract...' : 'Generate AI-Powered Professional Contract'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
