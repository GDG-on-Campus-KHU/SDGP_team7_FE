import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConversation } from '../context/ConversationContext';
import DialogHistory from '../components/DialogHistory';
import { presetRoles } from './home';
import {
    processVoiceInput,
    selectOption,
    endSentence
} from '../services/apiService';

// Common phrases that are always available
const commonPhrases = [
    '감사합니다',
    '네',
    '아니오',
    '죄송합니다',
];

// Context-specific preset phrases for sentence building
const contextPhrases = {
    restaurant: [
        '물 주세요',
        '메뉴를 볼 수 있을까요?',
        '이거 주문할게요',
        '감사합니다',
    ],
    hospital: [
        '약을 받고 싶어요',
        '여기가 아파요',
        '네',
        '아니오',
    ],
    classroom: [
        '질문이 있어요',
        '이해가 잘 안 돼요',
        '네',
        '아니오',
    ],
};

export default function Conversation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { initialContext, initialRole } = location.state || {};
    const [isRecording, setIsRecording] = useState(false);
    const [contextLabel, setContextLabel] = useState('');
    const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
    const { setInitialContext, getContextLabel, addToDialog } = useConversation();

    // States for handling API responses
    const [isLoading, setIsLoading] = useState(false);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [phraseCandidates, setPhraseCandidates] = useState<string[]>([]);
    const [isLoadingNextPhrases, setIsLoadingNextPhrases] = useState(false);

    // Add state for the dialog history popup
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Add state to track the actual MediaRecorder
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    // Set the context and context label in Korean
    useEffect(() => {
        if (initialContext) {
            setInitialContext(initialContext);
            setContextLabel(getContextLabel(initialContext));
        }
    }, [initialContext, setInitialContext, getContextLabel]);

    // Get the phrases to show based on the current context
    const phrasesToShow = initialContext
        ? (contextPhrases[initialContext as keyof typeof contextPhrases] || commonPhrases)
        : commonPhrases;

    const handleRecordToggle = () => {
        if (isRecording) {
            // Stop recording
            mediaRecorder?.stop();
            setIsRecording(false);
        } else {
            // Start recording
            startRecording();
        }
    };

    const startRecording = async () => {
        try {
            // Reset any previous recordings
            setAudioChunks([]);

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create a new MediaRecorder instance
            const recorder = new MediaRecorder(stream);

            // Event handler for data available
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setAudioChunks(chunks => [...chunks, event.data]);
                }
            };

            // Event handler for when recording stops
            recorder.onstop = () => {
                // When recording stops, process the audio
                processAudio();

                // Stop all audio tracks
                stream.getTracks().forEach(track => track.stop());
            };

            // Start recording
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);

            // Reset selections when starting a new recording
            setSelectedSentence(null);

        } catch (error) {
            console.error('Error starting recording:', error);
            // Show error message to user
        }
    };

    const processAudio = () => {
        if (audioChunks.length === 0) return;

        setIsLoading(true);

        // Combine audio chunks into a single blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

        // Create a File object from the blob
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });

        // Send to server for processing
        processVoiceInput(audioFile)
            .then(response => {
                setTranscript(response.transcribed_text);
                setPhraseCandidates(response.options);

                // Add the partner's response to dialog history
                addToDialog(`상대방: ${response.transcribed_text}`);
            })
            .catch(error => {
                console.error('Error processing voice input:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handlePresetSentenceSelect = (sentence: string) => {
        setSelectedSentence(sentence);
        // Reset phrase candidates when selecting a preset sentence
        setPhraseCandidates([]);
    };

    // Method to handle phrase selection and get next suggestions
    const handlePhraseSelect = (phrase: string) => {
        setIsLoadingNextPhrases(true);

        selectOption(phrase)
            .then(response => {
                // Update with the current sentence from server
                // and the next available options
                setSelectedSentence(response.current_sentence);
                setPhraseCandidates(response.options);
            })
            .catch(error => {
                console.error('Error selecting phrase:', error);
            })
            .finally(() => {
                setIsLoadingNextPhrases(false);
            });
    };

    // Method to handle the speak button
    const handleSpeak = () => {
        if (!selectedSentence) return;

        // Use Web Speech API to speak the sentence
        const utterance = new SpeechSynthesisUtterance(selectedSentence);
        utterance.lang = 'ko-KR';
        window.speechSynthesis.speak(utterance);

        // Add to dialog history
        addToDialog(`나: ${selectedSentence}`);

        // End the current sentence on the server
        endSentence()
            .then(response => {
                // Reset after speaking
                setSelectedSentence(null);
                setPhraseCandidates([]);
            })
            .catch(error => {
                console.error('Error ending sentence:', error);
            });
    };

    // Handle dialog history visibility
    const handleHistoryToggle = () => {
        setIsHistoryOpen(!isHistoryOpen);
    };

    // Navigate back to home
    const handleBackClick = () => {
        navigate('/');
    };

    // Add function to clear the current selected sentence
    const handleClearSentence = () => {
        setSelectedSentence(null);
        setPhraseCandidates([]);
    };

    return (
        <div className="flex flex-col h-full p-4">
            {/* Dialog history modal */}
            {isHistoryOpen && (
                <DialogHistory
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={handleBackClick}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-grow text-center font-semibold text-lg">
                    {contextLabel || '대화'} - {initialRole && `${presetRoles[initialContext as keyof typeof presetRoles].find(r => r.id === initialRole)?.name || ''}`}
                </div>
                <button
                    onClick={handleHistoryToggle}
                    className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
                >
                    기록
                </button>
            </div>

            {/* Main content area (scrollable) */}
            <div className="flex-1 overflow-y-auto">
                {/* Current sentence - now with clear button */}
                <div className="mb-6 relative">
                    <div className="p-4 bg-blue-50 items-center rounded-lg border border-blue-100">
                        <p className={`${selectedSentence ? 'text-black' : 'text-gray-500'}`}>{selectedSentence || '문장을 선택하세요'}</p>
                    </div>
                    
                    {/* Add clear button when there's a selected sentence */}
                    {selectedSentence && (
                        <button 
                            onClick={handleClearSentence}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                            aria-label="문장 지우기"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Phrase candidates - Show after voice processing */}
                {phraseCandidates.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">
                            {isLoadingNextPhrases ? "다음 문구 로딩 중..." : "다음 문구"}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {phraseCandidates.map((phrase, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePhraseSelect(phrase)}
                                    className="bg-green-50 hover:bg-green-100 py-2 px-4 rounded-md border border-green-200"
                                >
                                    {phrase}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Context-specific or common phrases */}
                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-3">자주 쓰는 문장</h2>
                    <div className="flex flex-col gap-2">
                        {phrasesToShow.map((phrase, index) => (
                            <button
                                key={index}
                                onClick={() => handlePresetSentenceSelect(phrase)}
                                className={`p-3 text-left rounded-lg transition-colors ${selectedSentence === phrase
                                    ? 'bg-blue-100 border border-blue-300'
                                    : 'bg-gray-50 border border-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                {phrase}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fixed bottom area */}
            <div className="mt-auto">
                {/* Transcript area - fixed at bottom above buttons */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-500 text-center">
                        {isLoading ? '처리 중...' :
                            isRecording ? '녹음 중...' :
                                transcript ? transcript :
                                    '대화 상대방의 음성을 녹음하려면 녹음 버튼을 누르세요'}
                    </p>
                </div>

                {/* Controls at bottom - fixed */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleRecordToggle}
                        disabled={isLoading}
                        className={`p-4 rounded-lg font-medium 
                            ${isLoading ? 'bg-gray-300 text-gray-500' :
                                isRecording ? 'bg-red-600 text-white' : 'bg-red-200 text-red-600'}`}
                    >
                        {isLoading ? '처리 중...' :
                            isRecording ? '녹음 중지' : '녹음 시작'}
                    </button>
                    <button
                        onClick={handleSpeak}
                        disabled={!selectedSentence}
                        className="p-4 bg-green-500 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        말하기
                    </button>
                </div>
            </div>
        </div>
    );
} 