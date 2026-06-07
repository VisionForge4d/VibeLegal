import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Info, Shield, Scale, AlertTriangle } from 'lucide-react';

// Key clause categories that users should have control over
const CLAUSE_CATEGORIES = {
  core: {
    title: 'Core Employment Terms',
    icon: Shield,
    clauses: [
      'at_will_employment',
      'job_title_and_duties', 
      'employee_classification',
      'compensation',
      'work_location',
      'work_hours'
    ]
  },
  benefits: {
    title: 'Benefits & Time Off',
    icon: Info,
    clauses: [
      'employee_benefits',
      'vacation_and_time_off',
      'sick_leave',
      'training_and_professional_development'
    ]
  },
  protection: {
    title: 'Legal Protections',
    icon: Scale,
    clauses: [
      'confidentiality_and_trade_secrets',
      'intellectual_property_assignment',
      'non_competition_and_non_solicitation',
      'dispute_resolution'
    ]
  },
  termination: {
    title: 'Termination & Severance',
    icon: AlertTriangle,
    clauses: [
      'termination',
      'termination_notice',
      'severance_and_termination_benefits'
    ]
  },
  operational: {
    title: 'Operational Policies',
    icon: Info,
    clauses: [
      'remote_work_and_telecommuting',
      'business_expenses_and_reimbursement',
      'technology_use_and_equipment',
      'probationary_period'
    ]
  }
};

const RISK_LEVEL_INFO = {
  low: { 
    label: 'Conservative', 
    color: 'bg-green-100 text-green-800', 
    description: 'Minimal risk, balanced approach'
  },
  moderate: { 
    label: 'Moderate', 
    color: 'bg-yellow-100 text-yellow-800', 
    description: 'Some protection, reasonable terms' 
  },
  high: { 
    label: 'Aggressive', 
    color: 'bg-red-100 text-red-800', 
    description: 'Maximum protection, strict terms' 
  }
};

const LEGAL_STANCE_INFO = {
  pro_employee: { 
    label: 'Pro-Employee', 
    color: 'bg-blue-100 text-blue-800', 
    description: 'Favors employee rights'
  },
  neutral: { 
    label: 'Balanced', 
    color: 'bg-gray-100 text-gray-800', 
    description: 'Fair to both parties'
  },
  pro_employer: { 
    label: 'Pro-Employer', 
    color: 'bg-purple-100 text-purple-800', 
    description: 'Favors employer protection' 
  }
};

export function ClauseSelector({ onClauseSelectionChange }) {
  const [selectedClauses, setSelectedClauses] = useState({});
  const [clauseLibrary, setClauseLibrary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load clause library from backend
  useEffect(() => {
    const loadClauseLibrary = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/clause-library', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setClauseLibrary(data);
          console.log('Loaded clause library with', Object.keys(data.clauses || {}).length, 'clauses');
        } else {
          console.warn('Could not load clause library:', response.status, response.statusText);
          // Fallback to mock data structure for development
          setClauseLibrary({ clauses: {} });
        }
      } catch (error) {
        console.error('Error loading clause library:', error);
        // Fallback to mock data structure for development  
        setClauseLibrary({ clauses: {} });
      } finally {
        setLoading(false);
      }
    };
    
    loadClauseLibrary();
  }, []);

  // Update parent component when selections change
  useEffect(() => {
    if (onClauseSelectionChange) {
      onClauseSelectionChange(selectedClauses);
    }
  }, [selectedClauses, onClauseSelectionChange]);

  const handleClauseVariationChange = (clauseId, variationKey) => {
    setSelectedClauses(prev => ({
      ...prev,
      [clauseId]: variationKey
    }));
  };

  const getClauseVariations = (clauseId) => {
    if (!clauseLibrary?.clauses?.[clauseId]) {
      // Return mock variations for development/testing
      return [
        {
          key: 'standard',
          risk_level: 'low',
          legal_stance: 'neutral',
          legal_justification: 'Standard approach for this clause type'
        },
        {
          key: 'enhanced',
          risk_level: 'moderate', 
          legal_stance: 'pro_employer',
          legal_justification: 'Enhanced protection with additional safeguards'
        },
        {
          key: 'comprehensive',
          risk_level: 'high',
          legal_stance: 'pro_employer', 
          legal_justification: 'Maximum protection and comprehensive coverage'
        }
      ];
    }
    
    const clause = clauseLibrary.clauses[clauseId];
    return Object.entries(clause.variations || {}).map(([key, variation]) => ({
      key,
      ...variation
    }));
  };

  const getClauseTitle = (clauseId) => {
    if (clauseLibrary?.clauses?.[clauseId]?.title) {
      return clauseLibrary.clauses[clauseId].title;
    }
    // Fallback to formatted clause ID
    return clauseId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">Loading clause options...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-purple-600" />
          Contract Clause Selection
        </CardTitle>
        <CardDescription>
          Choose specific variations for each type of clause in your contract. 
          More specific control than general risk/stance settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {Object.entries(CLAUSE_CATEGORIES).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger key={key} value={key} className="text-xs">
                  <IconComponent className="w-3 h-3 mr-1" />
                  {category.title.split(' ')[0]}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(CLAUSE_CATEGORIES).map(([categoryKey, category]) => (
            <TabsContent key={categoryKey} value={categoryKey} className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <category.icon className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">{category.title}</h3>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-4 pr-4">
                    {category.clauses.map(clauseId => {
                      const variations = getClauseVariations(clauseId);
                      const selectedVariation = selectedClauses[clauseId];
                      
                      if (variations.length === 0) return null;
                      
                      return (
                        <Card key={clauseId} className="border-gray-200">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                              {getClauseTitle(clauseId)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <Label className="text-xs text-gray-600">
                                Choose variation:
                              </Label>
                              <Select
                                value={selectedVariation || ''}
                                onValueChange={(value) => handleClauseVariationChange(clauseId, value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select clause variation..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {variations.map(variation => (
                                    <SelectItem key={variation.key} value={variation.key}>
                                      <div className="flex items-center gap-2">
                                        <span className="capitalize">{variation.key.replace(/_/g, ' ')}</span>
                                        <Badge 
                                          className={`text-xs ${RISK_LEVEL_INFO[variation.risk_level]?.color || 'bg-gray-100 text-gray-800'}`}
                                        >
                                          {RISK_LEVEL_INFO[variation.risk_level]?.label || variation.risk_level}
                                        </Badge>
                                        <Badge 
                                          variant="outline"
                                          className={`text-xs ${LEGAL_STANCE_INFO[variation.legal_stance]?.color || 'bg-gray-100 text-gray-800'}`}
                                        >
                                          {LEGAL_STANCE_INFO[variation.legal_stance]?.label || variation.legal_stance}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {/* Show preview of selected variation */}
                              {selectedVariation && variations.find(v => v.key === selectedVariation) && (
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                  <div className="flex items-start gap-2 mb-2">
                                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-1">
                                        Legal Justification:
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {variations.find(v => v.key === selectedVariation)?.legal_justification}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        <Separator className="my-6" />
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            {Object.keys(selectedClauses).length} specific clause variations selected
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedClauses({})}
            disabled={Object.keys(selectedClauses).length === 0}
          >
            Reset All Selections
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}