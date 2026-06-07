import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, AlertTriangle, FileText, Users, CreditCard, Shield } from 'lucide-react';

const Terms = () => {
  const lastUpdated = "September 4, 2025";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
            <Badge className="bg-blue-100 text-blue-800">Beta</Badge>
          </div>
          <p className="text-lg text-gray-600">
            Last updated: {lastUpdated}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            These terms govern your use of VibeLegal's beta platform
          </p>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Important Legal Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-100 p-4 rounded-lg">
              <p className="text-orange-900 font-semibold text-center">
                🚨 VibeLegal provides AI-generated contract templates. ALL CONTRACTS MUST BE REVIEWED BY QUALIFIED LEGAL COUNSEL BEFORE USE. 🚨
              </p>
              <p className="text-orange-800 text-sm mt-2 text-center">
                This platform does not provide legal advice and should not substitute professional legal consultation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              By accessing or using VibeLegal's services, you agree to be bound by these Terms of Service 
              and our Privacy Policy. If you do not agree to these terms, you may not use our services. 
              These terms apply to all users, including those in our beta testing program.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Service Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What VibeLegal Provides</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>AI-powered contract generation tools</li>
                  <li>California employment law-focused templates</li>
                  <li>Conversational interface for contract creation</li>
                  <li>Document storage and management</li>
                  <li>Export capabilities (HTML, RTF, PDF)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What VibeLegal Does NOT Provide</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Legal advice or legal representation</li>
                  <li>Attorney-client relationships</li>
                  <li>Guarantees of legal compliance</li>
                  <li>Substitute for professional legal counsel</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beta Program Terms */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Beta Program Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Beta Testing Participation</h3>
                <p className="text-gray-700 text-sm mb-2">
                  By participating in our beta program, you acknowledge that:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>The service is in testing phase and may contain bugs or limitations</li>
                  <li>Features may change or be removed without notice</li>
                  <li>We may request feedback and usage data to improve the service</li>
                  <li>Beta access may be terminated at any time</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Feedback and Improvements</h3>
                <p className="text-gray-700 text-sm">
                  We welcome your feedback to improve VibeLegal. By providing feedback, suggestions, 
                  or ideas, you grant us a perpetual, royalty-free license to use and implement 
                  such feedback in our service improvements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Security</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Maintain the confidentiality of your login credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Appropriate Use</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Use the service only for lawful purposes</li>
                  <li>Do not attempt to reverse engineer our AI systems</li>
                  <li>Do not share account credentials with others</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Legal Review Requirement</h3>
                <p className="text-gray-700 text-sm bg-yellow-50 p-3 rounded">
                  <strong>CRITICAL:</strong> You must have all generated contracts reviewed by qualified 
                  legal counsel before use. Generated contracts are templates only and require 
                  professional legal review for your specific situation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Payment and Subscription Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Beta Program Pricing</h3>
                <p className="text-gray-700 text-sm">
                  Beta program participants receive special pricing. All subscriptions are billed 
                  monthly or annually as selected. Prices are subject to change with 30 days' notice.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Refunds</h3>
                <p className="text-gray-700 text-sm">
                  We offer a 7-day free trial for new subscribers. After the trial period, 
                  refunds may be provided at our discretion for beta program participants 
                  who experience significant service issues.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cancellation</h3>
                <p className="text-gray-700 text-sm">
                  You may cancel your subscription at any time. Upon cancellation, you retain 
                  access until the end of your current billing period. Your data will be retained 
                  for 90 days after cancellation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Your Content</h3>
                <p className="text-gray-700 text-sm">
                  You retain ownership of all content you input into VibeLegal. You grant us 
                  a limited license to process your content to provide our services and improve 
                  our AI models (in anonymized form).
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Generated Contracts</h3>
                <p className="text-gray-700 text-sm">
                  Contracts generated by VibeLegal become your property upon creation. However, 
                  the underlying AI technology, templates, and methodologies remain our intellectual property.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limitations and Disclaimers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Limitations and Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Availability</h3>
                <p className="text-gray-700 text-sm">
                  We strive for high availability but do not guarantee uninterrupted service. 
                  During beta testing, maintenance windows and service interruptions may occur 
                  with limited notice.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">No Legal Advice</h3>
                <p className="text-gray-700 text-sm bg-red-50 p-3 rounded">
                  <strong>IMPORTANT:</strong> VibeLegal does not provide legal advice. Our AI-generated 
                  contracts are informational tools only. Always consult qualified legal professionals 
                  for specific legal matters.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                <p className="text-gray-700 text-sm">
                  To the maximum extent permitted by law, VibeLegal's liability is limited to 
                  the amount you paid for our services in the 12 months preceding any claim.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              We may terminate or suspend your account for violation of these terms. 
              You may terminate your account at any time through your account settings. 
              Upon termination, these terms remain in effect for any outstanding obligations.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              These Terms of Service are governed by California state law. Any disputes will be 
              resolved through binding arbitration in California, except for claims that may be 
              brought in small claims court.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              We may update these Terms of Service as our service evolves. Material changes 
              will be communicated via email at least 30 days in advance. Continued use of 
              VibeLegal after changes constitutes acceptance of updated terms.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;