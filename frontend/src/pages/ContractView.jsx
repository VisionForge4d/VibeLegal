import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus, Loader2, Download } from 'lucide-react';
import api from '../api/api';
import jsPDF from 'jspdf';

// Simplified Dropdown
const SimpleDropdown = ({ onHtmlClick, onPdfClick, disabled, isDownloading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleAction = (action) => { action(); setIsOpen(false); };
    return (
        <div className="relative inline-block text-left">
            <div>
                <Button onClick={() => setIsOpen(!isOpen)} disabled={disabled || isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download
                </Button>
            </div>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                        <button onClick={() => handleAction(onHtmlClick)} className="text-left w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">As HTML</button>
                        <button onClick={() => handleAction(onPdfClick)} className="text-left w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">As PDF</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ContractView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const contractContentRef = useRef(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const data = await api.get(`/contracts/${id}`);
        setContract(data.contract);
      } catch (err) {
        setError(err.message || 'An unexpected error occurred.');
      } finally { setLoading(false); }
    };
    fetchContract();
  }, [id]);

  const handleDownloadHtml = () => {
    if (!contract) return;
    const filename = `${contract.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    const htmlContent = `<!DOCTYPE html><html><head><title>${contract.title}</title><style>body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; } pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre>${contract.content}</pre></body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (!contract) return;
    setIsDownloading(true);
    try {
        const pdf = new jsPDF();
        const text = contract.content;
        const splitText = pdf.splitTextToSize(text, 180); // Split text to fit page width
        pdf.text(splitText, 10, 10);
        const filename = `${contract.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        pdf.save(filename);
    } catch (err) {
        console.error("PDF generation failed:", err);
        setError("PDF generation failed.");
    } finally {
        setIsDownloading(false);
    }
  };

  if (loading) { return <div>Loading...</div>; }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
        <div className="mb-8 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Button>
          <div className="flex items-center space-x-2">
            <SimpleDropdown 
              onHtmlClick={handleDownloadHtml}
              onPdfClick={handleDownloadPdf}
              disabled={!contract}
              isDownloading={isDownloading}
            />
            <Link to="/create-contract"><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> New Contract</Button></Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{contract?.title}</CardTitle>
            <CardDescription>Contract Type: {contract?.contract_type} | Created on: {new Date(contract?.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div ref={contractContentRef} className="bg-white border rounded-lg p-6 min-h-[600px] overflow-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {contract?.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractView;