import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function EnhancedContractBuilder({ onGenerate, isLoading }) {
  const [preferences, setPreferences] = useState({
    risk_tolerance: 'low',
    legal_stance: 'neutral'
  });

  const [contractData, setContractData] = useState({
    'Employee Name': '',
    'Company Name': '',
    'Job Title': '',
    'State': 'California'
  });

  const handleGenerate = () => {
    onGenerate({
      contractType: 'employment_agreement',
      parameters: contractData,
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
            Professional-grade employment agreements with intelligent clause selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Employee Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={contractData['Employee Name']}
                onChange={(e) => setContractData(prev => ({
                  ...prev,
                  'Employee Name': e.target.value
                }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Company Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={contractData['Company Name']}
                onChange={(e) => setContractData(prev => ({
                  ...prev,
                  'Company Name': e.target.value
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Risk Tolerance</label>
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
              <label className="text-sm font-medium">Legal Stance</label>
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
            {isLoading ? 'Generating Enhanced Contract...' : 'Generate Professional Contract'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
