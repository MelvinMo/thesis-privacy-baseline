/**
 * The word frequencies zipf values are from the SUBTLEX-US corpus.
 * The Excel file was downloaded from this website: https://www.ugent.be/pp/experimentele-psychologie/en/research/documents/subtlexus 
 * and converted to JSON
 */

import WORD_FREQUENCIES from "../../word_frequencies.json";

const frequencies: { [key: string]: number } = WORD_FREQUENCIES;

/**
 * Calculate Word Familiarity Score based on corpus frequency
 * Returns a zipf value between 1 and 7, where 1 is very rare and 7 is very common
 */
export function analyzeWordFrequency(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Clean and tokenize text
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) {
    return 0;
  }
  
  // Calculate weighted average frequency
  let totalWeightedFreq = 0;
  let totalWords = 0;
  
  for (const word of words) {
    // Get frequency from database (default to 1 for unknown words)
    const frequency = frequencies[word] || 1.0;
    totalWeightedFreq += frequency;
    totalWords++;
  }
  
  if (totalWords === 0) {
    return 0;
  }

  /**
   * Returning an unweighted average is not ideal.
   * It would have been better to use a harmonic mean to punish rare words more or weigh by word length.
   */
  const averageFrequency = totalWeightedFreq / totalWords;
	return averageFrequency;
}