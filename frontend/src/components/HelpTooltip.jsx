import React from 'react';
import { HelpCircle, Info, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export function HelpTooltip({ 
  children, 
  content, 
  type = 'info', 
  side = 'top',
  className = '',
  showIcon = true,
  maxWidth = '300px'
}) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'security':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'info':
      default:
        return <HelpCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getContentStyle = () => {
    const baseStyles = `max-w-[${maxWidth}] text-sm`;
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-200 bg-green-50`;
      case 'warning':
        return `${baseStyles} border-yellow-200 bg-yellow-50`;
      case 'security':
        return `${baseStyles} border-blue-200 bg-blue-50`;
      case 'info':
      default:
        return `${baseStyles} border-gray-200 bg-white`;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={`inline-flex items-center gap-1 ${className}`}>
          {children}
          {showIcon && getIcon()}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className={getContentStyle()}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TrustBadge({ type, children, className = '' }) {
  const getBadgeStyle = () => {
    switch (type) {
      case 'secure':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'legal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'beta':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'verified':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'secure':
        return <Shield className="w-3 h-3" />;
      case 'legal':
        return <Info className="w-3 h-3" />;
      case 'verified':
        return <CheckCircle className="w-3 h-3" />;
      case 'beta':
        return <span className="text-xs font-bold">β</span>;
      default:
        return null;
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`text-xs flex items-center gap-1 ${getBadgeStyle()} ${className}`}
    >
      {getIcon()}
      {children}
    </Badge>
  );
}

export function SecurityIndicator({ level = 'high', className = '' }) {
  const indicators = {
    high: {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      text: 'Highly Secure',
      description: 'Bank-level encryption and security measures'
    },
    medium: {
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      text: 'Secure',
      description: 'Industry-standard security practices'
    },
    basic: {
      color: 'text-gray-600',
      bgColor: 'bg-gray-100', 
      text: 'Protected',
      description: 'Basic security measures in place'
    }
  };

  const indicator = indicators[level];

  return (
    <HelpTooltip 
      content={indicator.description}
      type="security"
      className={className}
    >
      <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${indicator.bgColor}`}>
        <Shield className={`w-4 h-4 ${indicator.color}`} />
        <span className={`text-xs font-medium ${indicator.color}`}>
          {indicator.text}
        </span>
      </div>
    </HelpTooltip>
  );
}

export function FeatureExplanation({ title, description, benefits = [], className = '' }) {
  return (
    <HelpTooltip 
      content={
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-gray-600">{description}</p>
          {benefits.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Benefits:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
      maxWidth="400px"
      className={className}
    >
      <span className="text-blue-600 hover:text-blue-700 cursor-help border-b border-dotted border-blue-300">
        {title}
      </span>
    </HelpTooltip>
  );
}

// Pre-built common tooltips for the app
export const CommonTooltips = {
  AIGenerated: (
    <HelpTooltip 
      content="This contract is generated using AI based on your specific requirements and California employment law. While comprehensive, it should be reviewed by an attorney."
      type="info"
    >
      <TrustBadge type="legal">AI Generated</TrustBadge>
    </HelpTooltip>
  ),
  
  LegalDisclaimer: (
    <HelpTooltip 
      content="VibeLegal provides document generation tools, not legal advice. All contracts should be reviewed by a qualified attorney before use."
      type="warning"
    >
      <TrustBadge type="legal">Not Legal Advice</TrustBadge>
    </HelpTooltip>
  ),
  
  BetaFeature: (
    <HelpTooltip 
      content="This feature is currently in beta. We're actively improving it based on user feedback. Report any issues to help us make it better."
      type="info"
    >
      <TrustBadge type="beta">Beta Feature</TrustBadge>
    </HelpTooltip>
  ),
  
  SecureData: (
    <HelpTooltip 
      content="Your data is encrypted in transit and at rest. We never share your contract information with third parties."
      type="security"
    >
      <TrustBadge type="secure">Secure & Private</TrustBadge>
    </HelpTooltip>
  ),
  
  CaliforniaSpecific: (
    <HelpTooltip 
      content="This contract is specifically designed for California employment law, including wage & hour requirements, meal breaks, and Fair Chance Act compliance."
      type="info"
    >
      <TrustBadge type="verified">CA Employment Law</TrustBadge>
    </HelpTooltip>
  ),

  ProFeature: (
    <HelpTooltip 
      content="This advanced feature is included with Pro subscriptions. It provides enhanced customization and professional-grade contract generation."
      type="success"
    >
      <TrustBadge type="verified">Pro Feature</TrustBadge>
    </HelpTooltip>
  )
};