import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversation } from '../context/ConversationContext';
import { startConversation } from '../services/apiService';

// Preset contexts in Korean
const presetContexts = [
  { id: 'restaurant', name: '식당' },
  { id: 'hospital', name: '병원' },
  { id: 'classroom', name: '교실' },
];

// Preset roles in Korean - added based on PRD
const presetRoles = {
  restaurant: [
    { id: 'customer', name: '고객' },
    { id: 'server', name: '직원' }
  ],
  hospital: [
    { id: 'patient', name: '환자' },
    { id: 'visitor', name: '방문객' }
  ],
  classroom: [
    { id: 'student', name: '학생' },
    { id: 'teacher', name: '교사' }
  ]
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
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setInitialContext, clearHistory } = useConversation();

  const handleContextSelect = (contextId: string) => {
    clearHistory(); // Clear previous conversation history
    setSelectedContext(contextId);
    setSelectedRole(null); // Reset role when context changes
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleStartConversation = async () => {
    if (!selectedContext) return;
    
    setIsLoading(true);
    
    try {
      // Initialize the conversation with the server
      await startConversation({
        context: selectedContext,
        role: selectedRole || undefined
      });
      
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
      // Handle error (could show an alert or toast)
    } finally {
      setIsLoading(false);
    }
  };

  const handleSentenceSelect = (sentence: string) => {
    clearHistory(); // Clear previous conversation history
    navigate('/conversation');
    // Speak the sentence immediately
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'ko-KR'; // Set language to Korean
    window.speechSynthesis.speak(utterance);
  };

  // Get available roles for the selected context
  const availableRoles = selectedContext ? presetRoles[selectedContext as keyof typeof presetRoles] : [];

  return (
    <div className="p-6 flex flex-col min-h-full">
      <h1 className="text-2xl font-bold text-center mb-8">AAC 장치</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">상황 선택</h2>
        <div className="grid grid-cols-3 gap-3">
          {presetContexts.map(context => (
            <button
              key={context.id}
              onClick={() => handleContextSelect(context.id)}
              className={`p-4 rounded-lg transition-colors h-12 flex items-center justify-center ${
                selectedContext === context.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {context.name}
            </button>
          ))}
        </div>
        
        {/* Show role selection when context is selected */}
        {selectedContext && availableRoles.length > 0 && (
          <div className="mt-5">
            <h2 className="text-xl font-semibold mb-4">역할 선택</h2>
            <div className="grid grid-cols-2 gap-3">
              {availableRoles.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`p-4 rounded-lg transition-colors h-12 flex items-center justify-center ${
                    selectedRole === role.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Always show the conversation start button */}
        <div className="mt-4">
          <button
            onClick={handleStartConversation}
            disabled={!selectedContext || isLoading}
            className={`w-full py-3 ${
              !selectedContext || isLoading 
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