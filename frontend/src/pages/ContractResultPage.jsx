import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Save, Edit3, Eye, CheckCircle, ArrowLeft } from 'lucide-react';
import { marked } from 'marked'; // Using 'marked' to render Markdown to HTML for display

const ContractResultPage = () => {
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

    const handleDownload = () => {
        const blob = new Blob([contractContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contractTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!location.state) {
        return null; // Or a loading spinner
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <FileText className="mr-3 h-8 w-8 text-blue-600" />
                                Contract Composed
                            </h1>
                            <p className="text-lg text-gray-600 mt-2">Review, edit, and save your new document.</p>
                        </div>
                        {saved && (
                            <Alert className="w-auto bg-green-50 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">Contract saved!</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Contract Document</CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                                        {isEditing ? <><Eye className="mr-2 h-4 w-4" />Preview</> : <><Edit3 className="mr-2 h-4 w-4" />Edit</>}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <Textarea
                                        value={contractContent}
                                        onChange={(e) => setContractContent(e.target.value)}
                                        className="min-h-[600px] font-mono text-sm border-blue-300 focus:border-blue-500"
                                    />
                                ) : (
                                    <div 
                                        className="prose prose-sm max-w-none bg-white border rounded-lg p-6 min-h-[600px]"
                                        dangerouslySetInnerHTML={{ __html: marked(contractContent) }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details & Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Contract Title</Label>
                                    <Input id="title" value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} className="mt-1" />
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Type:</strong> {location.state.contractType}</p>
                                    <p><strong>Jurisdiction:</strong> {location.state.jurisdiction}</p>
                                </div>
                                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                                <Button onClick={handleSave} disabled={saving} className="w-full">
                                    {saving ? 'Saving...' : <><Save className="mr-2 h-4 w-4" />Save Contract</>}
                                </Button>
                                <Button variant="outline" onClick={handleDownload} className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download as Markdown
                                </Button>
                            </CardContent>
                        </Card>
                        <Button variant="secondary" onClick={() => navigate('/create-contract')} className="w-full">
                            Compose Another Contract
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractResultPage;
