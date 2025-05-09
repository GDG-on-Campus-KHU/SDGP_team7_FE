declare const process: {
  env: {
    NODE_ENV: string;
  };
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversation } from '../context/ConversationContext';
import { startConversation, debugStartConversation } from '../services/apiService';

// Expanded preset contexts in Korean
export const presetContexts = [
  { id: 'restaurant', name: '식당' },
  { id: 'hospital', name: '병원' },
  { id: 'classroom', name: '교실' },
  { id: 'cafe', name: '카페' },
  { id: 'store', name: '상점' },
  { id: 'bank', name: '은행' },
];

// Expanded preset roles in Korean
export const presetRoles = {
  restaurant: [
    { id: 'customer', name: '고객' },
  ],
  hospital: [
    { id: 'patient', name: '환자' },
    { id: 'visitor', name: '방문객' },
  ],
  classroom: [
    { id: 'student', name: '학생' },
  ],
  cafe: [
    { id: 'customer', name: '손님' },
  ],
  store: [
    { id: 'customer', name: '손님' },
  ],
  bank: [
    { id: 'customer', name: '고객' },
  ],
  hotel: [
    { id: 'guest', name: '투숙객' },
  ],
};

// Preset sentences in Korean (independent from contexts)
const presetSentences = [
  '안녕하세요',
  '도와주세요',
  '감사합니다',
  '네',
  '아니오',
  '죄송합니다',
];

export default function Home() {
  // Default values for context and role
  const [selectedContext, setSelectedContext] = useState<string>('restaurant');
  const [selectedRole, setSelectedRole] = useState<string>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { setInitialContext, clearHistory } = useConversation();

  const handleContextSelect = (contextId: string) => {
    setSelectedContext(contextId);
    // Set the default role for the selected context
    const defaultRole = presetRoles[contextId as keyof typeof presetRoles][0]?.id;
    if (defaultRole) {
      setSelectedRole(defaultRole);
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleStartConversation = async () => {
    setIsLoading(true);
    clearHistory(); // Clear previous conversation history
    
    try {
      // Initialize the conversation with the server
      const result = await startConversation({
        context: selectedContext,
        role: selectedRole
      });
      
      console.log('Start conversation result:', result);
      
      // Store context info locally for UI display purposes
      setInitialContext(selectedContext);
      
      // Navigate to conversation screen
      navigate('/conversation', { 
        state: { 
          initialContext: selectedContext,
          initialRole: selectedRole
        } 
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      alert("서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSentenceSelect = (sentence: string) => {
    // Don't navigate to conversation screen, just speak the sentence immediately
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'ko-KR'; // Set language to Korean
    window.speechSynthesis.speak(utterance);
  };

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Get available roles for the selected context
  const availableRoles = selectedContext ? presetRoles[selectedContext as keyof typeof presetRoles] : [];

  return (
    <div className="p-4 flex flex-col min-h-full relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">AACommu</h1>
        <button 
          onClick={handleSettingsToggle}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      
      {/* Settings popup - update the layout for more contexts and roles */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">설정</h2>
              <button 
                onClick={handleSettingsToggle}
                className="text-gray-500 hover:text-gray-700"
              >
                닫기
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">상황 선택</h3>
              <div className="grid grid-cols-2 gap-2">
                {presetContexts.map(context => (
                  <button
                    key={context.id}
                    onClick={() => handleContextSelect(context.id)}
                    className={`p-3 rounded-lg transition-colors border-gray-200 ${
                      selectedContext === context.id
                        ? 'bg-gray-200 font-medium '
                        : 'bg-white hover:bg-gray-50 border '
                    }`}
                  >
                    {context.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">역할 선택</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-3 rounded-lg transition-colors border-gray-200 ${
                      selectedRole === role.id
                        ? 'bg-gray-200 font-medium'
                        : 'bg-white hover:bg-gray-50 border '
                    }`}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleSettingsToggle}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <section className="mb-8">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold mr-2">현재 설정</h2>
          <div className="text-md text-gray-500">
            {presetContexts.find(c => c.id === selectedContext)?.name || '선택 안 함'} 
            {selectedRole && ` - ${presetRoles[selectedContext as keyof typeof presetRoles].find(r => r.id === selectedRole)?.name || ''}`}
          </div>
        </div>
        
        {/* Always show the conversation start button, enabled by default */}
        <div className="mt-4">
          <button
            onClick={handleStartConversation}
            disabled={isLoading}
            className={`w-full py-3 ${
              isLoading 
                ? 'bg-gray-300 text-gray-500' 
                : 'bg-green-500 text-white hover:bg-green-600'
            } rounded-lg font-medium transition-colors`}
          >
            {isLoading ? '초기화 중...' : '대화 시작'}
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">자주 쓰는 문장</h2>
        <div className="flex flex-col gap-3">
          {presetSentences.map((sentence, index) => (
            <button
              key={index}
              onClick={() => handleSentenceSelect(sentence)}
              className="p-4 text-left rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {sentence}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}