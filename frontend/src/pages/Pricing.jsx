import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Check, Star, Zap, Shield, FileText, Clock } from 'lucide-react';

const Pricing = () => {
  const { user } = useContext(AuthContext);

  const plans = [
    {
      name: 'Basic',
      price: 49,
      period: 'month',
      description: 'Perfect for solo practitioners and small firms',
      features: [
        '25 contracts per month',
        'All contract types',
        'AI-powered generation',
        'Basic editing tools',
        'PDF download',
        'Email support'
      ],
      popular: false,
      current: user?.subscription_tier === 'basic'
    },
    {
      name: 'Premium',
      price: 99,
      period: 'month',
      description: 'Ideal for growing practices and busy lawyers',
      features: [
        'Unlimited contracts',
        'All contract types',
        'Advanced editing tools',
        'PDF download',
        'Priority support',
        'Contract templates'
      ],
      popular: true,
      current: user?.subscription_tier === 'premium'
    }
  ];

  const features = [
    { icon: <Zap className="h-6 w-6 text-blue-600" />, title: 'AI-Powered Generation', description: 'Generate professional contracts in minutes using advanced AI technology.' },
    { icon: <Shield className="h-6 w-6 text-green-600" />, title: 'Legal Compliance', description: 'All contracts include proper legal language and jurisdiction-specific clauses.' },
    { icon: <FileText className="h-6 w-6 text-purple-600" />, title: 'Multiple Contract Types', description: 'Support for employment agreements, NDAs, service contracts, and more.' },
    { icon: <Clock className="h-6 w-6 text-orange-600" />, title: 'Save Time', description: 'Reduce contract drafting time from hours to minutes, freeing you up for high-value work.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your practice. All plans include our core AI-powered contract generation features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-xl text-gray-600">/{plan.period}</span>
                </div>
                <CardDescription className="text-lg mt-4">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.current ? (
                  <Button disabled className="w-full" variant="outline">
                    Current Plan
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

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Draft Contracts
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      </div>
    </div>
  );
};

export default Pricing;