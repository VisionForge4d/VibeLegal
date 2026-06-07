import React, { useState } from 'react';
import { ChevronDown, ChevronRight, HelpCircle, MessageCircle, Zap, Shield, CreditCard, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  const faqCategories = [
    {
      title: "Beta Program",
      icon: Zap,
      color: "text-purple-600",
      items: [
        {
          question: "What is VibeLegal's Beta Program?",
          answer: "VibeLegal is currently in beta, offering California employment contract generation with AI-powered legal intelligence. We're perfecting our MVP with real user feedback before expanding to other states and contract types. Beta users get access to all premium features while we refine the platform."
        },
        {
          question: "What's included in the beta?",
          answer: "The beta includes: California employment contracts, AI conversational interface, professional contract editor with typography and watermarks, comprehensive clause selection (33 categories, 99 variations), multiple download formats, and premium customization features. You get full access to our Pro-level features."
        },
        {
          question: "How long will the beta program last?",
          answer: "The beta program will continue through Q4 2024 as we validate our market fit and gather user feedback. Beta users will receive advance notice of any pricing changes and special transition offers when we move to general availability."
        },
        {
          question: "Will my beta account carry over?",
          answer: "Yes! All your contracts, account settings, and subscription status will carry over seamlessly when we exit beta. Beta users will receive grandfathered pricing benefits for their continued support."
        }
      ]
    },
    {
      title: "Contract Generation",
      icon: FileText,
      color: "text-blue-600",
      items: [
        {
          question: "What types of contracts can I generate?",
          answer: "Currently, VibeLegal specializes in California employment contracts. This includes at-will employment agreements, contractor agreements, executive contracts, and part-time employment contracts. We're focusing on perfecting employment law before expanding to other contract types."
        },
        {
          question: "How accurate are the AI-generated contracts?",
          answer: "Our contracts are generated using California-specific legal templates and enhanced with AI intelligence that incorporates 50+ legal parameters. However, all contracts include prominent legal disclaimers and should be reviewed by a qualified attorney. We update our legal knowledge base regularly to maintain compliance."
        },
        {
          question: "Can I customize contract clauses?",
          answer: "Yes! Our Enhanced mode offers comprehensive clause selection with 33 categories and 99 variations. You can choose specific risk levels (conservative, moderate, aggressive) and legal stances (pro-employee, neutral, pro-employer). The Professional Editor also allows typography, watermark, and formatting customization."
        },
        {
          question: "What download formats are available?",
          answer: "Contracts can be downloaded as: styled HTML (with full legal disclaimers), Microsoft Word documents (.doc), plain text, and print-ready formats. All downloads include comprehensive legal disclaimers and professional formatting."
        }
      ]
    },
    {
      title: "AI Features",
      icon: MessageCircle,
      color: "text-green-600",
      items: [
        {
          question: "How does the AI conversation work?",
          answer: "Our AI chat interface uses advanced conversation intelligence to extract 50+ legal parameters through natural dialogue. It acts as an employment law attorney persona, asking relevant questions to understand your specific needs and generate appropriately tailored contracts."
        },
        {
          question: "Can I resume conversations?",
          answer: "Yes! Pro users can save and resume conversations. The AI maintains context and conversation state, allowing you to refine requirements over multiple sessions. Your conversation history is preserved for easy reference."
        },
        {
          question: "What makes VibeLegal's AI different?",
          answer: "Our AI is specifically trained on California employment law with strategic legal intelligence. Unlike generic AI, it understands legal nuances, compliance requirements, and employer protection strategies. It uses the Master Input Brief framework for comprehensive parameter extraction."
        },
        {
          question: "Is the AI conversation private?",
          answer: "Yes, all conversations are private and encrypted. We never share your contract details or business information. Conversation data is used only to improve your experience and generate accurate contracts for your specific needs."
        }
      ]
    },
    {
      title: "Subscription & Pricing",
      icon: CreditCard,
      color: "text-orange-600",
      items: [
        {
          question: "What subscription tiers are available?",
          answer: "We offer three tiers: Basic (limited features), Pro ($29/month - full AI chat, contract editor, unlimited contracts), and Premium ($99/month - priority support, advanced features). Beta users get special access to Pro features during the testing period."
        },
        {
          question: "Is there a free tier?",
          answer: "During beta, we focus on providing value to paying customers rather than free users. This allows us to invest in quality, legal compliance, and feature development. We offer a trial period for new users to test our capabilities."
        },
        {
          question: "Can I cancel anytime?",
          answer: "Yes, subscriptions can be canceled anytime with no penalties. You'll retain access to your features until the end of your billing period. All your saved contracts remain accessible even after cancellation."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer refunds within 30 days of purchase if you're not satisfied. As a beta platform, we're committed to ensuring users find value in our service and will work with you to resolve any concerns."
        }
      ]
    },
    {
      title: "Legal & Compliance",
      icon: Shield,
      color: "text-red-600",
      items: [
        {
          question: "Are the contracts legally valid?",
          answer: "Our contracts are based on California legal templates and current employment law requirements. However, every contract includes prominent disclaimers stating that this is AI-generated content that should be reviewed by a qualified attorney. We are not providing legal advice."
        },
        {
          question: "How do you stay updated with law changes?",
          answer: "We regularly update our clause library and legal templates to reflect current California employment law, including 2025 wage/hour requirements, meal/rest period compliance, and Fair Chance Act compliance. However, users should always verify current legal requirements."
        },
        {
          question: "What are the legal disclaimers?",
          answer: "All contracts include prominent legal disclaimers stating: (1) This is AI-generated content, (2) Not legal advice, (3) Should be reviewed by an attorney, (4) VibeLegal is not responsible for legal accuracy or enforceability, (5) Users should consult legal professionals for important contracts."
        },
        {
          question: "Can I use these contracts for my business?",
          answer: "The contracts are designed for business use, but we strongly recommend having any important contract reviewed by a California employment attorney before implementation. Laws change frequently, and every business situation has unique considerations."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: HelpCircle,
      color: "text-gray-600",
      items: [
        {
          question: "What if I encounter bugs or issues?",
          answer: "As a beta platform, we actively collect user feedback to improve the experience. Report any bugs or issues through our contact form, and we'll address them promptly. Beta users get priority support for technical issues."
        },
        {
          question: "How do I provide feedback?",
          answer: "We welcome all feedback! Contact us at hello@vibelegal.com, use the in-app feedback tools, or reach out through our social media channels. Your input directly shapes our product development roadmap."
        },
        {
          question: "Are there system requirements?",
          answer: "VibeLegal works in any modern web browser (Chrome, Safari, Firefox, Edge). No downloads or installations required. The platform is responsive and works on desktop, tablet, and mobile devices."
        },
        {
          question: "What about data security?",
          answer: "We use industry-standard security measures including encryption in transit and at rest, secure authentication, and regular security audits. Your contract data and business information are kept strictly confidential."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                Frequently Asked Questions
                <Badge variant="secondary" className="ml-3 text-xs">
                  Beta Program
                </Badge>
              </h1>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about VibeLegal's beta platform for California employment contract generation
          </p>
        </div>

        {/* Beta Notice */}
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              🚀 Join Our Beta Program
            </CardTitle>
            <CardDescription className="text-purple-700">
              VibeLegal is currently in beta! We're perfecting our California employment contract system 
              with real user feedback before expanding nationwide.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to="/register">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" className="border-purple-300 text-purple-700">
                <Link to="/beta">Learn About Beta</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="overflow-hidden">
              <CardHeader>
                <CardTitle className={`flex items-center ${category.color}`}>
                  <category.icon className="w-6 h-6 mr-3" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const globalIndex = categoryIndex * 100 + itemIndex;
                    const isOpen = openItem === globalIndex;
                    
                    return (
                      <div key={itemIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                          onClick={() => toggleItem(globalIndex)}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 pr-4">
                              {item.question}
                            </h3>
                            {isOpen ? (
                              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 pt-2">
                            <div className="text-gray-600 leading-relaxed">
                              {item.answer}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 text-center">
              Still Have Questions?
            </CardTitle>
            <CardDescription className="text-blue-700 text-center">
              We're here to help! As a beta platform, we value every user question and feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href="mailto:hello@vibelegal.com">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Email Support
                </a>
              </Button>
              <Button asChild variant="outline" className="border-blue-300 text-blue-700">
                <Link to="/contact">Contact Form</Link>
              </Button>
            </div>
            <p className="text-sm text-blue-600 text-center mt-4">
              Average response time: 24 hours • Beta users get priority support
            </p>
          </CardContent>
        </Card>

        {/* Legal Footer */}
        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Important:</strong> VibeLegal provides AI-powered document generation tools. 
            This is not legal advice. All contracts should be reviewed by a qualified attorney before use.
            We are not responsible for the legal accuracy or enforceability of generated documents.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;