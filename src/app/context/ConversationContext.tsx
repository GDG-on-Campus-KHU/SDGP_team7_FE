import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

interface ConversationContextType {
  dialogContext: string[];
  currentSentence: string[];
  initialContext: string | null;
  dialogHistory: string[];
  addToDialog: (message: string) => void;
  addToCurrentSentence: (phrase: string) => void;
  setInitialContext: (context: string) => void;
  resetCurrentSentence: () => void;
  getContextLabel: (context: string) => string;
  clearHistory: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

interface ConversationProviderProps {
  children: ReactNode;
}

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogContext, setDialogContext] = useState<string[]>([]);
  const [currentSentence, setCurrentSentence] = useState<string[]>([]);
  const [initialContext, setInitialContext] = useState<string | null>(null);
  const [dialogHistory, setDialogHistory] = useState<string[]>([]);

  const addToDialog = (message: string) => {
    setDialogHistory(prev => [...prev, message]);
  };

  const addToCurrentSentence = (phrase: string) => {
    setCurrentSentence(prev => [...prev, phrase]);
  };

  const resetCurrentSentence = () => {
    setCurrentSentence([]);
  };

  // Helper function to get Korean label for context
  const getContextLabel = (context: string): string => {
    switch (context) {
      case 'restaurant':
        return '식당';
      case 'hospital':
        return '병원';
      case 'classroom':
        return '교실';
      default:
        return '대화';
    }
  };

  const clearHistory = () => {
    setDialogHistory([]);
  };

  return (
    <ConversationContext.Provider
      value={{
        dialogContext,
        currentSentence,
        initialContext,
        dialogHistory,
        addToDialog,
        addToCurrentSentence,
        setInitialContext,
        resetCurrentSentence,
        getContextLabel,
        clearHistory
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}; 