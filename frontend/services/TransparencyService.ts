import { RegulatoryFramework } from '@/constants/types/Transparency';
import { TransparencyEvent, AIPrompt } from '@/constants/types/Transparency';
import { useProfileStore } from '@/store/userProfileStore';
import privacyPolicyData from '../privacyPolicyData.json';
import regulations from '../privacyRegulations.json';
import { HttpClient } from './HttpClient';

/**
 * This service analyzes privacy risks by sending the AIPrompt to the backend. 
 */
export class TransparencyService {
  private httpClient: HttpClient;
  private getTokenFn: () => string | null; // Function to get the token, injected

    constructor(httpClient: HttpClient, getTokenFn: () => string | null) {
        this.httpClient = httpClient;
        this.getTokenFn = getTokenFn;
    }
  
  async analyzePrivacyRisks(transparencyEvent : TransparencyEvent) : Promise<TransparencyEvent> {

    const token = this.getAuthToken(); 

    const aiPrompt: AIPrompt = {
      transparencyEvent,
      privacyPolicy: JSON.stringify(privacyPolicyData.privacyPolicy),
      userConsentPreferences: useProfileStore.getState().userConsentPreferences,
      regulationFrameworks: [RegulatoryFramework.PIPEDA], 
      pipedaRegulations: JSON.stringify(regulations.pipeda),
    }

    const response = await this.httpClient.post<{ transparencyEvent: TransparencyEvent }>(
      '/transparency/ai/', aiPrompt, token)

    if (!response){
      throw new Error('Failed to analyze privacy risks');
    }

    return response.transparencyEvent;
  
}

  private getAuthToken(): string {
      const token = this.getTokenFn();
      if (!token) {
          throw new Error('Authentication token missing for cloud operation.');
      }
      return token;
  }
}