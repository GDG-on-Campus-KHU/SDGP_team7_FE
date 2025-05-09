// API Service for the updated Korean API endpoints
const API_BASE_URL = 'http://223.130.156.155:8000';

export interface StartConversationRequest {
  context: string;  // 대화 상황(음식점, 병원 등)
  role: string;     // 사용자 역할(고객, 환자 등)
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
    console.log('Starting conversation with:', request);
    
    // Ensure both context and role are provided
    if (!request.context || !request.role) {
      throw new Error('Both context and role are required');
    }
    
    // Use FormData which our debug test showed works successfully
    const formData = new FormData();
    formData.append('context', request.context);
    formData.append('role', request.role);
    
    console.log('Using FormData with context:', request.context, 'role:', request.role);
    
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      body: formData,
    });
    
    console.log('Start conversation response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      throw new Error(`Failed to start conversation: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error; // Re-throw to allow the component to handle it
  }
};

// Send voice recording to get transcription and options
export const processVoiceInput = async (
  audioFile: File
): Promise<VoiceInputResponse> => {
  try {
    console.log('Processing voice input file:', audioFile.name, audioFile.size);
    
    const formData = new FormData();
    formData.append('file', audioFile);
    
    const response = await fetch(`${API_BASE_URL}/voice`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });
    
    console.log('Voice process response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      throw new Error(`Failed to process voice input: ${response.status}`);
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
    console.log('Selecting option:', choice);
    
    // Use FormData for consistency
    const formData = new FormData();
    formData.append('choice', choice);
    
    const response = await fetch(`${API_BASE_URL}/select`, {
      method: 'POST',
      body: formData,
    });
    
    console.log('Select option response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      throw new Error(`Failed to get next options: ${response.status}`);
    }
    
    return await response.json();
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
    console.log('Ending sentence');
    
    // Just send an empty FormData (no parameters needed)
    const formData = new FormData();
    
    const response = await fetch(`${API_BASE_URL}/end`, {
      method: 'POST',
      body: formData,
    });
    
    console.log('End sentence response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', errorText);
      throw new Error(`Failed to end sentence: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error ending sentence:', error);
    return {
      final_sentence: ''
    };
  }
};

// Updated debug function to try all three formats
export const debugStartConversation = async (
  context: string,
  role: string
): Promise<any> => {
  try {
    // Format 1: Simple object with proper keys
    const format1 = { context, role };
    console.log('Testing format 1:', format1);
    
    try {
      const response1 = await fetch(`${API_BASE_URL}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(format1),
      });
      
      console.log('Format 1 response status:', response1.status);
      
      if (response1.ok) {
        const data = await response1.json();
        return {
          success: true,
          format: 'json',
          data,
        };
      } else {
        const errorText = await response1.text();
        console.error('Format 1 error:', errorText);
      }
    } catch (err) {
      console.error('Format 1 exception:', err);
    }
    
    // Format 2: FormData
    const format2 = new FormData();
    format2.append('context', context);
    format2.append('role', role);
    console.log('Testing format 2 (FormData)');
    
    try {
      const response2 = await fetch(`${API_BASE_URL}/start`, {
        method: 'POST',
        body: format2,
      });
      
      console.log('Format 2 response status:', response2.status);
      
      if (response2.ok) {
        const data = await response2.json();
        return {
          success: true,
          format: 'formdata',
          data,
        };
      } else {
        const errorText = await response2.text();
        console.error('Format 2 error:', errorText);
      }
    } catch (err) {
      console.error('Format 2 exception:', err);
    }
    
    // Format 3: URL encoded
    const format3 = new URLSearchParams();
    format3.append('context', context);
    format3.append('role', role);
    console.log('Testing format 3 (URLSearchParams)');
    
    try {
      const response3 = await fetch(`${API_BASE_URL}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: format3.toString(),
      });
      
      console.log('Format 3 response status:', response3.status);
      
      if (response3.ok) {
        const data = await response3.json();
        return {
          success: true,
          format: 'urlencoded',
          data,
        };
      } else {
        const errorText = await response3.text();
        console.error('Format 3 error:', errorText);
      }
    } catch (err) {
      console.error('Format 3 exception:', err);
    }
    
    // If all formats failed, return the last error
    return {
      success: false,
      message: 'All request formats failed',
    };
  } catch (error) {
    console.error('Debug error:', error);
    return {
      success: false,
      error,
    };
  }
}; 