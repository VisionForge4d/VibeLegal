import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';

const contractConfig = {
    'California Employment Agreement': {
        jurisdiction: 'California',
        required_parameters: [
            { key: 'annual_salary', label: 'Annual Salary ($)', type: 'number' },
            { key: 'overtime_status', label: 'Overtime Status', type: 'select', options: ['Exempt', 'Non-Exempt'] },
            { key: 'arbitration_county', label: 'Arbitration County', type: 'text' },
            { key: 'governing_law_county', label: 'Governing Law County', type: 'text' }
        ],
        options: [
            { key: 'at_will_employment', label: 'At-Will Employment Clause', variations: [ { value: 'default', label: 'Standard At-Will' }, { value: 'with_cause_examples', label: 'At-Will with "For Cause" Examples' } ] },
            { key: 'arbitration', label: 'Arbitration Clause', variations: [ { value: 'none', label: 'None' }, { value: 'jams_provider', label: 'Arbitration via JAMS' }, { value: 'aaa_provider', label: 'Arbitration via AAA' } ] },
            { key: 'class_action_waiver', label: 'Class Action Waiver', variations: [ { value: 'none', label: 'No Waiver' }, { value: 'default', label: 'Include Waiver' } ] }
        ]
    }
};

const ContractForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [contractType, setContractType] = useState('');
    const [parameters, setParameters] = useState({ clientName: '', otherPartyName: '', title: '' });
    const [options, setOptions] = useState({});
    const [currentConfig, setCurrentConfig] = useState(null);

    useEffect(() => {
        const newConfig = contractConfig[contractType];
        setCurrentConfig(newConfig);
        setParameters(prev => ({ clientName: prev.clientName, otherPartyName: prev.otherPartyName, title: prev.title }));
        const defaultOptions = {};
        if (newConfig) { newConfig.options.forEach(opt => { defaultOptions[opt.key] = opt.variations[0].value; }); }
        setOptions(defaultOptions);
    }, [contractType]);

    const handleParameterChange = (key, value) => { setParameters(prev => ({ ...prev, [key]: value })); };
    const handleOptionChange = (key, value) => { setOptions(prev => ({ ...prev, [key]: value })); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!contractType || !parameters.clientName || !parameters.otherPartyName || !parameters.title) {
            setError('Please fill in all general information fields, including the contract title.');
            return;
        }
        setLoading(true);
        const payload = { contractType, jurisdiction: currentConfig.jurisdiction, parameters, options };
        console.log("✅ Submitting Payload to Backend:", JSON.stringify(payload, null, 2));
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/generate-contract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.ok) {
                // Navigate to the result page and pass the new contract data
                navigate('/contract-result', { state: { contract: data.contract } });
            } else { 
                setError(data.error || 'Failed to generate contract.'); 
            }
        } catch (err) {
            console.error('Network or client-side error:', err);
            setError('A network error occurred. Is the backend server running?');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8"><Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" /><h1 className="text-3xl font-bold text-gray-900">Intelligent Contract Composer</h1></div>
                <Card>
                    <CardHeader><CardTitle>Contract Composer</CardTitle><CardDescription>Fill out all fields to generate and save your contract.</CardDescription></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="text-lg font-semibold">General Information</h3>
                                <div><Label htmlFor="title">Contract Title *</Label><Input id="title" value={parameters.title} onChange={(e) => handleParameterChange('title', e.target.value)} placeholder="e.g., Employment Agreement for John Doe" className="mt-1" /></div>
                                <div className="grid md-grid-cols-2 gap-6">
                                    <div><Label htmlFor="clientName">Your Name/Company (Employer) *</Label><Input id="clientName" value={parameters.clientName} onChange={(e) => handleParameterChange('clientName', e.target.value)} placeholder="e.g., Acme Inc." className="mt-1" /></div>
                                    <div><Label htmlFor="otherPartyName">Other Party Name (Employee) *</Label><Input id="otherPartyName" value={parameters.otherPartyName} onChange={(e) => handleParameterChange('otherPartyName', e.target.value)} placeholder="e.g., Jane Doe" className="mt-1" /></div>
                                </div>
                            </div>
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="text-lg font-semibold">Contract Type</h3>
                                <Select value={contractType} onValueChange={setContractType}><SelectTrigger className="mt-1"><SelectValue placeholder="Select contract type" /></SelectTrigger><SelectContent><SelectItem value="California Employment Agreement">California Employment Agreement</SelectItem></SelectContent></Select>
                            </div>
                            {currentConfig && (
                                <>
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <h3 className="text-lg font-semibold">Key Parameters</h3>
                                        <div className="grid md-grid-cols-2 gap-6">{currentConfig.required_parameters.map(param => (<div key={param.key}><Label htmlFor={param.key}>{param.label} *</Label>{param.type === 'select' ? (<Select value={parameters[param.key] || ''} onValueChange={(value) => handleParameterChange(param.key, value)}><SelectTrigger className="mt-1"><SelectValue placeholder={`Select ${param.label}`} /></SelectTrigger><SelectContent>{param.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>) : (<Input id={param.key} type={param.type} value={parameters[param.key] || ''} onChange={(e) => handleParameterChange(param.key, e.target.value)} placeholder={`Enter ${param.label}`} className="mt-1" />)}</div>))}</div>
                                    </div>
                                    <div className="space-y-4 p-4 border rounded-lg">
                                        <h3 className="text-lg font-semibold">Clause Options</h3>
                                        <div className="grid md-grid-cols-2 gap-6">{currentConfig.options.map(opt => (<div key={opt.key}><Label htmlFor={opt.key}>{opt.label}</Label><Select value={options[opt.key] || ''} onValueChange={(value) => handleOptionChange(opt.key, value)}><SelectTrigger className="mt-1"><SelectValue placeholder={`Select ${opt.label}`} /></SelectTrigger><SelectContent>{opt.variations.map(variation => <SelectItem key={variation.value} value={variation.value}>{variation.label}</SelectItem>)}</SelectContent></Select></div>))}</div>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end space-x-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
                                <Button type="submit" disabled={loading || !contractType} className="min-w-[160px]">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Composing...</> : 'Compose & Save'}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
export default ContractForm;
