import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Users, Key } from 'lucide-react';

const DemoNotice = () => {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <p className="font-semibold">🎯 VibeLegal Demo</p>
            <div className="text-sm space-y-1">
              <p className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Demo Account: demo@vibelegal.com</span>
              </p>
              <p className="flex items-center gap-1">
                <Key className="h-3 w-3" />
                <span>Password: DemoPassword123!</span>
              </p>
            </div>
            <p className="text-xs text-blue-600">
              This is a demonstration of VibeLegal's AI-powered contract drafting capabilities.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DemoNotice;

