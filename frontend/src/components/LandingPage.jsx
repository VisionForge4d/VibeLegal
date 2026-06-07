import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Scale, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  FileText,
  Users,
  Award
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: "Conversational AI",
      description: "Create contracts through natural conversation. Just describe what you need - our AI handles the legal complexity."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "CA Compliance Focus",
      description: "2025-compliant with California employment law, wage/hour requirements, and Fair Chance Act provisions."
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Minutes Not Hours",
      description: "Generate comprehensive employment agreements in 5-10 minutes instead of drafting from scratch."
    }
  ];

  const contractTypes = [
    "California Employment Agreements",
    "At-Will Employment Contracts",
    "Executive Employment Agreements",
    "Professional Services Employment",
    "Probationary Period Contracts",
    "Remote Work Employment Agreements"
  ];
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Scale className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              California Employment Contracts
              <span className="block text-blue-600">Made Simple with AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Purpose-built for California law with 2025 compliance in mind. Generate professional agreements in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8 py-3">
                  Join Beta Program
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-center">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-full">
                Private Beta • Limited founding seats • Locked pricing for 12 months
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why VibeLegal for California Employment Law?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Purpose-built for California employment agreements with 2025-compliant legal protections
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contract Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Contract with Key Protections
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how our AI generates comprehensive employment agreements with essential legal protections
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="border rounded-lg p-6 bg-gray-50 font-mono text-sm leading-relaxed">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">CALIFORNIA EMPLOYMENT AGREEMENT</h3>
                <p className="text-gray-600 mt-2">Between TechCorp Inc. and Sarah Johnson</p>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <div className="relative">
                  <p><strong>1. EMPLOYMENT RELATIONSHIP.</strong> Employee agrees to work as Software Developer...</p>
                  <span className="absolute -left-6 top-0 text-blue-600 font-bold">①</span>
                </div>
                
                <div className="relative">
                  <p><strong>2. INTELLECTUAL PROPERTY ASSIGNMENT.</strong> All work product, inventions, and developments...</p>
                  <span className="absolute -left-6 top-0 text-green-600 font-bold">②</span>
                </div>
                
                <div className="relative">
                  <p><strong>3. CONFIDENTIALITY.</strong> Employee agrees to maintain strict confidentiality...</p>
                  <span className="absolute -left-6 top-0 text-purple-600 font-bold">③</span>
                </div>
                
                <div className="relative">
                  <p><strong>4. AT-WILL EMPLOYMENT.</strong> Employment is at-will and may be terminated...</p>
                  <span className="absolute -left-6 top-0 text-red-600 font-bold">④</span>
                </div>
                
                <div className="relative">
                  <p><strong>5. WAGE AND HOUR COMPLIANCE.</strong> Salary: $95,000/year. Overtime pay per CA Labor Code...</p>
                  <span className="absolute -left-6 top-0 text-yellow-600 font-bold">⑤</span>
                </div>
                
                <p className="text-center text-gray-500 italic">...and 15+ additional protective clauses</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-5 gap-4 mt-8 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold text-lg">①</span>
                <span className="text-gray-700">Position & Duties</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-600 font-bold text-lg">②</span>
                <span className="text-gray-700">IP Assignment</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-600 font-bold text-lg">③</span>
                <span className="text-gray-700">Confidentiality</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-600 font-bold text-lg">④</span>
                <span className="text-gray-700">At-Will Terms</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600 font-bold text-lg">⑤</span>
                <span className="text-gray-700">CA Wage/Hour</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contract Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              California Employment Contract Types
            </h2>
            <p className="text-xl text-gray-600">
              Specialized templates for different employment situations, all California-compliant
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contractTypes.map((type, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-900 font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, fast, and professional contract generation in three steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat with AI</h3>
              <p className="text-gray-600">
                Tell our AI about the position, salary, benefits, and any special requirements in natural language
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Contract Generated</h3>
              <p className="text-gray-600">
                AI creates a comprehensive California employment agreement with all necessary legal protections
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customize & Download</h3>
              <p className="text-gray-600">
                Fine-tune risk levels, add custom clauses, and download your professional contract
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Why We Built VibeLegal
            </h2>
            
            <div className="prose prose-lg mx-auto text-gray-600 space-y-6">
              <p className="text-xl leading-relaxed">
                After watching lawyers spend countless hours drafting employment contracts from scratch, 
                we realized there had to be a better way. California employment law is complex, constantly 
                changing, and critical to get right.
              </p>
              
              <p className="text-lg">
                VibeLegal was born from a simple question: <strong>What if creating legally compliant 
                employment contracts was as easy as having a conversation?</strong>
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 my-8">
                <p className="text-blue-800 font-medium text-lg">
                  "We're not trying to replace lawyers - we're trying to free them from tedious drafting 
                  so they can focus on strategy, negotiation, and client relationships."
                </p>
                <p className="text-blue-600 mt-2 text-sm">
                  - VibeLegal Founding Team
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mt-12 text-left">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
                  <p>
                    Make professional-grade California employment contracts accessible to every legal 
                    practice, from solo attorneys to large firms. We believe great legal technology 
                    should understand law, not just process documents.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Why California First?</h3>
                  <p>
                    California has some of the most complex employment laws in the nation. If we can 
                    nail California compliance, we can expand anywhere. Plus, it's the largest legal 
                    market for employment law in the US.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Streamline California Employment Contracts?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Beta platform for California employment law - help us build the future of legal contract generation
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Join Beta Program
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Scale className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">VibeLegal</span>
              <span className="px-2 py-1 text-xs font-medium text-blue-400 bg-blue-900/30 rounded-full">β</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 VibeLegal. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

