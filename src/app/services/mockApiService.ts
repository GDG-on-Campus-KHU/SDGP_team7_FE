// Improved mock responses for different contexts
const mockResponses = {
  restaurant: {
    transcript: "뭘 주문하시겠어요?",
    candidates: ["저는", "불고기", "비빔밥", "메뉴", "주문할게요"]
  },
  hospital: {
    transcript: "어디가 불편하세요?",
    candidates: ["머리가", "배가", "다리가", "아파요", "불편해요"]
  },
  classroom: {
    transcript: "질문 있으신가요?",
    candidates: ["이해가", "질문이", "예제를", "설명을", "있습니다"]
  },
  default: {
    transcript: "무엇을 도와드릴까요?",
    candidates: ["도움이", "안녕하세요", "감사합니다", "필요해요", "죄송합니다"]
  }
};

// Improved mock next phrase suggestions based on current sentence
const mockNextPhrases = {
  restaurant: {
    "저는": ["비빔밥을", "불고기를", "주문할게요", "주세요"],
    "불고기": ["주세요", "랑", "정식을", "세트를"],
    "비빔밥": ["주세요", "이", "을", "랑"],
    "메뉴": ["추천해", "좀", "보여", "주세요"],
    // Fallbacks for words not specifically handled
    "default": ["주세요", "랑", "을", "이", "감사합니다"]
  },
  hospital: {
    "머리가": ["아파요", "아프고", "멍해요", "어지러워요"],
    "배가": ["아파요", "아프고", "불편해요", "메스꺼워요"],
    "다리가": ["아파요", "붓고", "저려요", "불편해요"],
    "default": ["아파요", "불편해요", "때문에", "왔어요", "하고"]
  },
  classroom: {
    "이해가": ["안", "잘", "되지", "됐어요"],
    "질문이": ["있습니다", "있어요", "좀", "하나"],
    "예제를": ["더", "보여주세요", "설명해주세요", "이해했어요"],
    "설명을": ["부탁드립니다", "다시", "해주세요", "이해했어요"],
    "default": ["해주세요", "주세요", "부탁드립니다", "있어요", "감사합니다"]
  },
  default: {
    "도움이": ["필요해요", "좀", "주세요", "감사합니다"],
    "안녕하세요": ["저는", "도움이", "필요해요", "감사합니다"],
    "default": ["네", "아니오", "감사합니다", "부탁드립니다", "죄송합니다"]
  }
};

export interface ContextualSuggestionsResponse {
  transcript: string;
  candidates: string[];
}

export interface NextPhraseSuggestionsResponse {
  next_candidates: string[];
}

// Simulates the contextual suggestions API call
export const getContextualSuggestions = (
  context?: string
): Promise<ContextualSuggestionsResponse> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const response = context && mockResponses[context as keyof typeof mockResponses]
        ? mockResponses[context as keyof typeof mockResponses]
        : mockResponses.default;
      
      resolve(response);
    }, 800); // Simulate a delay of 800ms
  });
};

// Improved next phrase suggestions API call
export const getNextPhraseSuggestions = (
  currentSentence: string[],
  context?: string
): Promise<NextPhraseSuggestionsResponse> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Get the last word in the current sentence
      const lastWord = currentSentence[currentSentence.length - 1];
      
      let nextOptions: string[] = [];
      
      // Get the context-specific next phrases if available
      if (context && mockNextPhrases[context as keyof typeof mockNextPhrases]) {
        const contextPhrases = mockNextPhrases[context as keyof typeof mockNextPhrases];
        
        // If we have specific suggestions for this word, use them
        if (lastWord && contextPhrases[lastWord as keyof typeof contextPhrases]) {
          nextOptions = contextPhrases[lastWord as keyof typeof contextPhrases] as string[];
        } 
        // Otherwise, use default suggestions for this context
        else if (contextPhrases["default"]) {
          nextOptions = contextPhrases["default"] as string[];
        }
      }
      
      // If we couldn't find any relevant suggestions, use general defaults
      if (nextOptions.length === 0) {
        nextOptions = ["네", "아니오", "감사합니다", "죄송합니다", "부탁드립니다"];
      }
      
      resolve({ next_candidates: nextOptions });
    }, 600);
  });
}; 