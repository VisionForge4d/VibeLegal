import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'X (Twitter)',
      href: 'https://x.com/vibelegal',
      icon: Twitter
    },
    {
      name: 'LinkedIn', 
      href: 'https://linkedin.com/company/vibelegal',
      icon: Linkedin
    },
    {
      name: 'Email',
      href: 'mailto:hello@vibelegal.com',
      icon: Mail
    }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Legal Disclaimers', href: '/disclaimers' }
  ];

  const companyLinks = [
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Beta Program', href: '/beta' },
    { name: 'Contact', href: '/contact' }
  ];

  const resourceLinks = [
    { 
      name: 'CA Employment Law Guide', 
      href: 'https://www.dir.ca.gov/dlse/FAQ_EmploymentLawGuide.htm',
      external: true
    },
    { 
      name: 'Fair Employment & Housing Act', 
      href: 'https://www.dfeh.ca.gov/feha/',
      external: true  
    },
    { 
      name: 'CA Labor Code', 
      href: 'https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=LAB',
      external: true
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Scale className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">VibeLegal</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              AI-powered California employment contract generation. 
              Making professional legal documents accessible through conversation.
            </p>
            
            {/* Beta Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900 text-blue-200 mb-6">
              🚧 Beta Platform - Founding Members Welcome
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">CA Employment Law</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                  >
                    {link.name}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {currentYear} VibeLegal. All rights reserved.
            </div>
            <div className="text-gray-400 text-sm mt-4 md:mt-0">
              <span className="mr-6">Built for California lawyers</span>
              <span className="text-blue-400">🚧 Beta v1.0</span>
            </div>
          </div>
          
          {/* Legal Disclaimer */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Legal Disclaimer:</strong> VibeLegal generates AI-powered contract templates 
              for informational purposes. All contracts should be reviewed by qualified California employment law attorneys 
              before use. This platform does not provide legal advice and should not be considered a substitute for 
              professional legal counsel. Laws change frequently - always verify current compliance requirements.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;