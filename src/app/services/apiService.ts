// API Service for the updated Korean API endpoints
const API_BASE_URL = 'http://223.130.156.155:8000';

export interface StartConversationRequest {
  context: string;  // 대화 상황(음식점, 병원 등)
  role?: string;    // 사용자 역할(고객, 환자 등)
}

export interface StartConversationResponse {
  message: string;
}

export interface VoiceInputResponse {
  transcribed_text: string;
  options: string[];
}

export interface SelectOptionRequest {
  choice: string;  // 사용자 선택 단어
}

export interface SelectOptionResponse {
  current_sentence: string;
  options: string[];
}

export interface EndSentenceResponse {
  final_sentence: string;
}

// Initialize conversation with context and role
export const startConversation = async (
  request: StartConversationRequest
): Promise<StartConversationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to start conversation');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error starting conversation:', error);
    return { message: '오류가 발생했습니다.' };
  }
};

// Send voice recording to get transcription and options
export const processVoiceInput = async (
  audioFile: File
): Promise<VoiceInputResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    
    const response = await fetch(`${API_BASE_URL}/voice`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to process voice input');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error processing voice input:', error);
    return {
      transcribed_text: '음성 처리 중 오류가 발생했습니다.',
      options: []
    };
  }
};

// Select a phrase and get next options
export const selectOption = async (
  choice: string
): Promise<SelectOptionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ choice }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get next options');
    }
    
    const data = await response.json();
    
    // Ensure the response has the expected format
    return {
      current_sentence: data.current_sentence || choice,
      options: data.options || []
    };
  } catch (error) {
    console.error('Error selecting option:', error);
    return {
      current_sentence: choice,
      options: []
    };
  }
};

// End the sentence and get the final result
export const endSentence = async (): Promise<EndSentenceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to end sentence');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error ending sentence:', error);
    return {
      final_sentence: ''
    };
  }
}; 