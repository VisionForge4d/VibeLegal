import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Crown, 
  Check, 
  CreditCard, 
  Shield, 
  Sparkles, 
  Zap, 
  Users, 
  BarChart3,
  Clock,
  DollarSign,
  Star
} from 'lucide-react';

export function ProUpgradeFlow({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('plans'); // 'plans', 'billing', 'payment', 'success'
  const [selectedPlan, setSelectedPlan] = useState('pro-monthly');
  const [billingInfo, setBillingInfo] = useState({
    email: '',
    name: '',
    company: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = {
    'pro-monthly': {
      id: 'pro-monthly',
      name: 'Pro Monthly',
      price: 29,
      billing: 'month',
      savings: null,
      recommended: true
    },
    'pro-yearly': {
      id: 'pro-yearly',
      name: 'Pro Yearly',
      price: 290,
      billing: 'year',
      savings: '17%',
      recommended: false
    }
  };

  const proFeatures = [
    {
      icon: Sparkles,
      title: 'Conversational AI Contract Builder',
      description: 'Create contracts through natural conversation'
    },
    {
      icon: Zap,
      title: 'Advanced Customization Controls',
      description: 'Risk tolerance sliders and legal stance selection'
    },
    {
      icon: BarChart3,
      title: 'Unlimited Contract Generation',
      description: 'No monthly limits on contract creation'
    },
    {
      icon: Shield,
      title: 'Contract Version History',
      description: 'Track changes and restore previous versions'
    },
    {
      icon: Users,
      title: 'Team Collaboration (Coming Soon)',
      description: 'Multi-user workflows and approvals'
    },
    {
      icon: Clock,
      title: 'Priority Processing',
      description: 'Faster AI generation and support response'
    }
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleNextStep = () => {
    if (step === 'plans') {
      setStep('billing');
    } else if (step === 'billing') {
      setStep('payment');
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/user/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tier: 'pro',
          billingCycle: plans[selectedPlan].billing === 'year' ? 'yearly' : 'monthly'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutSession.url;
      } else {
        throw new Error(data.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(`Payment processing failed: ${error.message}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlanDetails = plans[selectedPlan];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Upgrade to VibeLegal Pro
          </DialogTitle>
          <DialogDescription>
            Unlock powerful AI features and unlimited contract generation
          </DialogDescription>
        </DialogHeader>

        <Tabs value={step} className="w-full">
          {/* Plan Selection */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <RadioGroup value={selectedPlan} onValueChange={handlePlanSelect}>
                {Object.values(plans).map((plan) => (
                  <Label
                    key={plan.id}
                    htmlFor={plan.id}
                    className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <RadioGroupItem value={plan.id} id={plan.id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{plan.name}</span>
                        {plan.recommended && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        {plan.savings && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Save {plan.savings}
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold">
                        ${plan.price}
                        <span className="text-sm font-normal text-gray-600">
                          /{plan.billing}
                        </span>
                      </div>
                      {plan.billing === 'year' && (
                        <div className="text-sm text-gray-600">
                          ${(plan.price / 12).toFixed(2)}/month billed annually
                        </div>
                      )}
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Everything in Pro includes:</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {proFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{feature.title}</div>
                        <div className="text-sm text-gray-600">{feature.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                7-day free trial • Cancel anytime • Secure payment
              </div>
              <Button onClick={handleNextStep} className="px-8">
                Continue with {selectedPlanDetails.name}
                <span className="ml-2">${selectedPlanDetails.price}/{selectedPlanDetails.billing === 'year' ? 'year' : 'month'}</span>
              </Button>
            </div>
          </TabsContent>

          {/* Billing Information */}
          <TabsContent value="billing" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Billing Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billing-email">Email Address *</Label>
                  <Input
                    id="billing-email"
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="billing-name">Full Name *</Label>
                  <Input
                    id="billing-name"
                    value={billingInfo.name}
                    onChange={(e) => setBillingInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Smith"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="billing-company">Company Name (Optional)</Label>
                <Input
                  id="billing-company"
                  value={billingInfo.company}
                  onChange={(e) => setBillingInfo(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Acme Inc."
                  className="mt-1"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="flex justify-between items-center">
                <span>{selectedPlanDetails.name}</span>
                <span className="font-semibold">
                  ${selectedPlanDetails.price}/{selectedPlanDetails.billing}
                </span>
              </div>
              {selectedPlanDetails.savings && (
                <div className="text-sm text-green-600 mt-1">
                  You save {selectedPlanDetails.savings} with annual billing
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep('plans')}>
                Back to Plans
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={!billingInfo.email || !billingInfo.name}
              >
                Continue to Payment
              </Button>
            </div>
          </TabsContent>

          {/* Payment Information */}
          <TabsContent value="payment" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h3>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="card-number">Card Number *</Label>
                  <Input
                    id="card-number"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date *</Label>
                    <Input
                      id="expiry"
                      value={paymentInfo.expiry}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiry: e.target.value }))}
                      placeholder="MM/YY"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="123"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="card-name">Cardholder Name *</Label>
                  <Input
                    id="card-name"
                    value={paymentInfo.name}
                    onChange={(e) => setPaymentInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Smith"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Secure Payment</div>
                  <div className="text-sm text-green-700">
                    Your payment information is encrypted and secure. We use Stripe for payment processing.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Final Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{selectedPlanDetails.name}</span>
                  <span>${selectedPlanDetails.price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Billing cycle</span>
                  <span>Every {selectedPlanDetails.billing}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${selectedPlanDetails.price}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep('billing')}>
                Back to Billing
              </Button>
              <Button 
                onClick={handleProcessPayment}
                disabled={!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvv || !paymentInfo.name || isProcessing}
                className="px-8"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Complete Purchase
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Success */}
          <TabsContent value="success" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold text-green-800">Welcome to VibeLegal Pro!</h3>
                <p className="text-gray-600 mt-2">
                  Your subscription has been activated successfully. You now have access to all Pro features.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-800">
                  <strong>What happens next:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Your Pro features are now active</li>
                    <li>You can start using conversational AI immediately</li>
                    <li>Confirmation email sent to {billingInfo.email}</li>
                    <li>Billing starts after your 7-day free trial</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}