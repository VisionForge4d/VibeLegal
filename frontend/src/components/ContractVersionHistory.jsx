import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Eye, 
  Download, 
  GitBranch, 
  ArrowRight, 
  User, 
  FileText, 
  Diff,
  CheckCircle,
  AlertCircle,
  History
} from 'lucide-react';

export function ContractVersionHistory({ contractId, onVersionSelect, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [compareVersions, setCompareVersions] = useState({ from: null, to: null });

  useEffect(() => {
    if (contractId) {
      fetchVersionHistory();
    }
  }, [contractId]);

  const fetchVersionHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/contracts/${contractId}/versions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (error) {
      console.error('Failed to fetch version history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVersionClick = (version) => {
    setSelectedVersion(version);
    if (onVersionSelect) {
      onVersionSelect(version);
    }
  };

  const handleRestore = async (version) => {
    if (onRestore) {
      await onRestore(version);
      fetchVersionHistory(); // Refresh after restore
    }
  };

  const getVersionBadge = (version) => {
    if (version.is_active) {
      return <Badge className="bg-green-100 text-green-800">Current</Badge>;
    }
    if (version.version_number === 1) {
      return <Badge variant="outline">Original</Badge>;
    }
    return <Badge variant="secondary">v{version.version_number}</Badge>;
  };

  const formatChanges = (changes) => {
    if (!changes || changes.length === 0) {
      return 'No specific changes recorded';
    }
    
    return changes.map((change, index) => (
      <div key={index} className="text-sm">
        <span className="font-medium">{change.section}:</span> {change.description}
      </div>
    ));
  };

  const getChangesSummary = (version) => {
    if (version.changes_summary) {
      return version.changes_summary;
    }
    if (version.changed_clauses && version.changed_clauses.length > 0) {
      return `Modified ${version.changed_clauses.length} clause${version.changed_clauses.length > 1 ? 's' : ''}`;
    }
    return 'Initial version';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Version History
          <Badge variant="secondary">{versions.length} versions</Badge>
        </CardTitle>
        <CardDescription>
          Track changes and restore previous versions of your contract
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedVersion?.id === version.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleVersionClick(version)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Version {version.version_number}</span>
                      {getVersionBadge(version)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>
                            Contract Version {version.version_number}
                          </DialogTitle>
                          <DialogDescription>
                            Created on {new Date(version.created_at).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="content" className="h-full">
                          <TabsList>
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="changes">Changes</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="content" className="h-full">
                            <ScrollArea className="h-96 border rounded p-4">
                              <div className="whitespace-pre-wrap text-sm">
                                {version.content}
                              </div>
                            </ScrollArea>
                          </TabsContent>
                          
                          <TabsContent value="changes" className="h-full">
                            <ScrollArea className="h-96">
                              <div className="space-y-3">
                                <div className="p-3 border rounded-lg">
                                  <h4 className="font-medium mb-2">Changes Summary</h4>
                                  <p className="text-sm text-gray-600">
                                    {getChangesSummary(version)}
                                  </p>
                                </div>
                                
                                {version.changed_clauses && version.changed_clauses.length > 0 && (
                                  <div className="p-3 border rounded-lg">
                                    <h4 className="font-medium mb-2">Modified Clauses</h4>
                                    <div className="space-y-2">
                                      {formatChanges(version.changed_clauses)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-between pt-4 border-t">
                          <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          
                          {!version.is_active && (
                            <Button onClick={() => handleRestore(version)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Restore This Version
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {!version.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(version);
                        }}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Created by {version.created_by_name || 'User'}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{new Date(version.created_at).toLocaleString()}</span>
                  </div>

                  <p className="text-sm text-gray-700">
                    {getChangesSummary(version)}
                  </p>

                  {version.changed_clauses && version.changed_clauses.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {version.changed_clauses.slice(0, 3).map((clause, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {clause.section || `Change ${idx + 1}`}
                        </Badge>
                      ))}
                      {version.changed_clauses.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{version.changed_clauses.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Version Timeline Connector */}
                {index < versions.length - 1 && (
                  <div className="flex justify-center mt-3">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {versions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500">
              <FileText className="w-12 h-12 mb-3" />
              <p className="text-sm">No version history available</p>
            </div>
          )}
        </ScrollArea>

        {versions.length > 1 && (
          <div className="flex justify-center pt-4 border-t">
            <Button variant="outline" onClick={() => setShowComparison(true)}>
              <Diff className="w-4 h-4 mr-2" />
              Compare Versions
            </Button>
          </div>
        )}
      </CardContent>

      {/* Version Comparison Dialog */}
      {showComparison && (
        <Dialog open={showComparison} onOpenChange={setShowComparison}>
          <DialogContent className="max-w-6xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Compare Contract Versions</DialogTitle>
              <DialogDescription>
                Select two versions to see the differences
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="space-y-3">
                <h4 className="font-medium">Version A</h4>
                <select 
                  className="w-full p-2 border rounded"
                  onChange={(e) => setCompareVersions(prev => ({
                    ...prev, 
                    from: versions.find(v => v.id === parseInt(e.target.value))
                  }))}
                >
                  <option value="">Select version...</option>
                  {versions.map(version => (
                    <option key={version.id} value={version.id}>
                      Version {version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {compareVersions.from && (
                  <ScrollArea className="h-96 border rounded p-4">
                    <div className="whitespace-pre-wrap text-sm">
                      {compareVersions.from.content}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Version B</h4>
                <select 
                  className="w-full p-2 border rounded"
                  onChange={(e) => setCompareVersions(prev => ({
                    ...prev, 
                    to: versions.find(v => v.id === parseInt(e.target.value))
                  }))}
                >
                  <option value="">Select version...</option>
                  {versions.map(version => (
                    <option key={version.id} value={version.id}>
                      Version {version.version_number} - {new Date(version.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {compareVersions.to && (
                  <ScrollArea className="h-96 border rounded p-4">
                    <div className="whitespace-pre-wrap text-sm">
                      {compareVersions.to.content}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}