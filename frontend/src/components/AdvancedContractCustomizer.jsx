import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Scale, 
  Users, 
  Eye, 
  Settings, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';

export function AdvancedContractCustomizer({ 
  contractData, 
  onUpdate, 
  onPreview, 
  isGenerating = false 
}) {
  const [preferences, setPreferences] = useState({
    risk_tolerance: 50,
    legal_stance: 'neutral',
    clause_strength: {
      confidentiality: 75,
      ip_assignment: 60,
      arbitration: 80,
      termination: 65,
      compensation: 70
    },
    customizations: {}
  });

  const [previewData, setPreviewData] = useState(null);
  const [activeClause, setActiveClause] = useState('confidentiality');

  useEffect(() => {
    if (onUpdate) {
      onUpdate(preferences);
    }
  }, [preferences, onUpdate]);

  // Update preferences based on AI chat data
  useEffect(() => {
    if (contractData && contractData.preferences) {
      console.log('Updating preferences from AI chat data:', contractData.preferences);
      setPreferences(prev => ({
        ...prev,
        risk_tolerance: mapRiskTolerance(contractData.preferences.risk_tolerance),
        legal_stance: contractData.preferences.legal_stance || prev.legal_stance,
        // Update other preferences based on AI analysis
        ...(contractData.aiAnalysis && contractData.aiAnalysis.recommendedClauses && {
          clause_strength: {
            ...prev.clause_strength,
            // Map recommended clauses to strength values
            ...mapClauseStrengths(contractData.aiAnalysis.recommendedClauses)
          }
        })
      }));
    }
  }, [contractData]);

  // Helper function to map AI risk tolerance to slider value
  const mapRiskTolerance = (aiRiskTolerance) => {
    if (typeof aiRiskTolerance === 'number') return aiRiskTolerance;
    
    const riskMap = {
      'conservative': 25,
      'low': 25,
      'moderate': 50,
      'medium': 50,
      'aggressive': 75,
      'high': 75
    };
    return riskMap[aiRiskTolerance] || 50;
  };

  // Helper function to map recommended clauses to strength values
  const mapClauseStrengths = (recommendedClauses = []) => {
    const strengthMap = {};
    recommendedClauses.forEach(clause => {
      // Map clause IDs to our strength categories
      if (clause.includes('confidentiality')) strengthMap.confidentiality = 80;
      if (clause.includes('ip_assignment')) strengthMap.ip_assignment = 75;
      if (clause.includes('arbitration')) strengthMap.arbitration = 85;
      if (clause.includes('termination')) strengthMap.termination = 70;
      if (clause.includes('compensation')) strengthMap.compensation = 75;
    });
    return strengthMap;
  };

  const handleRiskToleranceChange = (value) => {
    setPreferences(prev => ({
      ...prev,
      risk_tolerance: value[0]
    }));
  };

  const handleLegalStanceChange = (stance) => {
    setPreferences(prev => ({
      ...prev,
      legal_stance: stance
    }));
  };

  const handleClauseStrengthChange = (clause, value) => {
    setPreferences(prev => ({
      ...prev,
      clause_strength: {
        ...prev.clause_strength,
        [clause]: value[0]
      }
    }));
  };

  const generatePreview = async () => {
    if (onPreview) {
      const preview = await onPreview(preferences);
      setPreviewData(preview);
    }
  };

  const getRiskColor = (value) => {
    if (value < 30) return 'text-green-600 bg-green-100';
    if (value < 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStanceColor = (stance) => {
    switch (stance) {
      case 'pro_employee': return 'text-blue-600 bg-blue-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      case 'pro_employer': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const clauseCategories = {
    confidentiality: {
      icon: Shield,
      title: 'Confidentiality',
      description: 'Information protection and non-disclosure terms',
      impact: 'Controls how sensitive company information is protected'
    },
    ip_assignment: {
      icon: FileText,
      title: 'IP Assignment',
      description: 'Intellectual property ownership and assignment',
      impact: 'Determines who owns work created during employment'
    },
    arbitration: {
      icon: Scale,
      title: 'Arbitration',
      description: 'Dispute resolution and legal proceedings',
      impact: 'Sets how employment disputes will be resolved'
    },
    termination: {
      icon: AlertCircle,
      title: 'Termination',
      description: 'Employment ending conditions and notice periods',
      impact: 'Defines conditions for ending the employment relationship'
    },
    compensation: {
      icon: Users,
      title: 'Compensation',
      description: 'Salary, benefits, and payment terms',
      impact: 'Structures how and when employee will be compensated'
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Advanced Contract Customization
            <Badge variant="secondary">Pro Feature</Badge>
          </CardTitle>
          <CardDescription>
            Fine-tune your contract with professional-grade controls
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="risk-stance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="risk-stance">Risk & Stance</TabsTrigger>
              <TabsTrigger value="clauses">Clause Customization</TabsTrigger>
              <TabsTrigger value="preview">Live Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="risk-stance" className="space-y-6 mt-6">
              {/* Risk Tolerance Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Risk Tolerance</Label>
                    <p className="text-sm text-gray-600">
                      Controls overall contract protection level
                    </p>
                  </div>
                  <Badge className={getRiskColor(preferences.risk_tolerance)}>
                    {preferences.risk_tolerance < 30 ? 'Conservative' : 
                     preferences.risk_tolerance < 70 ? 'Balanced' : 'Aggressive'}
                  </Badge>
                </div>
                
                <div className="px-4">
                  <Slider
                    value={[preferences.risk_tolerance]}
                    onValueChange={handleRiskToleranceChange}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative (0)</span>
                    <span>Balanced (50)</span>
                    <span>Aggressive (100)</span>
                  </div>
                </div>

                <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <strong>Current setting ({preferences.risk_tolerance}):</strong>{' '}
                  {preferences.risk_tolerance < 30 && 
                    'Prioritizes employee protection with moderate terms favorable to the worker.'}
                  {preferences.risk_tolerance >= 30 && preferences.risk_tolerance < 70 && 
                    'Balanced approach with fair terms for both employer and employee.'}
                  {preferences.risk_tolerance >= 70 && 
                    'Employer-focused with stronger protective clauses for the company.'}
                </div>
              </div>

              <Separator />

              {/* Legal Stance Selection */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Legal Stance</Label>
                  <p className="text-sm text-gray-600">
                    Choose the overall perspective for contract language
                  </p>
                </div>

                <Select value={preferences.legal_stance} onValueChange={handleLegalStanceChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pro_employee">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        Pro-Employee
                      </div>
                    </SelectItem>
                    <SelectItem value="neutral">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        Neutral
                      </div>
                    </SelectItem>
                    <SelectItem value="pro_employer">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        Pro-Employer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Badge className={getStanceColor(preferences.legal_stance)}>
                  {preferences.legal_stance === 'pro_employee' && 'Employee-Friendly Language'}
                  {preferences.legal_stance === 'neutral' && 'Balanced Legal Language'}
                  {preferences.legal_stance === 'pro_employer' && 'Employer-Protective Language'}
                </Badge>
              </div>
            </TabsContent>

            <TabsContent value="clauses" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Clause Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Contract Clauses</Label>
                  <div className="space-y-2">
                    {Object.entries(clauseCategories).map(([key, clause]) => {
                      const IconComponent = clause.icon;
                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            activeClause === key 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveClause(key)}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{clause.title}</div>
                              <div className="text-xs text-gray-600">{clause.description}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {preferences.clause_strength[key]}%
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Clause Customization */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">
                      {clauseCategories[activeClause]?.title} Strength
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {clauseCategories[activeClause]?.impact}
                    </p>
                  </div>

                  <div className="px-4">
                    <Slider
                      value={[preferences.clause_strength[activeClause] || 50]}
                      onValueChange={(value) => handleClauseStrengthChange(activeClause, value)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Minimal (0)</span>
                      <span>Standard (50)</span>
                      <span>Maximum (100)</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                    <strong>Strength Level:</strong>{' '}
                    {(preferences.clause_strength[activeClause] || 50) < 30 ? 'Minimal - Basic protection with flexible terms' :
                     (preferences.clause_strength[activeClause] || 50) < 70 ? 'Standard - Balanced protection with typical industry terms' :
                     'Maximum - Strong protection with comprehensive coverage'}
                  </div>

                  <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <strong>Legal Impact:</strong> Higher strength levels provide more protection 
                        but may be perceived as more restrictive by the other party.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Live Contract Preview</Label>
                    <p className="text-sm text-gray-600">
                      See how your customizations affect the contract language
                    </p>
                  </div>
                  <Button onClick={generatePreview} disabled={isGenerating}>
                    <Eye className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Update Preview'}
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <ScrollArea className="h-96">
                      {previewData ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Preview Generated</span>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700">
                              {previewData.preview || 'Contract preview will appear here...'}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                          <FileText className="w-12 h-12 mb-3" />
                          <p className="text-sm">
                            Click "Update Preview" to see your customized contract
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-600">
              Customizations will be applied to your generated contract
            </div>
            <Button className="flex items-center gap-2" disabled={isGenerating}>
              <Zap className="w-4 h-4" />
              {isGenerating ? 'Applying...' : 'Apply Customizations'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}