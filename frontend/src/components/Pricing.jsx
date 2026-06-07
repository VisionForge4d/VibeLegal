import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  FileText,
  Clock,
  Headphones
} from 'lucide-react';

const Pricing = () => {
  const { user } = useContext(AuthContext);

  const plans = [
    {
      name: 'Basic',
      price: 0,
      period: 'Free',
      description: 'Get started with employment contract basics',
      features: [
        'Unlimited basic contracts',
        'Up to 3 Pro contracts/month', 
        'Save & download (HTML export)',
        'Community support',
        'Always free'
      ],
      popular: false,
      current: user?.subscription_tier === 'basic',
      note: 'Available after beta program'
    },
    {
      name: 'Founding Member Pro',
      price: 150,
      originalPrice: 300,
      period: 'month',
      description: 'Exclusive beta program - Limited seats',
      features: [
        'Everything in Basic',
        'Unlimited Pro contracts',
        'Risk tolerance & legal stance controls',
        'Advanced templates',
        'AI Chat (coming soon)',
        'Direct feedback channel to dev team',
        'Locked pricing for 12 months',
        'Limited seats available'
      ],
      popular: true,
      badge: 'Beta Only - 50% Off',
      seatCounter: 'Limited seats available',
      current: user?.subscription_tier === 'pro'
    },
    {
      name: 'Enterprise',
      price: null,
      period: 'Coming Soon',
      description: 'Advanced features for teams and organizations',
      features: [
        'Team seats & collaboration',
        'Admin dashboards',
        'Custom compliance workflows',
        'Local AI model option (data never leaves office)',
        'API & integrations',
        'Dedicated support'
      ],
      popular: false,
      badge: 'Coming Soon',
      isComingSoon: true,
      current: false
    }
  ];

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: 'Conversational Contract Creation',
      description: 'Create contracts by chatting with AI - no complex forms or legal jargon required'
    },
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: '2025 California Law Compliance',
      description: 'Built-in compliance with latest CA employment law, wage/hour rules, and Fair Chance Act'
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      title: 'Employment Law Focused',
      description: 'Specialized exclusively for California employment agreements and related contracts'
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: 'Minutes Instead of Hours',
      description: 'Generate comprehensive employment contracts in 5-10 minutes vs hours of drafting'
    },
    {
      icon: <Users className="h-6 w-6 text-red-600" />,
      title: 'Employer Protection Focus',
      description: 'Strategic legal protections including IP assignment, confidentiality, and non-compete clauses'
    },
    {
      icon: <Headphones className="h-6 w-6 text-indigo-600" />,
      title: 'Direct Developer Access',
      description: 'Beta testers get direct feedback channel to influence product development'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our exclusive beta program for early access. Purpose-built for California employment law.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''} ${plan.isComingSoon ? 'opacity-75 bg-gray-50' : ''}`}
            >
              {plan.betaLabel && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-100 text-orange-800 px-3 py-1 text-xs">
                    {plan.betaLabel}
                  </Badge>
                </div>
              )}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    {plan.badge || 'Most Popular'}
                  </Badge>
                </div>
              )}
              {plan.badge && !plan.popular && !plan.betaLabel && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="outline" className={`px-4 py-1 ${plan.isComingSoon ? 'bg-gray-100 text-gray-600' : 'bg-white'}`}>
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className={`text-2xl font-bold ${plan.isComingSoon ? 'text-gray-600' : ''}`}>{plan.name}</CardTitle>
                <div className="mt-4">
                  {plan.price === 0 ? (
                    <>
                      <span className="text-5xl font-bold text-gray-900">Free</span>
                      <span className="text-xl text-gray-600"></span>
                      {plan.note && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs text-gray-600">
                            {plan.note}
                          </Badge>
                        </div>
                      )}
                    </>
                  ) : plan.price === null ? (
                    <span className="text-2xl font-bold text-gray-500">{plan.period}</span>
                  ) : (
                    <>
                      {plan.originalPrice && (
                        <div className="mb-2">
                          <span className="text-2xl text-gray-400 line-through">${plan.originalPrice}</span>
                          <span className="text-sm text-gray-500 ml-1">/{plan.period}</span>
                        </div>
                      )}
                      <span className={`text-5xl font-bold ${plan.isComingSoon ? 'text-gray-500' : 'text-gray-900'}`}>${plan.price}</span>
                      <span className={`text-xl ${plan.isComingSoon ? 'text-gray-500' : 'text-gray-600'}`}>/{plan.period}</span>
                    </>
                  )}
                </div>
                <CardDescription className={`text-lg mt-4 ${plan.isComingSoon ? 'text-gray-500' : ''}`}>
                  {plan.description}
                </CardDescription>
                {plan.seatCounter && (
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                      {plan.seatCounter}
                    </Badge>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className={`h-5 w-5 ${plan.isComingSoon ? 'text-gray-400' : 'text-green-500'} mr-3 flex-shrink-0`} />
                      <span className={`${plan.isComingSoon ? 'text-gray-500' : 'text-gray-700'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.isComingSoon ? (
                  <Button className="w-full" variant="outline" disabled>
                    Join Waitlist
                  </Button>
                ) : plan.current ? (
                  <Button disabled className="w-full" variant="outline">
                    Current Plan
                  </Button>
                ) : plan.name === 'Basic' ? (
                  <Button className="w-full" variant="outline" disabled>
                    Join Waitlist
                  </Button>
                ) : user ? (
                  <Button className="w-full">
                    Upgrade to {plan.name}
                  </Button>
                ) : (
                  <Link to="/register">
                    <Button className="w-full">
                      Get Started with {plan.name}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Draft Contracts
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed specifically for legal professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Beta Program Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Join Our Beta Program
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Help shape the future of California employment contract generation. Beta testers get priority access, direct feedback channels, and significant savings.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Limited Spots</h3>
                <p className="text-gray-600">
                  Only 5-10 beta testers selected for personalized feedback and feature influence
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Direct Access</h3>
                <p className="text-gray-600">
                  Chat directly with our development team and influence the product roadmap
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">50% Savings</h3>
                <p className="text-gray-600">
                  Pay $150/month instead of $300 while helping us perfect the platform
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold mb-2">What contract types are supported?</h3>
              <p className="text-gray-600">
                Currently focused exclusively on California employment agreements. More contract types coming based on beta feedback.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">How do I become a beta tester?</h3>
              <p className="text-gray-600">
                Start with the free Basic plan, then contact us through the feedback button if you're interested in beta access.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Are the contracts legally compliant?</h3>
              <p className="text-gray-600">
                Yes, built with 2025 California employment law compliance, but always have contracts reviewed by qualified counsel.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">What's included in beta testing?</h3>
              <p className="text-gray-600">
                Full platform access, direct developer feedback, influence on new features, and 50% discount on pricing.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Exclusive Beta?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Be among the first legal professionals to shape the future of California employment contract generation
          </p>
          {user ? (
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Upgrade Your Plan
            </Button>
          ) : (
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Join Beta Program
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;

