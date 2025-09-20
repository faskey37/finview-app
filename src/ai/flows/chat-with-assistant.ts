'use server';

/**
 * @fileOverview Professional AI financial assistant with intelligent response handling
 * Uses OpenRouter API with optimized prompts and comprehensive error handling
 */

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

interface FinancialContext {
  hasData: boolean;
  summary?: string;
}

// Predefined responses for common queries (avoids unnecessary API calls)
const PREDEFINED_RESPONSES: Map<string, string> = new Map([
  ['hi', 'Hello! I\'m your financial assistant. How can I help you today?'],
  ['hello', 'Hi there! What financial questions can I help you with?'],
  ['hey', 'Hey! Ready to optimize your finances?'],
  ['thanks', 'You\'re welcome! Happy to help.'],
  ['thank you', 'Glad I could assist!'],
  ['bye', 'Goodbye! Feel free to return with any financial questions.'],
  ['goodbye', 'See you next time!'],
  ['how are you', 'I\'m functioning well, thank you! Ready to help with your financial goals.'],
]);

// Questions that require specific user data access
const PERSONAL_DATA_QUESTIONS: RegExp[] = [
  /my (balance|account|money)/i,
  /how much (do i have|money)/i,
  /show me my/i,
  /what('s| is) my/i,
  /current (balance|spending|budget)/i,
  /recent transactions/i,
  /account details/i,
];

// Common financial topics for optimized responses
const FINANCIAL_TOPICS: Map<RegExp, string> = new Map([
  [/what is.*budget/i, 'A budget is a financial plan that helps you track income and expenses, ensure you live within your means, and work toward your financial goals.'],
  [/how to.*save money/i, 'Start by tracking expenses, creating a budget, setting clear savings goals, automating transfers, and reducing unnecessary spending.'],
  [/what is.*investing/i, 'Investing involves putting money into assets like stocks, bonds, or real estate with the expectation of generating returns over time.'],
  [/emergency fund/i, 'An emergency fund should cover 3-6 months of living expenses in a liquid, accessible account for unexpected financial needs.'],
  [/credit score/i, 'Your credit score is a numerical representation of your creditworthiness based on payment history, credit utilization, and other factors.'],
]);

class AIAssistantService {
  private apiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
  }

  private isPersonalDataQuestion(query: string): boolean {
    return PERSONAL_DATA_QUESTIONS.some(regex => regex.test(query));
  }

  private getPredefinedResponse(query: string): string | null {
    const cleanQuery = query.toLowerCase().trim();
    return PREDEFINED_RESPONSES.get(cleanQuery) || null;
  }

  private getFinancialTopicResponse(query: string): string | null {
    for (const [regex, response] of FINANCIAL_TOPICS) {
      if (regex.test(query)) {
        return response;
      }
    }
    return null;
  }

  private async callOpenRouterAPI(messages: any[], maxTokens: number = 250): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Financial Intelligence Assistant',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.9,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.choices[0]?.message?.content || 'I couldn\'t generate a response. Please try again.';

    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private buildSystemPrompt(context: FinancialContext): string {
    return `You are a expert financial assistant. Provide accurate, helpful, and concise responses.

CORE PRINCIPLES:
1. BE SPECIFIC - Answer the exact question asked
2. BE CONCISE - 2-4 sentences maximum (50-150 words)
3. BE HONEST - Never invent or assume user data
4. BE EDUCATIONAL - Provide general financial guidance
5. BE PROFESSIONAL - Maintain helpful, expert tone

DATA ACCESS RULES:
- You DO NOT have access to user's personal financial data
- If asked about specific accounts/balances: "I don't have access to your personal financial data. Please check your dashboard for account-specific information."
- For general questions: provide educational information

RESPONSE GUIDELINES:
- Focus on actionable advice
- Use simple, clear language
- Include practical examples when helpful
- Avoid financial jargon without explanation
- Never provide specific investment advice

${context.hasData ? 'Context: ' + context.summary : ''}`;
  }

  public async chatWithAssistant(query: string): Promise<string> {
    try {
      // Validate input
      if (!query?.trim()) {
        return 'Please ask a question about personal finance.';
      }

      const cleanQuery = query.trim();

      // Check for predefined responses
      const predefinedResponse = this.getPredefinedResponse(cleanQuery);
      if (predefinedResponse) {
        return predefinedResponse;
      }

      // Check for financial topic responses
      const topicResponse = this.getFinancialTopicResponse(cleanQuery);
      if (topicResponse) {
        return topicResponse;
      }

      // Handle personal data questions
      if (this.isPersonalDataQuestion(cleanQuery)) {
        return 'I don\'t have access to your personal financial data. For account-specific information like balances, transactions, and budgets, please check your dashboard. I can provide general financial advice if that would be helpful!';
      }

      // Prepare context (optional - can be enhanced with actual user data)
      const context: FinancialContext = {
        hasData: false,
        summary: 'User is asking general financial questions'
      };

      // Call AI API for tailored response
      const messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt(context)
        },
        {
          role: 'user',
          content: cleanQuery
        }
      ];

      const response = await this.callOpenRouterAPI(messages);
      return this.formatResponse(response);

    } catch (error) {
      console.error('AI Assistant Error:', error);
      return this.handleError(error);
    }
  }

  private formatResponse(response: string): string {
    // Clean up response formatting
    return response
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private handleError(error: any): string {
    if (error.name === 'AbortError') {
      return 'Request timeout. Please try again.';
    }

    if (error.message.includes('API key') || error.message.includes('401')) {
      return 'Service configuration issue. Please try again later.';
    }

    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return 'Service is busy. Please wait a moment and try again.';
    }

    if (error.message.includes('network')) {
      return 'Network connection issue. Please check your internet connection.';
    }

    return 'I\'m experiencing technical difficulties. Please try again in a moment.';
  }

  // Public method for testing API connection
  public async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    try {
      const startTime = Date.now();
      
      const response = await this.callOpenRouterAPI([
        {
          role: 'user',
          content: 'Respond with "OK" only'
        }
      ], 10);

      const latency = Date.now() - startTime;

      return {
        success: response.includes('OK'),
        message: response,
        latency
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }
}

// Singleton instance
let assistantInstance: AIAssistantService | null = null;

function getAIAssistant(): AIAssistantService {
  if (!assistantInstance) {
    assistantInstance = new AIAssistantService();
  }
  return assistantInstance;
}

// Main export function - MUST be async for Server Action
export async function chatWithAssistant(query: string): Promise<string> {
  const assistant = getAIAssistant();
  return assistant.chatWithAssistant(query);
}

// Utility functions - MUST be async for Server Actions
export async function testAIConnection(): Promise<string> {
  const assistant = getAIAssistant();
  const result = await assistant.testConnection();
  
  return result.success 
    ? `✅ Connection successful (${result.latency}ms)`
    : `❌ Connection failed: ${result.message}`;
}

export async function handleFinancialQuery(query: string): Promise<{ response: string; type: 'predefined' | 'topic' | 'personal' | 'ai' }> {
  const assistant = getAIAssistant();
  const cleanQuery = query.trim().toLowerCase();

  // Determine response type
  if (PREDEFINED_RESPONSES.has(cleanQuery)) {
    return {
      response: PREDEFINED_RESPONSES.get(cleanQuery)!,
      type: 'predefined'
    };
  }

  if (assistant.isPersonalDataQuestion(query)) {
    return {
      response: 'I don\'t have access to your personal financial data. Please check your dashboard for specific information.',
      type: 'personal'
    };
  }

  const topicResponse = assistant.getFinancialTopicResponse(query);
  if (topicResponse) {
    return {
      response: topicResponse,
      type: 'topic'
    };
  }

  const aiResponse = await assistant.chatWithAssistant(query);
  return {
    response: aiResponse,
    type: 'ai'
  };
} 