import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Users, Shield, Zap, Target, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Scale className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">About VibeLegal</h1>
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">Beta</Badge>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Making professional California employment contracts accessible through conversational AI
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 leading-relaxed">
              VibeLegal was born from a simple observation: creating compliant California employment contracts 
              shouldn't require hours of legal research or expensive attorney fees for every hiring decision. 
              We're democratizing access to professional-grade legal documents through AI-powered conversation, 
              making it possible for businesses of all sizes to protect themselves and their employees with 
              properly drafted agreements.
            </p>
          </CardContent>
        </Card>

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                The Problem We Solve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                California's complex employment laws create a minefield for employers. Generic templates 
                often miss crucial compliance requirements, while attorney-drafted contracts can cost 
                $500-2000 per agreement. Small businesses and startups were left choosing between 
                expensive legal fees or risky template solutions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-500" />
                Our Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We've built an AI system trained specifically on California employment law that can 
                generate comprehensive, compliant contracts through natural conversation. What used 
                to take hours of legal research now takes minutes of casual discussion with our AI.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              Our Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Accessibility</h3>
                <p className="text-gray-600">
                  Professional legal documents should be accessible to businesses of all sizes, not just those with large legal budgets.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Compliance First</h3>
                <p className="text-gray-600">
                  Every contract we generate is built with California's latest employment laws in mind, protecting both employers and employees.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Transparency</h3>
                <p className="text-gray-600">
                  We believe in clear communication about what our AI can and cannot do, and when you should consult human legal counsel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beta Program */}
        <Card className="mb-12 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Beta Program Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We're currently in beta testing with a select group of legal professionals and business owners. 
              This allows us to refine our AI's understanding of California employment law and ensure 
              our contracts meet the highest professional standards.
            </p>
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-blue-800 font-medium">
                🚧 Current Focus: Perfecting California employment agreements with real-world feedback from legal professionals
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <Card className="bg-gray-100 border-gray-300">
          <CardContent className="p-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Important:</strong> VibeLegal provides AI-generated contract templates for informational purposes. 
              All contracts should be reviewed by qualified California employment law attorneys before use. 
              This platform does not provide legal advice and should not be considered a substitute for 
              professional legal counsel. Laws change frequently - always verify current compliance requirements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;