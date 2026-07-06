import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMService } from './LLMService';
import { 
  TransparencyEvent, 
  RegulatoryFramework,
  PrivacyRisk,
  RegulatoryCompliance,
  AIExplanation 
} from '../constants/types/Transparency';

export class GeminiLLMService implements LLMService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      // we can play around with this to tune the model's behavior and get the best response for our use case
      generationConfig: {
        temperature: 0.3, // increasing temperature increases randomness, less predictable
        topK: 40, // limit to only the top K most likely next words at each step, increase this to make output more variable and diverse
        topP: 0.95, // considers words that make up the top 95% of probability mass, decrease this to make output more focused and deterministic
        maxOutputTokens: 16384,
      },
    });
  }

  async analyzePrivacyRisks(
    transparencyEvent: TransparencyEvent,
    prompt: string
  ): Promise<TransparencyEvent> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const analysis = this.parseAnalysisResponse(text);
      
      // Update the transparency event with the analysis
      const updatedEvent: TransparencyEvent = {
        ...transparencyEvent,
        timestamp: new Date(),
        privacyRisk: analysis.privacyRisk,
        regulatoryCompliance: analysis.regulatoryCompliance,
        aiExplanation: analysis.aiExplanation
      };

      return updatedEvent;

    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      
      // Handle specific Gemini API errors
      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key for Gemini service');
      }
      
      if (error.message?.includes('quota')) {
        throw new Error('Gemini API quota exceeded');
      }
      
      if (error.message?.includes('safety')) {
        throw new Error('Request blocked by Gemini safety filters');
      }

      // Return a fallback analysis if the API call fails
      return this.createFallbackAnalysis(transparencyEvent, error.message);
    }
  }

  private parseAnalysisResponse(text: string): {
    privacyRisk: PrivacyRisk;
    regulatoryCompliance: RegulatoryCompliance;
    aiExplanation: AIExplanation;
  } {
    try {
      // Clean the response text (remove any markdown formatting)
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(cleanText);
      
      // Validate the response structure
      if (!parsed.privacyRisk || !parsed.regulatoryCompliance || !parsed.aiExplanation) {
        throw new Error('Invalid response structure from Gemini API');
      }

      // Ensure privacy risk is valid
      if (!Object.values(PrivacyRisk).includes(parsed.privacyRisk)) {
        parsed.privacyRisk = PrivacyRisk.LOW; // Default to low if invalid
      }

      // Ensure regulatory compliance has required fields
      if (!parsed.regulatoryCompliance.framework) {
        parsed.regulatoryCompliance.framework = RegulatoryFramework.PIPEDA;
      }

      // Ensure arrays exist
      parsed.regulatoryCompliance.issues = parsed.regulatoryCompliance.issues || [];
      parsed.regulatoryCompliance.relevantSections = parsed.regulatoryCompliance.relevantSections || [];

      // iterate the links and ensure they are just the ids because sometimes the AI returns the whole json link with '.' instead of just the id
      parsed.aiExplanation.privacyPolicyLink.forEach((link: string, index: number) => {
        if (parsed.aiExplanation.privacyPolicyLink[index].includes('.')){
          parsed.aiExplanation.privacyPolicyLink[index] = link.split('.').pop() || '';
        }
      });

      parsed.aiExplanation.regulationLink.forEach((link: string, index: number) => {
        if (parsed.aiExplanation.regulationLink[index].includes('.')) {
          parsed.aiExplanation.regulationLink[index] = link.split('.').pop() || '';
        }
      });

      return {
        privacyRisk: parsed.privacyRisk,
        regulatoryCompliance: parsed.regulatoryCompliance,
        aiExplanation: parsed.aiExplanation
      };

    } catch (error: any) {
      console.error('Error parsing Gemini response:', error);
      console.error('Raw response:', text);
      throw new Error(`Invalid JSON response from Gemini API: ${error.message}`);
    }
  }

  private createFallbackAnalysis(transparencyEvent: TransparencyEvent, errorMessage: string): TransparencyEvent {
    console.warn('Creating fallback analysis due to API error:', errorMessage);
    
    return {
      ...transparencyEvent,
      timestamp: new Date(),
      privacyRisk: PrivacyRisk.MEDIUM,
      regulatoryCompliance: {
        framework: RegulatoryFramework.PIPEDA,
        compliant: false,
        issues: 'Unable to complete automated privacy analysis',
        relevantSections: []
      },
      aiExplanation: {
        why: 'Automated privacy analysis is temporarily unavailable. Please review this data handling manually.',
        storage: 'Not currently available',
        access: 'Not currently available',
        privacyExplanation: 'Automated analysis could not be completed',
        privacyPolicyLink: [],
        regulationLink: []
      }
    };
  }

  /**
   * Test the connection to Gemini API
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Test connection. Respond with "OK".');
      const response = await result.response;
      const text = response.text();
      return text.includes('OK');
    } catch (error) {
      console.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}