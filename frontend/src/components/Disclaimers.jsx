import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Scale, FileText, Bot, Shield, Gavel } from 'lucide-react';

const Disclaimers = () => {
  const lastUpdated = "September 4, 2025";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-900">Legal Disclaimers</h1>
            <Badge className="bg-red-100 text-red-800">Important</Badge>
          </div>
          <p className="text-lg text-gray-600">
            Last updated: {lastUpdated}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please read these disclaimers carefully before using VibeLegal
          </p>
        </div>

        {/* Critical Warning */}
        <Card className="mb-8 border-red-500 border-2 bg-red-50">
          <CardContent className="p-8">
            <div className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-4">
                🚨 CRITICAL LEGAL NOTICE 🚨
              </h2>
              <div className="bg-red-100 p-6 rounded-lg border-2 border-red-300">
                <p className="text-red-900 font-bold text-lg mb-4">
                  DO NOT USE ANY CONTRACT WITHOUT ATTORNEY REVIEW
                </p>
                <p className="text-red-800 font-semibold">
                  VibeLegal generates AI-powered contract templates for informational purposes only. 
                  ALL contracts must be reviewed by qualified California employment law attorneys 
                  before use. This is not legal advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No Attorney-Client Relationship */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-purple-600" />
              No Attorney-Client Relationship
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>VibeLegal does not create an attorney-client relationship.</strong> Our AI-powered 
                platform generates contract templates based on general legal principles and should not 
                be considered legal advice specific to your situation.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">What This Means:</h3>
                <ul className="list-disc list-inside text-purple-700 space-y-1 text-sm">
                  <li>No confidential attorney-client privilege exists</li>
                  <li>We cannot represent you in legal matters</li>
                  <li>We cannot provide advice specific to your legal situation</li>
                  <li>You must seek independent legal counsel for legal advice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-Generated Content Disclaimer */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              AI-Generated Content Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                VibeLegal uses artificial intelligence to generate contract templates. While our AI is 
                trained on California employment law, it has important limitations:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2">AI Limitations:</h3>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
                    <li>Cannot understand complex business contexts</li>
                    <li>May not account for industry-specific requirements</li>
                    <li>Cannot predict future legal changes</li>
                    <li>May miss nuanced legal considerations</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Human Review Required:</h3>
                  <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                    <li>Verify compliance with current laws</li>
                    <li>Ensure terms match your specific needs</li>
                    <li>Review for completeness and accuracy</li>
                    <li>Adapt to your unique circumstances</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Compliance Disclaimer */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Legal Compliance Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                While VibeLegal is designed with California employment law compliance in mind, 
                we cannot guarantee that generated contracts will be legally compliant in all situations.
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Important Considerations:</h3>
                <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                  <li>Laws change frequently and our AI may not reflect the latest updates</li>
                  <li>Local ordinances and federal laws may apply beyond California state law</li>
                  <li>Industry-specific regulations may not be fully incorporated</li>
                  <li>Individual circumstances may require specialized legal provisions</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-orange-800 font-semibold text-sm">
                  ⚠️ Always verify current legal requirements with qualified legal counsel before using any contract.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beta Program Disclaimers */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Beta Program Specific Disclaimers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                VibeLegal is currently in beta testing. Additional considerations apply:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Service Limitations</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>Service may be unstable or unavailable</li>
                    <li>Features may change without notice</li>
                    <li>Data backup may be limited</li>
                    <li>Support response may be delayed</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Enhanced Scrutiny Required</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>AI models are still being refined</li>
                    <li>Templates may contain errors or omissions</li>
                    <li>Legal accuracy is not guaranteed</li>
                    <li>Professional review is even more critical</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                <strong>IMPORTANT:</strong> VibeLegal's liability is strictly limited. By using our service, 
                you acknowledge and agree that:
              </p>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">Liability Limitations:</h3>
                <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                  <li>We are not liable for legal consequences of using generated contracts</li>
                  <li>We do not warrant the legal accuracy or completeness of any content</li>
                  <li>You use generated contracts entirely at your own risk</li>
                  <li>Our maximum liability is limited to fees paid for our service</li>
                  <li>We are not responsible for business losses or legal claims</li>
                </ul>
              </div>
              <p className="text-gray-700 text-sm">
                This limitation applies to the fullest extent permitted by California law.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Legal Advice */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-indigo-600" />
              Seek Professional Legal Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                For any legal matter involving employment contracts, we strongly recommend consulting 
                with qualified legal professionals who can:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 mb-2">Attorney Services:</h3>
                  <ul className="list-disc list-inside text-indigo-700 space-y-1 text-sm">
                    <li>Review and modify contracts for your specific needs</li>
                    <li>Ensure compliance with all applicable laws</li>
                    <li>Provide advice tailored to your business</li>
                    <li>Represent you in legal disputes</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">When to Consult an Attorney:</h3>
                  <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                    <li>Before implementing any employment contract</li>
                    <li>When dealing with executive-level agreements</li>
                    <li>For complex compensation structures</li>
                    <li>When facing legal challenges or disputes</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Disclaimers */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to Disclaimers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              We may update these disclaimers to reflect changes in our service or legal requirements. 
              Material changes will be communicated via email and posted on our platform. 
              Continued use of VibeLegal after changes constitutes acceptance of updated disclaimers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Disclaimers;