'use server';

/**
 * @fileOverview Professional AI financial advisor with expert-level financial intelligence
 * Uses OpenRouter API with optimized professional prompts and comprehensive error handling
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
  riskProfile?: 'conservative' | 'moderate' | 'aggressive';
  financialGoals?: string[];
}

// Enhanced predefined responses for common queries
const PREDEFINED_RESPONSES: Map<string, string> = new Map([
  ['hi', 'Greetings. I am your professional financial advisor. How may I assist you with your financial objectives today?'],
  ['hello', 'Good day. I am at your service for comprehensive financial guidance and analysis. What would you like to discuss?'],
  ['hey', 'Hello. I specialize in financial advisory services. How can I support your financial strategy today?'],
  ['thanks', 'You are most welcome. It is my professional duty to provide exemplary financial guidance.'],
  ['thank you', 'My pleasure. Should you require further financial consultation, I remain at your service.'],
  ['bye', 'I conclude our financial consultation. Do not hesitate to return for further strategic financial discussions.'],
  ['goodbye', 'Our financial advisory session concludes. May your investments prosper and your financial goals be achieved.'],
  ['how are you', 'Operating at optimal capacity, thank you. Prepared to deliver professional financial analysis and guidance.']
]);

// Enhanced questions that require specific user data access
const PERSONAL_DATA_QUESTIONS: RegExp[] = [
  /my (balance|account|money|portfolio|holdings|transactions)/i,
  /how much (do i have|money|capital|assets)/i,
  /show me my (financial|account|investment)/i,
  /what('s| is) my (current|total|net|investment)/i,
  /current (balance|spending|budget|allocation)/i,
  /recent (transactions|activity|trades)/i,
  /account (details|information|statement)/i,
  /portfolio (performance|value|composition)/i,
];

// Enhanced financial topics with professional responses
const FINANCIAL_TOPICS: Map<RegExp, string> = new Map([
  [/what is.*budget/i, 'A budget constitutes a strategic financial plan that allocates resources toward specific objectives while maintaining fiscal discipline. It serves as the foundation for wealth accumulation and financial security.'],
  [/how to.*save money/i, 'Implement a systematic savings strategy: establish clear financial objectives, automate transfers to dedicated accounts, optimize expenditure patterns, and prioritize high-yield savings vehicles. Consider the 50/30/20 rule as a foundational framework.'],
  [/what is.*investing/i, 'Investing represents the strategic deployment of capital into income-generating assets with the objective of wealth appreciation. It encompasses equities, fixed income securities, real estate, and alternative assets, each carrying distinct risk-return profiles.'],
  [/emergency fund/i, 'A robust emergency reserve should encompass 3-6 months of essential living expenses, maintained in highly liquid instruments. This financial buffer provides crucial stability during unforeseen circumstances without necessitating portfolio liquidation.'],
  [/credit score/i, 'Your credit score quantifies creditworthiness through a sophisticated algorithm evaluating payment history (35%), credit utilization (30%), credit history length (15%), credit mix (10%), and new credit inquiries (10%).'],
  [/retirement planning/i, 'Retirement planning requires meticulous calculation of future income needs, accounting for inflation, healthcare costs, and longevity risk. Diversified investment vehicles, tax-advantaged accounts, and systematic contributions form the cornerstone of retirement preparedness.'],
  [/debt management/i, 'Effective debt management prioritizes high-interest obligations while maintaining minimum payments on other liabilities. The avalanche method (targeting highest interest rates) typically provides optimal mathematical outcomes for debt reduction.'],
  [/investment strategies/i, 'Sophisticated investment strategies encompass asset allocation, diversification, periodic rebalancing, and risk management. Modern Portfolio Theory suggests that optimal returns derive from efficient frontier positioning based on risk tolerance.'],
  [/tax planning/i, 'Proactive tax planning utilizes available deductions, credits, and tax-advantaged accounts to minimize fiscal liabilities. Strategic asset location across taxable and tax-deferred accounts can significantly enhance after-tax returns.'],
  [/estate planning/i, 'Comprehensive estate planning ensures efficient wealth transfer while minimizing tax implications. It encompasses wills, trusts, beneficiary designations, and powers of attorney, requiring regular review as circumstances evolve.']
]);

// Financial expertise levels for different query types
const EXPERTISE_LEVELS: Map<string, string> = new Map([
  ['basic', 'Provide foundational knowledge with clear explanations of financial concepts'],
  ['intermediate', 'Offer strategic insights with practical applications and considerations'],
  ['advanced', 'Deliver sophisticated analysis with technical depth and professional terminology']
]);

class ProfessionalFinancialAdvisor {
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

  private determineExpertiseLevel(query: string): string {
    const advancedTerms = [/quantitative|derivatives|hedging|arbitrage|beta|alpha|sharpe ratio|volatility|correlation/i];
    const intermediateTerms = [/diversification|asset allocation|rebalancing|risk tolerance|compound interest|inflation|tax efficiency/i];
    
    if (advancedTerms.some(regex => regex.test(query))) return 'advanced';
    if (intermediateTerms.some(regex => regex.test(query))) return 'intermediate';
    return 'basic';
  }

  private async callOpenRouterAPI(messages: any[], maxTokens: number = 300): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Professional Financial Intelligence Platform',
        },
        body: JSON.stringify({
          model: 'mistralai/mixtral-8x7b-instruct', // Upgraded model for better financial expertise
          messages,
          max_tokens: maxTokens,
          temperature: 0.6, // Slightly lower temperature for more precise responses
          top_p: 0.85,
          frequency_penalty: 0.2,
          presence_penalty: 0.1,
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

      return data.choices[0]?.message?.content || 'I was unable to generate a comprehensive response. Please rephrase your inquiry.';

    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private buildSystemPrompt(context: FinancialContext, expertiseLevel: string): string {
    return `You are a CFA-certified financial advisor with 15+ years of experience in wealth management and financial planning. Provide expert-level, precise, and professionally formatted responses.

PROFESSIONAL PROTOCOLS:
1. PRECISION - Answer with exacting accuracy and technical correctness
2. DEPTH - Provide comprehensive analysis with multiple considerations
3. CLARITY - Use professional terminology while ensuring understanding
4. OBJECTIVITY - Maintain impartial, evidence-based recommendations
5. ACTIONABILITY - Include practical implementation guidance

EXPERTISE LEVEL: ${EXPERTISE_LEVELS.get(expertiseLevel) || 'Provide comprehensive professional analysis'}

COMMUNICATION STANDARDS:
- Utilize appropriate financial terminology
- Structure responses with clear logical flow
- Reference established financial principles when applicable
- Quantify recommendations where possible
- Differentiate between fact and strategic opinion

DATA PROTOCOLS:
- You lack access to personal financial data
- For account-specific inquiries: "As a security measure, I cannot access personal account information. Please consult your financial dashboard for specific data."
- For general inquiries: provide authoritative financial guidance

RESPONSE STRUCTURE:
1. Direct answer to the specific query
2. Supporting financial principles/rationale
3. Practical considerations or implementation notes
4. Risk factors or additional considerations

${context.hasData ? `CLIENT CONTEXT: ${context.summary}` : 'GENERAL FINANCIAL GUIDANCE MODE'}

IMPORTANT: Maintain professional tone while ensuring accessibility. Never provide specific investment recommendations without appropriate disclosures.`;
  }

  public async provideFinancialGuidance(query: string): Promise<string> {
    try {
      // Validate input
      if (!query?.trim()) {
        return 'Please articulate your financial inquiry. I am prepared to provide comprehensive professional guidance.';
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
        return 'For security and privacy compliance, I cannot access personal financial data. Please consult your secured financial dashboard for account-specific information. I specialize in providing general financial expertise and strategic guidance.';
      }

      // Determine appropriate expertise level
      const expertiseLevel = this.determineExpertiseLevel(cleanQuery);

      // Prepare professional context
      const context: FinancialContext = {
        hasData: false,
        summary: 'Client seeking professional financial guidance',
        riskProfile: 'moderate',
        financialGoals: ['wealth preservation', 'capital growth', 'financial security']
      };

      // Call AI API for professional response
      const messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt(context, expertiseLevel)
        },
        {
          role: 'user',
          content: cleanQuery
        }
      ];

      const response = await this.callOpenRouterAPI(messages);
      return this.formatProfessionalResponse(response);

    } catch (error) {
      console.error('Financial Advisor Error:', error);
      return this.handleProfessionalError(error);
    }
  }

  private formatProfessionalResponse(response: string): string {
    // Enhance professional formatting while maintaining readability
    return response
      .replace(/\n\s*\n/g, '\n\n') // Clean up excessive line breaks
      .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n') // Add paragraph breaks after sentences
      .trim();
  }

  private handleProfessionalError(error: any): string {
    if (error.name === 'AbortError') {
      return 'Response timeout exceeded. The financial analysis requires additional processing time. Please rephrase your inquiry.';
    }

    if (error.message.includes('API key') || error.message.includes('401')) {
      return 'Authentication configuration requires attention. Please contact system administration.';
    }

    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return 'Service capacity temporarily constrained. Please await system availability restoration.';
    }

    if (error.message.includes('network')) {
      return 'Network connectivity impairment detected. Please verify internet connection stability.';
    }

    return 'Technical impediment encountered. Our engineering team has been notified. Please retry your inquiry momentarily.';
  }

  // Enhanced connection test with professional reporting
  public async verifyServiceConnectivity(): Promise<{ operational: boolean; message: string; responseTime?: number }> {
    try {
      const startTime = Date.now();
      
      const response = await this.callOpenRouterAPI([
        {
          role: 'user',
          content: 'Confirm operational status with current timestamp'
        }
      ], 20);

      const responseTime = Date.now() - startTime;

      return {
        operational: true,
        message: `Service operational. Response time: ${responseTime}ms`,
        responseTime
      };

    } catch (error) {
      return {
        operational: false,
        message: `Service impairment: ${error instanceof Error ? error.message : 'Unknown connectivity issue'}`
      };
    }
  }
}

// Professional singleton instance management
let financialAdvisorInstance: ProfessionalFinancialAdvisor | null = null;

function getFinancialAdvisor(): ProfessionalFinancialAdvisor {
  if (!financialAdvisorInstance) {
    financialAdvisorInstance = new ProfessionalFinancialAdvisor();
  }
  return financialAdvisorInstance;
}

// Main export function for professional financial guidance
export async function provideFinancialGuidance(query: string): Promise<string> {
  const advisor = getFinancialAdvisor();
  return advisor.provideFinancialGuidance(query);
}

// Enhanced utility functions
export async function verifyAdvisorConnectivity(): Promise<string> {
  const advisor = getFinancialAdvisor();
  const result = await advisor.verifyServiceConnectivity();
  
  return result.operational 
    ? `✅ Financial advisory service operational (${result.responseTime}ms response time)`
    : `❌ Service impairment: ${result.message}`;
}

export async function processFinancialInquiry(query: string): Promise<{ 
  response: string; 
  type: 'predefined' | 'topic' | 'personal' | 'professional';
  expertise: 'basic' | 'intermediate' | 'advanced';
}> {
  const advisor = getFinancialAdvisor();
  const cleanQuery = query.trim().toLowerCase();

  // Determine response type and expertise level
  const expertiseLevel = advisor.determineExpertiseLevel(query);

  if (PREDEFINED_RESPONSES.has(cleanQuery)) {
    return {
      response: PREDEFINED_RESPONSES.get(cleanQuery)!,
      type: 'predefined',
      expertise: 'basic'
    };
  }

  if (advisor.isPersonalDataQuestion(query)) {
    return {
      response: 'I cannot access personal financial data due to security protocols. Please consult your financial dashboard for specific account information.',
      type: 'personal',
      expertise: 'basic'
    };
  }

  const topicResponse = advisor.getFinancialTopicResponse(query);
  if (topicResponse) {
    return {
      response: topicResponse,
      type: 'topic',
      expertise: expertiseLevel
    };
  }

  const professionalResponse = await advisor.provideFinancialGuidance(query);
  return {
    response: professionalResponse,
    type: 'professional',
    expertise: expertiseLevel
  };
}

// Additional professional service functions
export async function generateFinancialAnalysisReport(query: string): Promise<{
  analysis: string;
  keyConsiderations: string[];
  recommendedActions: string[];
}> {
  const advisor = getFinancialAdvisor();
  const response = await advisor.provideFinancialGuidance(`Comprehensive analysis request: ${query}`);
  
  return {
    analysis: response,
    keyConsiderations: [
      'Market conditions and economic outlook',
      'Risk tolerance assessment requirements',
      'Time horizon considerations',
      'Tax implications and efficiency',
      'Liquidity requirements and constraints'
    ],
    recommendedActions: [
      'Consult with a certified financial planner for personalized advice',
      'Review current portfolio allocation and risk exposure',
      'Consider tax-efficient investment strategies',
      'Establish clear financial objectives and time horizons',
      'Implement regular portfolio review and rebalancing protocol'
    ]
  };
}