import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Send, User, Bot, CheckCircle, HelpCircle, X, Copy, RotateCcw, Square, Plus, Save } from 'lucide-react';

export function ChatInterface({ onContractGenerate, isLoading, resumeData, onConversationUpdate, resumeSessionId }) {
  const { handleAuthError } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI legal assistant. I'll help you create a professional employment contract through a simple conversation. Let's start with the basics - what type of employment agreement are you looking to create today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [sessionData, setSessionData] = useState({
    contractType: '',
    clientName: '',
    otherPartyName: '',
    jurisdiction: 'California',
    requirements: '',
    step: 'contract_type',
    extractedParams: {}
  });
  const [isTyping, setIsTyping] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [progressIndicator, setProgressIndicator] = useState('0% complete');
  const [canForceGenerate, setCanForceGenerate] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [chatName, setChatName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef(null);

  // Intelligent AI conversation system
  const analyzeUserInput = async (userInput, conversationContext) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const response = await fetch('/api/ai/analyze-contract-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userInput,
          conversationContext,
          analysisType: 'contract_guidance'
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, trigger logout
          console.log('Authentication failed, redirecting to login');
          handleAuthError();
          return {
            nextQuestion: "Your session has expired. Please log in again to continue.",
            analysis: null,
            suggestions: [],
            missingInfo: [],
            readyToGenerate: false
          };
        }
        
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('AI Response:', result);
      return result;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return {
        nextQuestion: `I'm having trouble with the AI service (${error.message}). Could you tell me more about your employment contract needs?`,
        analysis: null,
        suggestions: [],
        missingInfo: [],
        readyToGenerate: false
      };
    }
  };

  useEffect(() => {
    // Only scroll if there's more than just the initial message or if user has sent messages
    if (messages.length > 1 || (messages.length === 1 && messages[0].sender === 'user')) {
      // Add a small delay to prevent jarring immediate scroll on component mount
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  // Send conversation updates to parent component
  useEffect(() => {
    if (onConversationUpdate && hasLoadedSession) {
      const conversationState = {
        extractedParams: sessionData.extractedParams,
        progressIndicator: progressIndicator,
        canGenerate: canForceGenerate,
        messageCount: messages.length,
        jurisdiction: sessionData.jurisdiction,
        contractType: sessionData.contractType || 'Employment Agreement'
      };
      onConversationUpdate(conversationState);
    }
  }, [sessionData, progressIndicator, canForceGenerate, messages.length, hasLoadedSession, onConversationUpdate]);

  // Load chat session on component mount - prioritize resumeData if provided
  useEffect(() => {
    const loadSession = async () => {
      if (hasLoadedSession) return;

      try {
        // If resumeData is provided, restore that specific conversation
        if (resumeData) {
          console.log('Resuming conversation from resumeData:', resumeData);

          // Check if resumeData actually has conversation data
          const hasMessages = resumeData.messages && resumeData.messages.length > 1; // More than just the initial bot message

          if (hasMessages) {
            // Restore full conversation state from resumeData
            setMessages(resumeData.messages);

            if (resumeData.extractedParams) {
              setSessionData(prev => ({
                ...prev,
                extractedParams: resumeData.extractedParams
              }));
            }

            // Restore progress and generation state
            if (resumeData.progressIndicator) {
              setProgressIndicator(resumeData.progressIndicator);
            } else {
              setProgressIndicator('60% complete'); // Default if not provided
            }

            if (resumeData.canForceGenerate !== undefined) {
              setCanForceGenerate(resumeData.canForceGenerate);
            } else {
              setCanForceGenerate(true); // Enable generation since we're resuming
            }

            // Try to find the session ID from the most recent session
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ai/chat/recent', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.sessions && data.sessions.length > 0) {
                setCurrentSessionId(data.sessions[0].id);
              }
            }

            console.log('Successfully resumed conversation from contract result page with', resumeData.messages.length, 'messages');
            setHasLoadedSession(true);
            return;
          } else {
            // resumeData exists but has no actual conversation - treat as fresh start
            console.log('resumeData provided but no conversation history found - starting fresh');
            // Fall through to load most recent session
          }
        }

        if (resumeSessionId) {
          const token = localStorage.getItem('token');
          const sessionResponse = await fetch(`/api/ai/chat/${resumeSessionId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (sessionResponse.ok) {
            const data = await sessionResponse.json();
            if (data.session && data.session.conversationState) {
              const conversationState = data.session.conversationState;
              setCurrentSessionId(data.session.id);

              if (conversationState.messages) {
                setMessages(conversationState.messages);
              }
              if (conversationState.sessionData) {
                setSessionData(conversationState.sessionData);
              }
              if (conversationState.progressIndicator) {
                setProgressIndicator(conversationState.progressIndicator);
              }
              if (conversationState.canForceGenerate !== undefined) {
                setCanForceGenerate(conversationState.canForceGenerate);
              }

              console.log('Resumed chat session from dashboard:', resumeSessionId);
              setHasLoadedSession(true);
              return;
            }
          }
        }

        // Otherwise, load most recent session as before
        const token = localStorage.getItem('token');
        const response = await fetch('/api/ai/chat/recent', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.sessions && data.sessions.length > 0) {
            const recentSession = data.sessions[0];
            const sessionId = recentSession.id;

            // Load the session details
            const sessionResponse = await fetch(`/api/ai/chat/${sessionId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json();
              if (sessionData.session && sessionData.session.conversation_state) {
                const conversationState = sessionData.session.conversation_state;

                // Restore conversation state
                setCurrentSessionId(sessionId);
                if (conversationState.messages) {
                  setMessages(conversationState.messages);
                }
                if (conversationState.sessionData) {
                  setSessionData(conversationState.sessionData);
                }
                if (conversationState.progressIndicator) {
                  setProgressIndicator(conversationState.progressIndicator);
                }
                if (conversationState.canForceGenerate !== undefined) {
                  setCanForceGenerate(conversationState.canForceGenerate);
                }

                console.log('Loaded existing chat session:', sessionId);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load chat session:', error);
        // Continue with fresh session if loading fails
      } finally {
        setHasLoadedSession(true);
      }
    };

    loadSession();
  }, [hasLoadedSession, resumeData, resumeSessionId]);

  // Save conversation state to backend
  const saveConversationState = async () => {
    if (!currentSessionId) return;

    try {
      const token = localStorage.getItem('token');
      const conversationState = {
        messages,
        sessionData,
        progressIndicator,
        canForceGenerate
      };
      
      await fetch('/api/ai/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: '', // Empty message for state update only
          conversationState
        })
      });
    } catch (error) {
      console.error('Failed to save conversation state:', error);
    }
  };

  const handleSaveChat = async () => {
    if (!currentSessionId) {
      alert('No active chat to save yet.');
      return;
    }

    if (!chatName.trim()) {
      alert('Please enter a name for this chat');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          name: chatName.trim()
        })
      });

      if (response.ok) {
        alert('Chat saved successfully!');
        setShowSaveDialog(false);
        setChatName('');
      } else {
        alert('Failed to save chat');
      }
    } catch (error) {
      alert('Failed to save chat');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save conversation state when it changes
  useEffect(() => {
    if (hasLoadedSession && currentSessionId && messages.length > 1) {
      const timeoutId = setTimeout(() => {
        saveConversationState();
      }, 1000); // Debounce saves by 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages, sessionData, progressIndicator, canForceGenerate, hasLoadedSession, currentSessionId]);

  // Start a new chat conversation
  const handleNewChat = () => {
    // Reset all conversation state
    setMessages([
      {
        id: Date.now(), // Use timestamp for unique ID
        type: 'bot',
        content: "Hi! I'm your AI legal assistant. I'll help you create a professional employment contract through a simple conversation. Let's start with the basics - what type of employment agreement are you looking to create today?",
        timestamp: new Date()
      }
    ]);
    
    // Reset session data to initial state
    setSessionData({
      contractType: '',
      clientName: '',
      otherPartyName: '',
      jurisdiction: 'California',
      requirements: '',
      step: 'contract_type',
      extractedParams: {}
    });
    
    // Clear current session and reset UI state
    setCurrentSessionId(null);
    setProgressIndicator('0% complete');
    setCanForceGenerate(false);
    setIsTyping(false);
    setInput('');
    setShowSaveDialog(false);
    setChatName('');
    setIsSaving(false);

    console.log('New chat conversation started - all state reset');
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  // Master Input Brief Framework - Comprehensive Parameter Extraction
  const extractParametersFromConversation = (conversationText, existingParams = {}) => {
    const params = { ...existingParams };
    const text = conversationText.toLowerCase();
    const originalText = conversationText;
    
    console.log('Processing conversation for parameter extraction:', text.substring(0, 200) + '...');
    
    // CORE EMPLOYMENT DETAILS
    // Extract salary/compensation with multiple formats
    const salaryPatterns = [
      /\$(\d{2,3}),?(\d{3})(?:\s*(?:per|\/)\s*year|annually)?/gi,
      /\$(\d{2,3})k(?:\s*(?:per|\/)\s*year|annually)?/gi,
      /(\d{2,3})k(?:\s*(?:per|\/)\s*year|annually)?/gi,
      /\$(\d{4,6})(?:\s*(?:per|\/)\s*year|annually)?/gi,
      /salary.*?\$(\d{2,3}),?(\d{3})/gi,
      /pay.*?\$(\d{2,3}),?(\d{3})/gi
    ];
    
    for (const pattern of salaryPatterns) {
      const matches = [...originalText.matchAll(pattern)];
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        let salary;
        if (lastMatch[0].includes('k')) {
          salary = parseInt(lastMatch[1] || lastMatch[0].replace(/[^0-9]/g, '')) * 1000;
        } else if (lastMatch[2]) {
          salary = parseInt(lastMatch[1] + lastMatch[2]);
        } else {
          salary = parseInt(lastMatch[1] || lastMatch[0].replace(/[^0-9]/g, ''));
        }
        
        if (salary > 30000) {
          params['Annual Salary'] = `$${salary.toLocaleString()}`;
          params['Salary Amount'] = salary.toString();
          console.log('Extracted salary:', salary);
          break;
        }
      }
    }
    
    // Extract hourly wages
    const hourlyMatch = text.match(/(\d+)(?:\.\d{2})?\s*(?:per|\/)\s*hour|\$(\d+)(?:\.\d{2})?\s*(?:\/hr|hourly)/gi);
    if (hourlyMatch && !params['Annual Salary']) {
      const hourlyRate = parseFloat(hourlyMatch[0].replace(/[^0-9.]/g, ''));
      if (hourlyRate > 15) {
        params['Hourly Rate'] = `$${hourlyRate}/hour`;
        params['Annual Salary'] = `$${Math.round(hourlyRate * 40 * 52).toLocaleString()} (estimated from hourly)`;
      }
    }
    
    // Extract job titles with comprehensive patterns
    const jobTitlePatterns = [
      /(?:position|role|title|job)\s*:?\s*([A-Za-z\s&-]+?)(?:\s|$|,|\.)/gi,
      /(?:as|for)\s+(?:a|an)?\s*([A-Za-z\s&-]+?)\s+(?:position|role)/gi,
      /hire.*?(?:as|for)\s+(?:a|an)?\s*([A-Za-z\s&-]+)/gi,
      /software\s+(?:developer|engineer)/gi,
      /senior\s+[A-Za-z\s]+/gi,
      /lead\s+[A-Za-z\s]+/gi,
      /(?:product|project|engineering|marketing|sales|hr|human resources)\s+manager/gi
    ];
    
    for (const pattern of jobTitlePatterns) {
      const match = originalText.match(pattern);
      if (match) {
        let title = match[1] || match[0];
        title = title.replace(/^(as|for|a|an)\s+/gi, '').trim();
        if (title.length > 3 && title.length < 50) {
          params['Job Title'] = title;
          console.log('Extracted job title:', title);
          break;
        }
      }
    }
    
    // Extract company information
    const companyPatterns = [
      /(?:company|organization|employer)\s*:?\s*([A-Z][a-zA-Z\s&,.-]+?)(?:\s|$|,|\.)/gi,
      /(?:at|for|with)\s+([A-Z][a-zA-Z\s&,.-]+?)(?:\s+(?:company|corp|inc|llc)|$)/gi,
      /work\s+(?:at|for)\s+([A-Z][a-zA-Z\s&,.-]+)/gi
    ];
    
    for (const pattern of companyPatterns) {
      const match = originalText.match(pattern);
      if (match && match[1]) {
        const company = match[1].trim().replace(/\s+/g, ' ');
        if (company.length > 2 && company.length < 50 && !company.match(/^(the|a|an)$/i)) {
          params['Company Name'] = company;
          params['Client Name'] = company;
          console.log('Extracted company:', company);
          break;
        }
      }
    }
    
    // Extract employee name
    const namePatterns = [
      /(?:employee|candidate|hire)\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
      /(?:hiring|for)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
      /name\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi
    ];
    
    for (const pattern of namePatterns) {
      const match = originalText.match(pattern);
      if (match && match[1]) {
        params['Employee Name'] = match[1].trim();
        params['Other Party Name'] = match[1].trim();
        console.log('Extracted employee name:', match[1]);
        break;
      }
    }
    
    // WORK ARRANGEMENT & LOCATION
    if (text.includes('remote') && !text.includes('no remote')) {
      if (text.includes('fully remote') || text.includes('100% remote')) {
        params['Work Arrangement'] = 'Fully remote work arrangement';
      } else {
        params['Work Arrangement'] = 'Remote work allowed';
      }
    } else if (text.includes('hybrid')) {
      params['Work Arrangement'] = 'Hybrid work arrangement (office + remote)';
    } else if (text.includes('office') || text.includes('on-site')) {
      params['Work Arrangement'] = 'On-site office-based work';
    }
    
    // Extract specific work location
    const locationMatch = originalText.match(/(?:located?|based)\s+in\s+([A-Za-z\s,]+?)(?:\s|$|,|\.)/gi);
    if (locationMatch) {
      params['Work Location'] = locationMatch[0].replace(/^(located?|based)\s+in\s+/gi, '').trim();
    }
    
    // BENEFITS & COMPENSATION DETAILS
    
    // Health insurance details
    if (text.includes('health') && (text.includes('insurance') || text.includes('benefits'))) {
      if (text.includes('full') || text.includes('100%')) {
        params['Health Insurance'] = 'Full health insurance coverage provided';
      } else if (text.includes('partial') || text.includes('%')) {
        const percentMatch = text.match(/(\d+)%.*health/gi);
        if (percentMatch) {
          params['Health Insurance'] = `${percentMatch[1]}% health insurance coverage`;
        } else {
          params['Health Insurance'] = 'Partial health insurance coverage';
        }
      } else {
        params['Health Insurance'] = 'Health insurance benefits included';
      }
    }
    
    // Dental and vision
    if (text.includes('dental')) {
      params['Dental Insurance'] = 'Dental insurance coverage included';
    }
    if (text.includes('vision')) {
      params['Vision Insurance'] = 'Vision insurance coverage included';
    }
    
    // 401k and retirement
    if (text.includes('401k') || text.includes('retirement')) {
      const matchPercent = text.match(/(\d+)%.*(?:match|401k|retirement)/gi);
      if (matchPercent) {
        params['Retirement Benefits'] = `401(k) with ${matchPercent[1]}% company match`;
      } else {
        params['Retirement Benefits'] = '401(k) retirement plan available';
      }
    }
    
    // PTO/Vacation detailed extraction
    const ptoPatterns = [
      /(\d+)\s+days?\s+(?:of\s+)?(?:pto|paid time off|vacation)/gi,
      /(\d+)\s+weeks?\s+(?:of\s+)?(?:vacation|pto)/gi,
      /vacation\s*:?\s*(\d+)\s+(?:days?|weeks?)/gi
    ];
    
    for (const pattern of ptoPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = match[1];
        if (match[0].includes('week')) {
          params['PTO Policy'] = `${amount} weeks paid time off annually`;
          params['Annual PTO Days'] = (parseInt(amount) * 5).toString();
        } else {
          params['PTO Policy'] = `${amount} days paid time off annually`;
          params['Annual PTO Days'] = amount;
        }
        console.log('Extracted PTO:', params['PTO Policy']);
        break;
      }
    }
    
    // Sick leave
    const sickLeaveMatch = text.match(/(\d+)\s+(?:days?|hours?)\s+(?:of\s+)?sick\s+(?:leave|time)/gi);
    if (sickLeaveMatch) {
      params['Sick Leave'] = sickLeaveMatch[0];
    }
    
    // EMPLOYMENT TERMS & CONDITIONS
    
    // Probation period with multiple formats
    const probationPatterns = [
      /(\d+)[-\s]?(?:day|month)\s+probation/gi,
      /probation[ary]*\s+period[\s:]*\s*(\d+)\s*(?:days?|months?)/gi,
      /(\d+)\s*(?:days?|months?)\s*probation/gi
    ];
    
    for (const pattern of probationPatterns) {
      const match = text.match(pattern);
      if (match) {
        const period = match[1];
        const unit = match[0].includes('month') ? 'months' : 'days';
        params['Probation Period'] = `${period} ${unit} probationary period`;
        params['Probationary Period Length'] = `${period} ${unit}`;
        console.log('Extracted probation:', params['Probation Period']);
        break;
      }
    }
    
    // Performance review schedule
    if (text.includes('review') && (text.includes('annual') || text.includes('yearly'))) {
      params['Performance Reviews'] = 'Annual performance reviews';
    } else if (text.includes('review') && (text.includes('quarterly') || text.includes('90 day'))) {
      params['Performance Reviews'] = 'Quarterly performance reviews';
    } else if (text.includes('review') && text.includes('monthly')) {
      params['Performance Reviews'] = 'Monthly performance reviews';
    }
    
    // EQUITY & STOCK OPTIONS
    if (text.includes('equity') || text.includes('stock options') || text.includes('shares')) {
      const equityPatterns = [
        /(\d+(?:,\d{3})*)\s+(?:shares|stock options|equity)/gi,
        /(\d+\.\d+)%\s+equity/gi,
        /equity\s*:?\s*(\d+(?:,\d{3})*|\d+\.\d+%)/gi
      ];
      
      for (const pattern of equityPatterns) {
        const match = text.match(pattern);
        if (match) {
          params['Equity Compensation'] = match[0];
          console.log('Extracted equity:', match[0]);
          break;
        }
      }
      
      // Vesting schedule
      if (text.includes('vest') || text.includes('cliff')) {
        const vestMatch = text.match(/(\d+)\s*year\s*(?:cliff|vesting)/gi);
        if (vestMatch) {
          params['Vesting Schedule'] = vestMatch[0];
        } else {
          params['Vesting Schedule'] = 'Standard vesting schedule applies';
        }
      }
    }
    
    // TERMINATION & SEVERANCE
    const severancePatterns = [
      /(\d+)\s+(?:weeks?|months?)\s+severance/gi,
      /severance\s*:?\s*(\d+)\s*(?:weeks?|months?)/gi
    ];
    
    for (const pattern of severancePatterns) {
      const match = text.match(pattern);
      if (match) {
        params['Severance Policy'] = match[0];
        console.log('Extracted severance:', match[0]);
        break;
      }
    }
    
    // Notice period
    const noticePatterns = [
      /(\d+)\s+(?:weeks?|days?)\s+notice/gi,
      /notice\s+period\s*:?\s*(\d+)\s*(?:weeks?|days?)/gi,
      /(\d+)[-\s]?(?:week|day)\s+notice/gi
    ];
    
    for (const pattern of noticePatterns) {
      const match = text.match(pattern);
      if (match) {
        params['Notice Period'] = match[0];
        break;
      }
    }
    
    // CONFIDENTIALITY & IP
    if (text.includes('confidential') || text.includes('nda') || text.includes('non-disclosure')) {
      params['Confidentiality'] = 'Confidentiality and non-disclosure provisions included';
      
      // Duration of confidentiality
      const confDurationMatch = text.match(/(\d+)\s*years?\s*(?:after|post|following).*(?:termination|confidential)/gi);
      if (confDurationMatch) {
        params['Confidentiality Duration'] = confDurationMatch[0];
      }
    }
    
    // IP assignment
    if (text.includes('intellectual property') || text.includes('ip assignment') || text.includes('inventions')) {
      params['IP Assignment'] = 'Intellectual property assignment clause included';
    }
    
    // NON-COMPETE & NON-SOLICIT
    if (text.includes('non-compete') || text.includes('noncompete')) {
      const nonCompeteMatch = text.match(/(\d+)\s*(?:years?|months?)\s*non[- ]?compete/gi);
      if (nonCompeteMatch) {
        params['Non-Compete Period'] = nonCompeteMatch[0];
      } else {
        params['Non-Compete'] = 'Non-compete restrictions apply';
      }
    }
    
    if (text.includes('non-solicit') || text.includes('nonsolicitation')) {
      const nonSolicitMatch = text.match(/(\d+)\s*(?:years?|months?)\s*non[- ]?solicit/gi);
      if (nonSolicitMatch) {
        params['Non-Solicitation Period'] = nonSolicitMatch[0];
      } else {
        params['Non-Solicitation'] = 'Non-solicitation restrictions apply';
      }
    }
    
    // EXPENSE REIMBURSEMENT
    if (text.includes('expense') && (text.includes('reimburse') || text.includes('reimbursement'))) {
      const expenseMatch = text.match(/(\d+)\s*days?\s*(?:for\s+)?(?:expense\s+)?reimbursement/gi);
      if (expenseMatch) {
        params['Expense Reimbursement'] = `Expenses reimbursed within ${expenseMatch[1]} days`;
      } else {
        params['Expense Reimbursement'] = 'Business expense reimbursement provided';
      }
    }
    
    // BONUS STRUCTURE
    const bonusPatterns = [
      /(\d+)%\s*(?:annual\s+)?bonus/gi,
      /bonus\s*:?\s*\$(\d+(?:,\d{3})*)/gi,
      /\$(\d+(?:,\d{3})*)\s*(?:annual\s+)?bonus/gi
    ];
    
    for (const pattern of bonusPatterns) {
      const match = text.match(pattern);
      if (match) {
        params['Bonus Structure'] = match[0];
        console.log('Extracted bonus:', match[0]);
        break;
      }
    }
    
    // JURISDICTION & GOVERNING LAW
    const jurisdictionMatch = originalText.match(/(?:california|ca|new york|ny|texas|tx|florida|fl)\s+law/gi);
    if (jurisdictionMatch) {
      params['Governing Law'] = jurisdictionMatch[0];
    } else if (!params['Governing Law']) {
      params['Governing Law'] = 'California';
    }
    
    // START DATE
    const startDatePatterns = [
      /start(?:ing)?\s+(?:date|on)?\s*:?\s*([A-Za-z]+ \d{1,2},? \d{4})/gi,
      /begin(?:ning)?\s+([A-Za-z]+ \d{1,2},? \d{4})/gi,
      /effective\s+([A-Za-z]+ \d{1,2},? \d{4})/gi
    ];
    
    for (const pattern of startDatePatterns) {
      const match = originalText.match(pattern);
      if (match) {
        params['Start Date'] = match[1];
        break;
      }
    }
    
    // REPORTING STRUCTURE
    const reportsToMatch = originalText.match(/reports?\s+to\s+([A-Za-z\s,]+?)(?:\s|$|,|\.)/gi);
    if (reportsToMatch) {
      params['Reports To'] = reportsToMatch[0].replace(/^reports?\s+to\s+/gi, '').trim();
    }
    
    // WORK SCHEDULE
    if (text.includes('full time') || text.includes('full-time')) {
      params['Employment Type'] = 'Full-time';
    } else if (text.includes('part time') || text.includes('part-time')) {
      params['Employment Type'] = 'Part-time';
    } else if (text.includes('contract') || text.includes('contractor')) {
      params['Employment Type'] = 'Contract';
    }
    
    // Work hours
    const hoursMatch = text.match(/(\d+)\s*hours?\s*(?:per\s+)?week/gi);
    if (hoursMatch) {
      params['Work Hours'] = hoursMatch[0];
    }
    
    console.log('Master Input Brief - Final extracted parameters:', params);
    return params;
  };

  const addMessage = (type, content) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = async (response) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
    addMessage('bot', response);
  };

  const processUserInput = async (userInput) => {
    setIsTyping(true);
    
    try {
      // Build conversation context
      const conversationContext = {
        messages: messages,
        extractedParams: sessionData.extractedParams,
        contractType: 'employment_agreement',
        jurisdiction: sessionData.jurisdiction
      };

      // Get AI analysis and next steps
      const aiResponse = await analyzeUserInput(userInput, conversationContext);
      
      // Update session data with any extracted information
      const updatedSessionData = {
        ...sessionData,
        extractedParams: {
          ...sessionData.extractedParams,
          ...aiResponse.extractedInfo
        }
      };
      setSessionData(updatedSessionData);

      // Update progress indicator if available
      if (aiResponse.progressIndicator) {
        console.log('Updating progress indicator:', aiResponse.progressIndicator);
        setProgressIndicator(aiResponse.progressIndicator);
      } else {
        // Calculate progress based on conversation length and extracted info
        const baseProgress = Math.min(70, Math.max(5, (messages.length / 12) * 70));
        const parameterBonus = Math.min(20, Object.keys(sessionData.extractedParams).length * 5);
        const progressValue = Math.round(baseProgress + parameterBonus);
        const calculatedProgress = `${progressValue}% complete`;
        console.log('Calculated progress indicator:', calculatedProgress);
        setProgressIndicator(calculatedProgress);
      }
      
      // Enable force generation if conversation has progressed enough
      const progressValue = parseInt((aiResponse.progressIndicator || progressIndicator)?.replace(/[^0-9]/g, '') || '0');
      const shouldEnableGenerate = progressValue >= 30 || messages.length >= 4 || Object.keys(sessionData.extractedParams).length >= 2;
      console.log('Should enable generate:', shouldEnableGenerate, 'Progress:', progressValue, 'Messages:', messages.length, 'Params:', Object.keys(sessionData.extractedParams).length);
      setCanForceGenerate(shouldEnableGenerate);

      setIsTyping(false);

      // If AI suggests contract is ready to generate
      if (aiResponse.readyToGenerate && aiResponse.contractParams) {
        addMessage('bot', "Perfect! I have all the information needed to create your professional employment contract. Let me generate it now with all the details we've discussed, including the specific clauses and protections we identified.");

        // Generate contract with AI-extracted parameters and FULL conversation history
        const contractParams = {
          contractType: "employment_agreement",
          parameters: aiResponse.contractParams,
          preferences: {
            risk_tolerance: aiResponse.recommendedRiskLevel || 'moderate',
            legal_stance: aiResponse.recommendedStance || 'neutral'
          },
          conversationalData: {
            ...updatedSessionData,
            messages: messages, // Include full message history for resume functionality
            progressIndicator: progressIndicator,
            canForceGenerate: canForceGenerate
          },
          aiAnalysis: aiResponse.analysis,
          suggestedClauses: aiResponse.suggestedClauses,
          generationMethod: "conversational_ai" // Mark as AI chat generated
        };

        onContractGenerate(contractParams);
      } else {
        // Continue intelligent conversation
        let responseMessage = aiResponse.nextQuestion;
        
        // Add suggestions if AI identified any
        if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
          responseMessage += "\n\n💡 **Suggestions based on your requirements:**\n";
          aiResponse.suggestions.forEach((suggestion, index) => {
            responseMessage += `• ${suggestion}\n`;
          });
        }

        addMessage('bot', responseMessage);
      }
      
    } catch (error) {
      setIsTyping(false);
      console.error('Error processing user input:', error);
      addMessage('bot', "I apologize, but I'm having trouble processing your request. Could you please rephrase your requirements?");
    }
  };

  // Copy message to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard:', text.substring(0, 50) + '...');
    } catch (err) {
      console.error('Failed to copy text:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('Copied using fallback method');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
    }
  };

  // Regenerate the last bot response
  const regenerateResponse = async (messageIndex) => {
    // Find the user message that prompted this bot response
    const userMessage = messages[messageIndex - 1];
    if (userMessage && userMessage.type === 'user') {
      // Remove the bot message and regenerate
      const newMessages = messages.slice(0, messageIndex);
      setMessages(newMessages);
      await processUserInput(userMessage.content);
    }
  };

  // Stop current AI generation
  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsTyping(false);
    
    // Add stop message only if there's no existing bot message in progress
    // This prevents the message vanishing issue
    setTimeout(() => {
      if (!isTyping) {
        addMessage('bot', "Generation stopped. How can I help you continue with your contract?");
      }
    }, 100);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');

    // Create a new session if we don't have one
    if (!currentSessionId && hasLoadedSession) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/ai/chat/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            contractType: 'employment_agreement'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentSessionId(data.sessionId);
        }
      } catch (error) {
        console.error('Failed to create new chat session:', error);
      }
    }

    await processUserInput(userMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleForceGenerate = async () => {
    if (!canForceGenerate) return;
    
    addMessage('user', 'Generate contract now');
    setIsTyping(true);
    
    try {
      // Build conversation context
      const conversationContext = {
        messages: messages,
        extractedParams: sessionData.extractedParams,
        contractType: 'employment_agreement',
        jurisdiction: sessionData.jurisdiction
      };

      // Force generation by sending "generate" command
      const aiResponse = await analyzeUserInput('generate contract now', conversationContext);
      
      setIsTyping(false);

      if (aiResponse.readyToGenerate && aiResponse.contractParams) {
        addMessage('bot', "Perfect! I'll generate your employment contract now with all the information we've gathered.");

        const contractParams = {
          contractType: "employment_agreement",
          parameters: aiResponse.contractParams,
          preferences: {
            risk_tolerance: aiResponse.recommendedRiskLevel || 'moderate',
            legal_stance: aiResponse.recommendedStance || 'neutral'
          },
          conversationalData: {
            ...sessionData,
            messages: messages, // Include full message history
            progressIndicator: progressIndicator,
            canForceGenerate: canForceGenerate
          },
          aiAnalysis: aiResponse.analysis,
          suggestedClauses: aiResponse.suggestedClauses,
          generationMethod: "conversational_ai"
        };

        onContractGenerate(contractParams);
      } else {
        addMessage('bot', "I'm working on generating your contract now. Let me create it with the information we've discussed so far.");
        
        // Extract parameters from conversation messages
        const conversationText = messages.map(m => m.content).join(' ');
        const extractedParams = extractParametersFromConversation(conversationText, sessionData.extractedParams);
        
        // Force generation with extracted parameters
        const contractParams = {
          contractType: "employment_agreement",
          parameters: extractedParams,
          preferences: {
            risk_tolerance: 'moderate',
            legal_stance: 'neutral'
          },
          conversationalData: {
            ...sessionData,
            extractedParams: extractedParams,
            conversationSummary: conversationText,
            messages: messages, // Include full message history
            progressIndicator: progressIndicator,
            canForceGenerate: canForceGenerate
          },
          aiAnalysis: "Force generated by user request",
          suggestedClauses: [],
          generationMethod: "conversational_ai" // Mark as AI chat generated
        };

        console.log('Force generating with parameters:', contractParams);
        onContractGenerate(contractParams);
      }
      
    } catch (error) {
      setIsTyping(false);
      console.error('Force generation error:', error);
      addMessage('bot', "I'll generate the contract with the information we have. Let me create it now.");
      
      // Fallback generation with comprehensive parameters
      const conversationText = messages.map(m => m.content).join(' ');
      const fallbackParams = extractParametersFromConversation(conversationText, sessionData.extractedParams);
      
      const contractParams = {
        contractType: "employment_agreement",
        parameters: {
          ...fallbackParams,
          'State': 'California',
          'Governing Law': 'California',
          'Jurisdiction': 'California'
        },
        preferences: { risk_tolerance: 'moderate', legal_stance: 'neutral' },
        conversationalData: {
          ...sessionData,
          conversationSummary: conversationText,
          extractedParams: fallbackParams,
          messages: messages, // Include full message history
          progressIndicator: progressIndicator,
          canForceGenerate: canForceGenerate
        },
        generationMethod: "conversational_ai"
      };

      onContractGenerate(contractParams);
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { id: 'contract_type', label: 'Contract Type', completed: !!sessionData.contractType },
      { id: 'client_name', label: 'Your Info', completed: !!sessionData.clientName },
      { id: 'employee_name', label: 'Employee Info', completed: !!sessionData.otherPartyName },
      { id: 'requirements', label: 'Position Details', completed: !!sessionData.requirements },
      { id: 'complete', label: 'Generate', completed: sessionData.step === 'complete' }
    ];
    return steps;
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI Contract Assistant
            <Badge variant="secondary">Pro Feature</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNewChat}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              className="text-purple-600 border-purple-200"
              disabled={messages.length <= 1 || !currentSessionId}
            >
              <Save className="w-4 h-4 mr-1" />
              Save Chat
            </Button>
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save AI Chat Session</DialogTitle>
                  <DialogDescription>
                    Give this conversation a name to find it later
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    placeholder="e.g., Software Engineer Contract - Acme Corp"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveChat();
                      }
                    }}
                  />
                  <Button onClick={handleSaveChat} disabled={isSaving} className="w-full">
                    {isSaving ? 'Saving...' : 'Save Chat'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showHelp} onOpenChange={setShowHelp}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">
                  <HelpCircle className="w-4 h-4 mr-1" />
                  How it works
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  🤖 Intelligent AI Legal Assistant
                </DialogTitle>
              </DialogHeader>
              <div className="text-sm space-y-3">
                <div className="space-y-2">
                  <p>• <strong>Describe your needs:</strong> Tell me about your employment contract requirements in natural language</p>
                  <p>• <strong>Expert analysis:</strong> I'll analyze what you've provided and identify gaps, risks, and opportunities</p>
                  <p>• <strong>Smart suggestions:</strong> I'll recommend specific clauses, protections, and legal considerations you might miss</p>
                  <p>• <strong>Compliance guidance:</strong> I'll ensure your contract meets legal standards and best practices</p>
                  <p>• <strong>Professional polish:</strong> Final contract includes expert legal language and formatting</p>
                </div>
                <div className="p-3 bg-blue-50 rounded border">
                  <p className="text-sm font-medium text-blue-800 mb-2">Example conversation:</p>
                  <p className="text-sm text-blue-700">
                    <strong>You:</strong> "I need a software developer contract for $85k with remote work."<br/>
                    <strong>AI:</strong> "Great start! I notice you haven't mentioned IP assignment, non-compete terms, or confidentiality clauses. For a software role, I'd recommend..."
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Let's create your employment contract through conversation</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {progressIndicator}
            </Badge>
            {canForceGenerate && (
              <Button 
                onClick={handleForceGenerate}
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isTyping}
              >
                Generate Now
              </Button>
            )}
          </div>
        </CardDescription>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {getProgressSteps().map((step, index) => (
            <div key={step.id} className="flex items-center gap-1">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                step.completed 
                  ? 'bg-green-100 text-green-800' 
                  : sessionData.step === step.id 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-current" />
                )}
                {step.label}
              </div>
              {index < getProgressSteps().length - 1 && (
                <div className="w-2 h-px bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        <ScrollArea className="flex-1 h-0">
          <div className="space-y-4 pr-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3 mb-4">
                {message.type === 'bot' ? (
                  <>
                    {/* Bot avatar on left */}
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    {/* Bot message */}
                    <div style={{ maxWidth: '280px' }} className="group">
                      <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        <p className="text-sm" style={{ 
                          wordBreak: 'break-word', 
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-1 text-gray-500 hover:text-gray-700"
                              onClick={() => copyToClipboard(message.content)}
                              title="Copy message"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-1 text-gray-500 hover:text-gray-700"
                              onClick={() => regenerateResponse(messages.findIndex(m => m.id === message.id))}
                              title="Regenerate response"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Spacer to push user message to right */}
                    <div className="flex-1"></div>
                    {/* User message */}
                    <div style={{ maxWidth: '280px' }}>
                      <div className="px-4 py-2 rounded-lg bg-blue-600 text-white" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        <p className="text-sm" style={{ 
                          wordBreak: 'break-word', 
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {message.content}
                        </p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    {/* User avatar on right */}
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  </>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-1 text-gray-500 hover:text-red-600"
                    onClick={stopGeneration}
                    title="Stop generation"
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div ref={scrollRef} />
        </ScrollArea>

        <div className="flex gap-2 mt-4 flex-shrink-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            disabled={isLoading || sessionData.step === 'complete'}
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading || sessionData.step === 'complete'}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
