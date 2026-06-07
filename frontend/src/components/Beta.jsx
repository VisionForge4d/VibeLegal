import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Zap, MessageSquare, Shield, Clock, Target, CheckCircle, ArrowRight } from 'lucide-react';

const Beta = () => {
  const betaFeatures = [
    {
      icon: MessageSquare,
      title: 'Direct Developer Feedback',
      description: 'Chat directly with our development team and influence the product roadmap'
    },
    {
      icon: Star,
      title: '50% Discount Pricing',
      description: 'Pay $150/month instead of $300 while helping us perfect the platform'
    },
    {
      icon: Shield,
      title: 'Enhanced Legal Focus',
      description: 'Work with us to ensure contracts meet the highest professional standards'
    },
    {
      icon: Clock,
      title: 'Priority Support',
      description: 'Faster response times and direct access to our technical team'
    }
  ];

  const requirements = [
    'Legal professional or business owner hiring in California',
    'Commitment to providing detailed feedback on contract quality',
    'Willingness to participate in periodic user interviews',
    'Understanding that this is a beta product with limitations'
  ];

  const timeline = [
    {
      phase: 'Application',
      description: 'Submit application and use case details',
      duration: '5 minutes'
    },
    {
      phase: 'Review',
      description: 'Our team reviews your application',
      duration: '2-3 days'
    },
    {
      phase: 'Interview',
      description: 'Brief interview to understand your needs',
      duration: '15-20 minutes'
    },
    {
      phase: 'Beta Access',
      description: 'Receive beta access and onboarding',
      duration: 'Immediate'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Users className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Beta Program</h1>
            <Badge className="bg-orange-100 text-orange-800 px-3 py-1">Limited Spots</Badge>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join our exclusive beta program and help shape the future of California employment contract generation
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-blue-800 font-semibold">
              🎯 Currently accepting 5-10 legal professionals and business owners for personalized feedback and feature influence
            </p>
          </div>
        </div>

        {/* What is Beta Program */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-600" />
                What is the VibeLegal Beta Program?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Our beta program gives legal professionals and business owners early access to VibeLegal's AI-powered 
                contract generation platform. You'll work directly with our development team to refine the system 
                and ensure it meets the highest professional standards for California employment law.
              </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">What You Get:</h3>
                <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                  <li>Full platform access with all Pro features</li>
                  <li>50% discount on standard pricing</li>
                  <li>Direct communication channel with developers</li>
                  <li>Influence on feature development and priorities</li>
                  <li>Priority support and faster issue resolution</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">What We Need:</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                  <li>Detailed feedback on contract quality and accuracy</li>
                  <li>Real-world testing with your actual use cases</li>
                  <li>Participation in user interviews and surveys</li>
                  <li>Patience as we refine and improve the platform</li>
                  <li>Professional insight on legal compliance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Beta Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Exclusive Beta Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {betaFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Requirements */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Beta Program Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We're looking for committed beta testers who can provide meaningful feedback. Ideal candidates should meet these criteria:
            </p>
            <div className="space-y-3">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{requirement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Timeline */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Application Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {timeline.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{step.phase}</h3>
                  <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {step.duration}
                  </Badge>
                  {index < timeline.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-auto mt-4 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Focus */}
        <Card className="mb-12 bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle>Current Beta Focus Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              During this beta phase, we're specifically focused on perfecting these areas:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Contract Quality & Compliance</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>California employment law accuracy</li>
                  <li>Industry-specific clause variations</li>
                  <li>Executive-level contract complexity</li>
                  <li>Wage and hour compliance details</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">User Experience & AI Interaction</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Conversational AI accuracy and helpfulness</li>
                  <li>Contract customization workflows</li>
                  <li>Template variety and usefulness</li>
                  <li>Export and integration capabilities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Placeholder */}
        <Card className="mb-12 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>What Beta Testers Are Saying</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-800 font-medium">
                "We're just getting started with our beta program. 
                Your feedback will help shape these testimonials!"
              </p>
              <p className="text-blue-600 text-sm mt-2">
                Be among the first to influence the future of legal contract generation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Beta Program?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Be among the first legal professionals to shape the future of AI-powered contract generation
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Apply for Beta Access
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white bg-transparent hover:bg-white hover:text-blue-600">
                View Beta Pricing
              </Button>
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            Questions about the beta program? <Link to="/contact" className="underline hover:text-white">Contact our team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Beta;