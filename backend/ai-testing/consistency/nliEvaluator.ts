/**
 * NLI Evaluator for assessing AI explanations against privacy policies and regulations.
 *
 * This class uses a zero-shot classification model to evaluate the alignment between AI-generated explanations and reference texts.
 * This is the HF model card for the model used: https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli
 * This is one of the best performing NLI models on HF. 
 */

import { AIExplanation } from '../../src/constants/types/Transparency';
import privacyPolicyData from '../../privacyPolicyData.json';
import privacyRegulations from '../../privacyRegulations.json';
import { pipeline, ZeroShotClassificationPipeline } from '@huggingface/transformers';

export class NLIEvaluator {

	private classifier: ZeroShotClassificationPipeline;

  // Use a private constructor to enforce use of the static create method
  private constructor(classifier: ZeroShotClassificationPipeline) {
    this.classifier = classifier;
  }

	public static async create(): Promise<NLIEvaluator> {
    try {
      console.log('Initializing NLI pipeline...');
      const classifier = await pipeline('zero-shot-classification', 'Xenova/DeBERTa-v3-large-mnli-fever-anli-ling-wanli');
      console.log('NLI pipeline initialized successfully.');
      return new NLIEvaluator(classifier);
    } catch (error) {
      console.error('Error occurred while initializing NLI pipeline:', error);
      throw error;
    }
  }

  async evaluateAIExplanation(aiExplanation : AIExplanation){

    // we want to check the storage, access and why sections match the relevant privacy policy sections
    const dataCollectionHypothesis = `${aiExplanation.storage}, ${aiExplanation.access}, ${aiExplanation.why}`;

    // The premise for the privacy risks will be the relevant sections of the privacy policy
    // find each section and then concatenate them to form the premise
    const dataCollectionPremise = aiExplanation.privacyPolicyLink.map((link: string) => {
      const found = findSectionById(privacyPolicyData.privacyPolicySimplified.sections, link);
      return found ? found.content : '';
    }).join(', ');

    const dataCollectionNLIResult = await this.performNLI(JSON.stringify(dataCollectionPremise, null, 2), dataCollectionHypothesis);

     // we want to match the privacyExplanation to the relevant PIPEDA principle
     // The privacyExplanation does contain some text that is not found in the PIPEDA principle, so it may cause more neutral results. 
    const privacyExplanationHypothesis = aiExplanation.privacyExplanation;

    const privacyExplanationPremise = aiExplanation.regulationLink.map((link: string) => {
      const pipedaSection = findSectionById(privacyRegulations.pipeda.keyPrinciples, link);
      return pipedaSection ? pipedaSection.description : '';
    }).join(', ');

    const privacyExplanationNLIResult = await this.performNLI(JSON.stringify(privacyExplanationPremise, null, 2), privacyExplanationHypothesis);
    
    const getFirstScore = (result: any) => {
      if (Array.isArray(result)) {
        return result[0]?.scores?.[0];
      }
      return result?.scores?.[0];
    };
    return [getFirstScore(dataCollectionNLIResult), getFirstScore(privacyExplanationNLIResult)];
  }

  async performNLI(premise : string, hypothesis : string) {
    try {
      const result = await this.classifier(premise, [hypothesis]);
      console.log('NLI Result:', result);
      return result;
    } catch (error : any) {
      console.error('Error during NLI evaluation:', error);
      throw error;
    }
  }
}


// Helper function to recursively find any section in the privacy policy and regulations json by its id
function findSectionById(obj: any, targetId: string): any | null {
  // Base case: if the current object has an id that matches, return it.
  if (typeof obj === 'object' && obj !== null && 'id' in obj && obj.id) {
    if (obj.id.toLowerCase().includes(targetId.toLowerCase())) {
      return obj;
    }
  }

  // Recursive case: iterate through the object's properties.
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === 'object' && obj[key] !== null) {
      const found = findSectionById(obj[key], targetId);
      if (found) {
        return found; // If a match is found in a nested object, return it.
      }
    }
  }

  // No match found in this object or its sub-objects.
  return null;
}