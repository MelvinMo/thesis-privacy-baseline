/**
 * Short script used for preliminary testing of how NLI works and what kind of outputs it produces for different premises/hypotheses.
 */

import { AIExplanation } from "../../src/constants/types/Transparency";
import { NLIEvaluator } from "./nliEvaluator";

export async function runNLIEvaluation() {
  try {
    const nliEvaluator = await NLIEvaluator.create();
    const aiExplanation: AIExplanation = {
      why: "This data is collected to improve user experience and provide personalized services.",
      storage: "Data is stored securely in encrypted databases with access controls.",
      access: "Only authorized personnel have access to the data.",
      privacyExplanation: "The data handling practices comply with PIPEDA regulations.",
      privacyPolicyLink: ['dataSharing'],
      regulationLink: ['consent']
    };
    await nliEvaluator.evaluateAIExplanation(aiExplanation);
	} catch (error: any) {
			console.error('Error during NLI evaluation:', error);
	}
}

runNLIEvaluation();