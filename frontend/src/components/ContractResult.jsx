import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Save, 
  Edit3, 
  Eye, 
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Wand2
} from 'lucide-react';
import config from '../config.js';

const ContractResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contractContent, setContractContent] = useState('');
  const [contractTitle, setContractTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [contractSections, setContractSections] = useState([]);

  useEffect(() => {
    if (!location.state || !location.state.contract) {
      navigate('/create-contract');
      return;
    }

    const { contract, contractType, clientName, otherPartyName } = location.state;
    setContractContent(contract);
    setContractTitle(`${contractType} - ${clientName} & ${otherPartyName}`);
    
    // Parse contract into sections for easier editing
    parseContractSections(contract);
  }, [location.state, navigate]);

  const parseContractSections = (contract) => {
    // Simple section parsing based on numbered headings or clear section breaks
    const sections = [];
    const lines = contract.split('\n');
    let currentSection = { title: 'Preamble', content: '' };
    
    lines.forEach((line, index) => {
      // Look for section headers (numbered sections, all caps, etc.)
      if (line.match(/^\d+\.\s+[A-Z\s]+/) || line.match(/^[A-Z\s]{3,}:?\s*$/) || line.match(/^Article\s+\d+/i)) {
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }
        currentSection = { 
          title: line.trim() || `Section ${sections.length + 1}`, 
          content: '' 
        };
      } else {
        currentSection.content += line + '\n';
      }
    });
    
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    setContractSections(sections);
  };

  const handleRegenerateSection = async (sectionIndex) => {
    setRegenerating(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const section = contractSections[sectionIndex];
      
      // Create a prompt to regenerate just this section
      const regeneratePrompt = `Please regenerate the following section of a ${location.state.contractType} for ${location.state.jurisdiction}:

Section: ${section.title}
Current content: ${section.content}

Requirements: ${location.state.requirements || 'Standard legal requirements'}

Please provide an improved version of this section only, maintaining legal accuracy and professional formatting.`;

      const response = await fetch(`${config.API_BASE_URL}/api/generate-contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contractType: location.state.contractType,
          requirements: regeneratePrompt,
          clientName: location.state.clientName,
          otherPartyName: location.state.otherPartyName,
          jurisdiction: location.state.jurisdiction
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the specific section
        const updatedSections = [...contractSections];
        updatedSections[sectionIndex].content = data.contract;
        setContractSections(updatedSections);
        
        // Rebuild the full contract
        const newContract = updatedSections.map(s => s.title + '\n' + s.content).join('\n\n');
        setContractContent(newContract);
      } else {
        setError(data.error || 'Failed to regenerate section');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSectionEdit = (sectionIndex, newContent) => {
    const updatedSections = [...contractSections];
    updatedSections[sectionIndex].content = newContent;
    setContractSections(updatedSections);
    
    // Rebuild the full contract
    const newContract = updatedSections.map(s => s.title + '\n' + s.content).join('\n\n');
    setContractContent(newContract);
  };

  const handleSave = async () => {
    if (!contractTitle.trim()) {
      setError('Please enter a title for the contract');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/save-contract`, {
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
                      Review and edit your generated contract
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="full" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="full">Full Contract</TabsTrigger>
                    <TabsTrigger value="sections">Edit by Section</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="full" className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">
                        {isEditing ? 'Edit the full contract below' : 'Review your complete contract'}
                      </p>
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
                  </TabsContent>
                  
                  <TabsContent value="sections" className="mt-4">
                    <div className="space-y-6">
                      {contractSections.map((section, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{section.title}</CardTitle>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRegenerateSection(index)}
                                disabled={regenerating}
                              >
                                {regenerating ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Regenerating...
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Regenerate
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Textarea
                              value={section.content}
                              onChange={(e) => handleSectionEdit(index, e.target.value)}
                              className="min-h-[150px] font-mono text-sm"
                              placeholder="Section content..."
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
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

