import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Database, Mail } from 'lucide-react';

const Privacy = () => {
  const lastUpdated = "September 4, 2025";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <Badge className="bg-blue-100 text-blue-800">Beta</Badge>
          </div>
          <p className="text-lg text-gray-600">
            Last updated: {lastUpdated}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This policy applies to our beta testing program
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Privacy Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              VibeLegal respects your privacy and is committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data during our beta testing program.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm font-medium">
                🛡️ Key Commitment: We never sell your personal data or contract information to third parties.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Account Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Email address and name for account creation</li>
                  <li>Company name (if provided)</li>
                  <li>Subscription tier and billing information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Contract Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Contract content and parameters you provide</li>
                  <li>AI conversation history for contract generation</li>
                  <li>Generated contract documents and templates</li>
                  <li>Usage patterns and feature utilization</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>IP address and browser information</li>
                  <li>Device type and operating system</li>
                  <li>Usage analytics and performance metrics</li>
                  <li>Error logs for debugging and improvement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Service Delivery</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Generate and store your contracts</li>
                  <li>Provide account access and authentication</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Deliver customer support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Product Improvement</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Analyze usage patterns to improve AI accuracy</li>
                  <li>Debug technical issues and enhance performance</li>
                  <li>Develop new features based on user needs</li>
                  <li>Ensure legal compliance and accuracy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Data Security & Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Encryption & Storage</h3>
                <p className="text-gray-700 text-sm">
                  All data is encrypted in transit (TLS) and at rest. Contract data is stored in secure, 
                  SOC 2 compliant databases with regular backups and access controls.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Access Controls</h3>
                <p className="text-gray-700 text-sm">
                  Access to your data is strictly limited to authorized personnel who need it for 
                  service delivery, support, or product improvement. All access is logged and monitored.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">AI Training</h3>
                <p className="text-gray-700 text-sm">
                  Contract content may be used in aggregate to improve our AI models, but is always 
                  anonymized and stripped of identifying information before any analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Data Access & Control</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Download all your contract data</li>
                  <li>Request data corrections or updates</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of non-essential communications</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">CCPA Rights (California)</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Right to know what personal data we collect</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of data sales (we don't sell data)</li>
                  <li>Right to non-discrimination for exercising rights</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beta Program */}
        <Card className="mb-8 bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle>Beta Program Considerations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              During our beta testing period, we may:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
              <li>Collect additional feedback through surveys or interviews</li>
              <li>Monitor usage patterns more closely to identify improvements</li>
              <li>Request permission to use anonymized examples for case studies</li>
              <li>Provide enhanced support that may involve reviewing your contracts</li>
            </ul>
            <div className="bg-orange-100 p-3 rounded mt-4">
              <p className="text-orange-800 text-sm font-medium">
                Beta participants have the right to withdraw from the program at any time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Contact Us About Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or want to exercise your privacy rights, contact us:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Email:</strong> privacy@vibelegal.com<br />
                <strong>Subject:</strong> Privacy Policy Question<br />
                <strong>Response Time:</strong> 5 business days
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              We may update this Privacy Policy as our service evolves. We'll notify active users 
              of any material changes via email at least 30 days before they take effect. 
              Continued use of VibeLegal after changes constitute acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;