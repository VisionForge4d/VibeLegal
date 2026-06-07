import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Sparkles, Zap, Users, BarChart3 } from 'lucide-react';

export function SubscriptionGate({ 
  feature, 
  userTier = 'basic', 
  requiredTier = 'pro', 
  onUpgrade,
  children 
}) {
  const hasAccess = checkTierAccess(userTier, requiredTier);

  if (hasAccess) {
    return children;
  }

  return (
    <div className="relative">
      {/* Blurred preview of the feature */}
      <div className="filter blur-sm opacity-50 pointer-events-none">
        {children}
      </div>
      
      {/* Overlay with upgrade prompt */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50/90 to-purple-50/90 backdrop-blur-sm">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Crown className="w-12 h-12 text-yellow-500" />
            </div>
            <CardTitle className="text-xl">
              Unlock {feature}
              <Badge variant="secondary" className="ml-2">Pro Feature</Badge>
            </CardTitle>
            <CardDescription>
              Upgrade to Pro to access this premium feature
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ProFeaturesList />
            
            <div className="text-center space-y-3">
              <div className="text-2xl font-bold text-gray-900">
                $29/month
                <span className="text-sm font-normal text-gray-600 ml-1">
                  billed monthly
                </span>
              </div>
              
              <Button 
                onClick={onUpgrade} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
              
              <p className="text-xs text-gray-500">
                7-day free trial • Cancel anytime
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProFeaturesList() {
  const features = [
    {
      icon: Sparkles,
      title: "Conversational AI",
      description: "Natural language contract creation"
    },
    {
      icon: Zap,
      title: "Advanced Customization",
      description: "Risk tolerance & legal stance controls"
    },
    {
      icon: BarChart3,
      title: "Unlimited Contracts",
      description: "No monthly limits on generation"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Multi-user review workflows"
    }
  ];

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-gray-700">Pro Plan Includes:</h4>
      <div className="space-y-2">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm">{feature.title}</div>
                <div className="text-xs text-gray-600">{feature.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function checkTierAccess(userTier, requiredTier) {
  const tierHierarchy = {
    'basic': 0,
    'pro': 1,
    'enterprise': 2
  };

  return (tierHierarchy[userTier] || 0) >= (tierHierarchy[requiredTier] || 0);
}

// Hook for checking subscription status
export function useSubscription() {
  const [userTier, setUserTier] = React.useState('basic');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchUserTier();
  }, []);

  const fetchUserTier = async () => {
    try {
      const response = await fetch('/api/user/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserTier(data.tier || 'basic');
      }
    } catch (error) {
      console.error('Failed to fetch user tier:', error);
      setUserTier('basic');
    } finally {
      setIsLoading(false);
    }
  };

  const hasAccess = (requiredTier) => checkTierAccess(userTier, requiredTier);

  return {
    userTier,
    isLoading,
    hasAccess,
    refreshTier: fetchUserTier
  };
}