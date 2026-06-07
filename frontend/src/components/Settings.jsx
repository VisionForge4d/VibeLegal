import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Server, Cloud, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Settings() {
  const [localLLMEnabled, setLocalLLMEnabled] = useState(false);
  const [endpoint, setEndpoint] = useState('http://localhost:11434/api/generate');
  const [model, setModel] = useState('llama3.1:70b');
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLocalLLMEnabled(data.local_llm_enabled || false);
        setEndpoint(data.local_llm_endpoint || 'http://localhost:11434/api/generate');
        setModel(data.local_llm_model || 'llama3.1:70b');
        setApiKey(data.local_llm_api_key || '');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/test-local-llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ endpoint, model, apiKey })
      });

      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      setTestStatus('error');
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          local_llm_enabled: localLLMEnabled,
          local_llm_endpoint: endpoint,
          local_llm_model: model,
          local_llm_api_key: apiKey
        })
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              AI Provider Settings
              <Badge variant="secondary">Enterprise</Badge>
            </CardTitle>
            <CardDescription>
              Choose between cloud AI (Google Gemini) or your own local LLM for complete data privacy
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {localLLMEnabled ? (
                    <Server className="w-5 h-5 text-green-600" />
                  ) : (
                    <Cloud className="w-5 h-5 text-blue-600" />
                  )}
                  <Label htmlFor="llm-toggle" className="text-base font-medium">
                    {localLLMEnabled ? 'Local LLM (Private)' : 'Cloud AI (Google Gemini)'}
                  </Label>
                </div>
                <p className="text-sm text-gray-500">
                  {localLLMEnabled
                    ? 'All AI processing stays on your machine. Maximum privacy.'
                    : 'Uses Google Gemini API. Data sent to Google servers.'}
                </p>
              </div>
              <Switch
                id="llm-toggle"
                checked={localLLMEnabled}
                onCheckedChange={setLocalLLMEnabled}
              />
            </div>

            {localLLMEnabled && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-medium text-sm">Local LLM Configuration</h3>

                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="http://localhost:11434/api/generate"
                  />
                  <p className="text-xs text-gray-500">
                    Ollama: http://localhost:11434/api/generate
                    <br />
                    LM Studio: http://localhost:1234/v1/chat/completions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model Name</Label>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="llama3.1:70b"
                  />
                  <p className="text-xs text-gray-500">
                    Examples: llama3.1:70b, mistral, qwen2.5-coder:32b, deepseek-coder-v2
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key (optional)</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Leave empty for local Ollama/LM Studio"
                  />
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <Button onClick={testConnection} variant="outline" className="flex-1 min-w-[150px]">
                    Test Connection
                  </Button>
                  {testStatus === 'testing' && (
                    <Badge variant="secondary">Testing...</Badge>
                  )}
                  {testStatus === 'success' && (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </Badge>
                  )}
                  {testStatus === 'error' && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Button onClick={saveSettings} disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">About Local LLMs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-gray-600">
            <p>• <strong>Complete Privacy:</strong> Your contract data never leaves your computer</p>
            <p>• <strong>No API Costs:</strong> Unlimited usage without per-request charges</p>
            <p>• <strong>Offline Capable:</strong> Works without internet connection</p>
            <p>• <strong>Model Choice:</strong> Use any Ollama, LM Studio, or compatible model</p>
            <p className="pt-2 text-xs">
              Recommended: Llama 3.1 70B, Qwen2.5-Coder 32B, or DeepSeek Coder V2 for best legal contract quality
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Settings;
