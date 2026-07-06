import { AIExplanation } from "../../src/constants/types/Transparency";
import { calculateColemanLiau } from "./coleman-liau";
import { calculateFleschKincaid } from "./flesch-kincaid";
import { analyzeWordFrequency } from "./word-freq";

export interface ReadabilityMetrics {
	fleschKincaid: number;
	colemanLiau: number;
	wordFrequency: number;
}

/**
 * Comprehensive readability analysis combining all metrics
 * 
 * All 4 fields of the AIExplanation are used as 1 piece of text because the user will see all 4 fields at once and hence t
 * the readability metric should reflect that. 
 */
export function evalReadability(aiExplanation : AIExplanation) : ReadabilityMetrics {
  const fleschKincaid = calculateFleschKincaid(aiExplanation.why + " " + aiExplanation.storage + " " + aiExplanation.access + " " + aiExplanation.privacyExplanation);
  const colemanLiau = calculateColemanLiau(aiExplanation.why + " " + aiExplanation.storage + " " + aiExplanation.access + " " + aiExplanation.privacyExplanation);
  const wordFrequency = analyzeWordFrequency(aiExplanation.why + " " + aiExplanation.storage + " " + aiExplanation.access + " " + aiExplanation.privacyExplanation);

  return {
		fleschKincaid,
		colemanLiau,
		wordFrequency
	};
}