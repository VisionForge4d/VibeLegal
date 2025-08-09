import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Scale, Zap, Shield, Clock, CheckCircle, ArrowRight, FileText } from 'lucide-react';

const LandingPage = () => {
  const features = [ { icon: <Zap className="h-8 w-8 text-blue-600" />, title: "AI-Powered Generation", description: "Generate professional contracts in minutes using advanced AI technology tailored for legal professionals." }, { icon: <Shield className="h-8 w-8 text-blue-600" />, title: "Legal Compliance", description: "All contracts include proper legal language, formatting, and jurisdiction-specific clauses." }, { icon: <Clock className="h-8 w-8 text-blue-600" />, title: "Save Time", description: "Reduce contract drafting time from hours to minutes while maintaining professional quality." }, { icon: <FileText className="h-8 w-8 text-blue-600" />, title: "Multiple Contract Types", description: "Support for employment agreements, NDAs, service contracts, and more." } ];
  const contractTypes = [ "Employment Agreements", "Non-Disclosure Agreements (NDAs)", "Service Contracts", "Independent Contractor Agreements", "Purchase Agreements" ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center"><div className="flex justify-center mb-6"><Scale className="h-16 w-16 text-blue-600" /></div><h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">AI-Powered Contract Drafting<span className="block text-blue-600">for Legal Professionals</span></h1><p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">Generate professional, legally compliant contracts in minutes. VibeLegal combines cutting-edge AI with legal expertise to streamline your contract drafting process.</p><div className="flex flex-col sm:flex-row gap-4 justify-center"><Link to="/register"><Button size="lg" className="text-lg px-8 py-3">Start Free Trial<ArrowRight className="ml-2 h-5 w-5" /></Button></Link><Link to="/pricing"><Button variant="outline" size="lg" className="text-lg px-8 py-3">View Pricing</Button></Link></div></div></div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose VibeLegal?</h2><p className="text-xl text-gray-600 max-w-2xl mx-auto">Built specifically for lawyers who need efficient, reliable contract generation</p></div><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">{features.map((feature, index) => (<Card key={index} className="text-center hover:shadow-lg transition-shadow"><CardHeader><div className="flex justify-center mb-4">{feature.icon}</div><CardTitle className="text-xl">{feature.title}</CardTitle></CardHeader><CardContent><CardDescription className="text-gray-600">{feature.description}</CardDescription></CardContent></Card>))}</div></div>
      </section>
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Supported Contract Types</h2><p className="text-xl text-gray-600">Generate a wide variety of legal documents with confidence</p></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{contractTypes.map((type, index) => (<div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm"><CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" /><span className="text-gray-900 font-medium">{type}</span></div>))}</div></div>
      </section>
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex flex-col md:flex-row justify-between items-center"><div className="flex items-center space-x-2 mb-4 md:mb-0"><Scale className="h-8 w-8 text-blue-400" /><span className="text-xl font-bold">VibeLegal</span></div><div className="text-gray-400 text-sm">© 2024 VibeLegal. All rights reserved.</div></div></div>
      </footer>
    </div>
  );
};
export default LandingPage;