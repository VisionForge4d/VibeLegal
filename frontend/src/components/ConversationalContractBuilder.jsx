import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { SubscriptionGate, useSubscription } from './SubscriptionGate';
import { ProUpgradeFlow } from './ProUpgradeFlow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CommonTooltips, SecurityIndicator } from './HelpTooltip';
import { 
  MessageCircle, 
  FileText, 
  Crown,
  Sparkles,
  Shield,
  Info
} from 'lucide-react';

export function ConversationalContractBuilder({ onContractGenerate, isLoading, resumeData, resumeSessionId }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [contractData, setContractData] = useState(null);
  const [showUpgradeFlow, setShowUpgradeFlow] = useState(false);
  const [contractId, setContractId] = useState(null);
  const [liveConversationData, setLiveConversationData] = useState(null);
  const { userTier, hasAccess, refreshTier } = useSubscription();

  const handleChatContractGenerate = async (chatData) => {
    console.log('Chat data received for generation:', chatData);
    setContractData(chatData);

    // Generate the contract using the existing flow
    if (onContractGenerate) {
      const result = await onContractGenerate(chatData);
      if (result && result.contractId) {
        setContractId(result.contractId);
      }
    }

    // Switch to preview tab after generation to show contract details
    setActiveTab('preview');
  };

  // Handle live conversation updates from ChatInterface
  const handleConversationUpdate = (conversationState) => {
    setLiveConversationData(conversationState);
  };

  // Note: Customization features moved to Enhanced section
  // All customization in AI Chat happens through conversation

  const handleVersionSelect = (version) => {
    console.log('Selected version:', version);
  };

  const handleVersionRestore = async (version) => {
    console.log('Restoring version:', version);
    // Implement version restoration logic
  };

  const handleUpgradeSuccess = () => {
    refreshTier();
    setShowUpgradeFlow(false);
  };

  // For basic users, show upgrade prompts
  if (!hasAccess('conversational_ai')) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Conversational AI Contract Builder
              <Badge variant="secondary">Pro Feature</Badge>
            </CardTitle>
            <CardDescription>
              Create professional contracts through natural conversation with our AI assistant
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <SubscriptionGate
              feature="Conversational AI Contract Builder"
              userTier={userTier}
              requiredTier="pro"
              onUpgrade={() => setShowUpgradeFlow(true)}
            >
              <ChatInterface
                onContractGenerate={handleChatContractGenerate}
                isLoading={isLoading}
                resumeData={resumeData}
                onConversationUpdate={handleConversationUpdate}
                resumeSessionId={resumeSessionId}
              />
            </SubscriptionGate>
          </CardContent>
        </Card>

        <ProUpgradeFlow
          isOpen={showUpgradeFlow}
          onClose={() => setShowUpgradeFlow(false)}
          onSuccess={handleUpgradeSuccess}
        />
      </>
    );
  }

  // Pro users get full access
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Conversational AI Contract Builder
            <Badge className="bg-blue-100 text-blue-800">Pro Active</Badge>
          </CardTitle>
          <CardDescription className="space-y-3">
            <div>
              Professional contract generation through AI conversation, with preview and version control
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {CommonTooltips.SecureData}
              {CommonTooltips.CaliforniaSpecific}
              {CommonTooltips.AIGenerated}
              <SecurityIndicator level="high" />
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Keep ChatInterface always mounted to preserve state */}
            <div className={`mt-6 ${activeTab === 'chat' ? '' : 'hidden'}`}>
              <ChatInterface
                onContractGenerate={handleChatContractGenerate}
                isLoading={isLoading}
                resumeData={resumeData}
                onConversationUpdate={handleConversationUpdate}
                resumeSessionId={resumeSessionId}
              />
            </div>

            <TabsContent value="preview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Contract Preview</CardTitle>
                  <CardDescription>
                    See what information has been gathered from your conversation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {liveConversationData || contractData ? (
                    <div className="space-y-4">
                      {/* Progress Indicator */}
                      {liveConversationData?.progressIndicator && (
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">Conversation Progress</span>
                            <Badge className="bg-blue-600">{liveConversationData.progressIndicator}</Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: (liveConversationData.progressIndicator || '').replace(/\s*complete/i, '') }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Extracted Parameters */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Extracted Contract Information
                        </h4>
                        {liveConversationData?.extractedParams && Object.keys(liveConversationData.extractedParams).length > 0 ? (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {Object.entries(liveConversationData.extractedParams).map(([key, value]) => (
                              <div key={key} className="p-2 bg-white rounded border">
                                <span className="font-medium text-gray-700">{key}:</span>
                                <p className="text-gray-600 mt-1">{value}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            Continue the conversation to extract contract parameters...
                          </p>
                        )}
                      </div>

                      {/* Contract Type Info */}
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium mb-2 text-blue-900">Contract Configuration</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-800">Type:</span>
                            <p className="text-blue-700">
                              {contractData?.contractType || liveConversationData?.contractType || 'Employment Agreement'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">Jurisdiction:</span>
                            <p className="text-blue-700">
                              {liveConversationData?.jurisdiction || 'California'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Message Count */}
                      {liveConversationData?.messageCount && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800">
                            <span className="font-medium">Conversation turns:</span> {liveConversationData.messageCount} messages exchanged
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button onClick={() => setActiveTab('chat')} variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Continue Chat
                        </Button>
                        {liveConversationData?.canGenerate && (
                          <Button
                            onClick={() => setActiveTab('chat')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Ready to Generate
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
                      <MessageCircle className="w-16 h-16 mb-4 text-gray-400" />
                      <p className="text-base font-medium">Start a Conversation</p>
                      <p className="text-sm mt-2 max-w-md">
                        Begin chatting with the AI assistant to gather contract information.
                        Extracted details will appear here in real-time.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ProUpgradeFlow
        isOpen={showUpgradeFlow}
        onClose={() => setShowUpgradeFlow(false)}
        onSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}
