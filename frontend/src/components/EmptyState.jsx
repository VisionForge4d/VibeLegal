import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  MessageCircle, 
  FolderOpen, 
  Wand2, 
  Search,
  History,
  Plus,
  Sparkles
} from 'lucide-react';

export function EmptyState({ 
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'contracts':
        return {
          icon: FileText,
          title: title || 'No Contracts Yet',
          description: description || 'Start creating professional employment contracts with our AI-powered tools.',
          actionLabel: actionLabel || 'Create Your First Contract',
          actionIcon: Wand2,
          secondaryActionLabel: 'View Templates',
          illustration: '📄'
        };
      
      case 'chat-history':
        return {
          icon: MessageCircle,
          title: title || 'No Conversation History',
          description: description || 'Start a conversation with our AI to create personalized contracts.',
          actionLabel: actionLabel || 'Start New Chat',
          actionIcon: MessageCircle,
          illustration: '💬'
        };
        
      case 'search-results':
        return {
          icon: Search,
          title: title || 'No Results Found',
          description: description || 'Try adjusting your search terms or filters.',
          actionLabel: actionLabel || 'Clear Filters',
          actionIcon: Search,
          illustration: '🔍'
        };
        
      case 'versions':
        return {
          icon: History,
          title: title || 'No Version History',
          description: description || 'Generate a contract first to see version history and track changes.',
          actionLabel: actionLabel || 'Create Contract',
          actionIcon: Wand2,
          illustration: '📋'
        };
        
      case 'templates':
        return {
          icon: FolderOpen,
          title: title || 'No Templates Available',
          description: description || 'Templates will help you get started faster.',
          actionLabel: actionLabel || 'Browse Library',
          actionIcon: FolderOpen,
          illustration: '📁'
        };

      case 'beta-feature':
        return {
          icon: Sparkles,
          title: title || 'Feature Coming Soon',
          description: description || 'This feature is part of our beta program and will be available soon.',
          actionLabel: actionLabel || 'Learn More',
          actionIcon: Sparkles,
          illustration: '🚀'
        };
        
      default:
        return {
          icon: FolderOpen,
          title: title || 'Nothing Here Yet',
          description: description || 'Get started by creating your first item.',
          actionLabel: actionLabel || 'Get Started',
          actionIcon: ActionIcon,
          illustration: '📂'
        };
    }
  };

  const config = getEmptyStateConfig();
  const IconComponent = config.icon;

  return (
    <Card className={`${className}`}>
      <CardContent className="pt-12 pb-8">
        <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
          {/* Large illustration */}
          <div className="text-6xl mb-2">
            {config.illustration}
          </div>
          
          {/* Icon and text */}
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-gray-500" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {config.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {config.description}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            {onAction && (
              <Button onClick={onAction} className="flex-1">
                <config.actionIcon className="w-4 h-4 mr-2" />
                {config.actionLabel}
              </Button>
            )}
            
            {(onSecondaryAction || config.secondaryActionLabel) && (
              <Button 
                variant="outline" 
                onClick={onSecondaryAction}
                className="flex-1"
              >
                {secondaryActionLabel || config.secondaryActionLabel}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized empty state components for common use cases
export function ContractsEmptyState({ onCreateContract, onViewTemplates, className }) {
  return (
    <EmptyState
      type="contracts"
      onAction={onCreateContract}
      onSecondaryAction={onViewTemplates}
      className={className}
    />
  );
}

export function ChatHistoryEmptyState({ onStartChat, className }) {
  return (
    <EmptyState
      type="chat-history"
      onAction={onStartChat}
      className={className}
    />
  );
}

export function SearchEmptyState({ onClearFilters, searchTerm, className }) {
  return (
    <EmptyState
      type="search-results"
      description={searchTerm ? `No contracts found matching "${searchTerm}". Try different keywords or clear your search.` : undefined}
      onAction={onClearFilters}
      className={className}
    />
  );
}

export function VersionHistoryEmptyState({ onCreateContract, className }) {
  return (
    <EmptyState
      type="versions"
      onAction={onCreateContract}
      className={className}
    />
  );
}

export function BetaFeatureEmptyState({ feature, onLearnMore, className }) {
  return (
    <EmptyState
      type="beta-feature"
      title={`${feature} Coming Soon`}
      description={`The ${feature} feature is currently in development. We're working hard to bring you this capability in a future update.`}
      actionLabel="Join Beta Updates"
      onAction={onLearnMore}
      className={className}
    />
  );
}

// Loading state component (not empty, but related UX pattern)
export function LoadingState({ title = 'Loading...', description, className = '' }) {
  return (
    <Card className={className}>
      <CardContent className="pt-12 pb-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="text-gray-600 mt-2">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}