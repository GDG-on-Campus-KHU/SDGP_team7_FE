import React, { useRef, useEffect } from 'react';
import { useConversation } from '../context/ConversationContext';

interface DialogHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  maxItems?: number;
}

const DialogHistory: React.FC<DialogHistoryProps> = ({ isOpen, onClose, maxItems }) => {
  const { dialogHistory } = useConversation();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle clicking outside the modal to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // If maxItems is specified, only show the last N items
  const displayedHistory = maxItems
    ? dialogHistory.slice(-maxItems)
    : dialogHistory;

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 backdrop-blur-xs bg-transparent"
        onClick={onClose}
      ></div>
      <div
        ref={modalRef}
        className="bg-white rounded-t-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col relative z-10"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">대화 기록</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            닫기
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {displayedHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">대화 기록이 없습니다</p>
          ) : (
            <div className="flex flex-col gap-2">
              {displayedHistory.map((message, index) => {
                const isUserMessage = message.startsWith('나: ');
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${isUserMessage
                        ? 'bg-blue-100 border border-blue-200 ml-8'
                        : 'bg-gray-100 border border-gray-200 mr-8'
                      }`}
                  >
                    {message}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DialogHistory; 