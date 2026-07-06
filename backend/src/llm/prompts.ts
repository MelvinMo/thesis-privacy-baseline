import { RegulatoryFramework, TransparencyEvent, UserConsentPreferences } from "../constants/types/Transparency";

// this is the default instruction
const instruction = "Provide your analysis in clear, concise, user-friendly language that a non-technical person can understand. Replace complex legal and technical jargon with simple explanations that the average middle schooler can grasp.";


/**
 * The prompt involves first telling the LLM that it is a privacy compliance expert. 
 * 
 * Then it is given the transparencyEvent, privacy policy, user consent preferences, regulatory frameworks to consider, and specific PIPEDA regulations to consider in its analysis.
 * Next, there are general analysis instructions, risk assessment criteria, and specific instructions for the LLM to follow.
 * 
 * The default length is 30 words.
 */
export function createPrivacyAnalysisPrompt(
  transparencyEvent: TransparencyEvent,
  privacyPolicy: string,
  userConsentPreferences: UserConsentPreferences,
  regulationFrameworks: RegulatoryFramework[],
  pipedaRegulations: string,
  specificInstructions = instruction,
  length: number = 30,
  userRiskTolerance?: string, // While the current prompt does not take into account, in the future, user risk tolerance could be a factor in how the LLM classifies privacy violations
): string {
  return `You are a privacy compliance expert analyzing a sleep tracking application's data handling practices. 

The following transparency event contains information about the purpose of data collection, data storage location, encryption methods and transmission methods. 

**TRANSPARENCY EVENT**:
${JSON.stringify(transparencyEvent, null, 2)}

The following is the privacy policy of the sleep tracker application:

**PRIVACY POLICY**:
${privacyPolicy}

The following are the user's consent preferences - what the user has agreed to regarding data collection and processing:
**USER CONSENT PREFERENCES**:
${JSON.stringify(userConsentPreferences, null, 2)}

**REGULATORY FRAMEWORKS TO CONSIDER**:
${regulationFrameworks.join(', ')}

${pipedaRegulations ? `**SPECIFIC PIPEDA REGULATIONS**:\n${pipedaRegulations}\n` : ''}

**ANALYSIS INSTRUCTIONS**:
1. Evaluate if the data collection aligns with the stated purpose
2. Verify if the transparency event information complies with the privacy policy and user consent preferences. 
3. Assess compliance with the specified regulatory frameworks and provided regulations only. DO NOT use any other regulations.
4. Identify potential privacy risks and their severity according to the below critera: 

**RISK ASSESSMENT CRITERIA**:
- **HIGH RISK**: Clear violation of regulations, privacy policy, or user consent; unauthorized data collection; insecure storage/transmission
- **MEDIUM RISK**: Technically compliant but suboptimal practices; vague purposes; excessive data collection; third-party sharing concerns
- **LOW RISK**: Fully compliant with minimal privacy concerns; clear purpose; proper consent; secure handling

**REQUIRED OUTPUT FORMAT** (respond with valid JSON only, each aiExplanation field ("why", "storage", "access" and "privacyExplanation") must be strictly between ${0.8 * length}-${length} words):
{
  "privacyRisk": "HIGH" | "MEDIUM" | "LOW",
  "regulatoryCompliance": {
    "framework": "PIPEDA",
    "compliant": true | false,
    "issues": "description of compliance issues",
    "relevantSections": ["section reference 1", "section reference 2"]
  },
  "aiExplanation": {
    "why": "brief explanation of why this data is collected and what benefits it provides to the user",
    "storage": "where the data is stored and how it is protected",
    "access": "who has access to the data",
    "privacyExplanation": "explanation covering the privacy risks associated with this data collection, summarize what PIPEDA regulations say about these risks and whether the collection complies with these requirements",
    "privacyPolicyLink": ["section_id_1", "section_id_2"], // only provide 2-3 most relevant sections 
    "regulationLink": ["principle_id_1", "principle_id_2"], // only provide 2-3 most relevant principles
  }
}
${specificInstructions}`;
}