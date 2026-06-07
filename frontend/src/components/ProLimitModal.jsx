import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Zap, 
  Shield, 
  Users, 
  TrendingUp,
  X 
} from 'lucide-react';

export function ProLimitModal({ isOpen, onClose, contractsUsed = 0, monthlyLimit = 3 }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600" />
              <DialogTitle>Upgrade to Pro</DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            You've reached your monthly limit for Basic plan contracts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Usage Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Monthly Usage</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                Limit Reached
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {contractsUsed} of {monthlyLimit} Pro contracts used this month
            </p>
          </div>

          {/* Pro Benefits */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Unlock Pro Features</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-1 rounded">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Unlimited Pro contracts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-1 rounded">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Advanced legal protections & clauses</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-1 rounded">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">Conversational AI contract creation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-1 rounded">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm text-gray-700">Priority support & beta access</span>
              </div>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Founding Member Pro</h4>
                <p className="text-sm text-blue-700">Limited beta pricing</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">$150</div>
                <div className="text-sm text-blue-700">/month</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                50% Off - Beta Only
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link to="/pricing" className="flex-1">
              <Button className="w-full">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </Link>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
          </div>

          {/* Small print */}
          <p className="text-xs text-gray-500 text-center">
            Your Basic plan includes unlimited basic contracts. Pro contracts include advanced AI features and enhanced legal protections.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}