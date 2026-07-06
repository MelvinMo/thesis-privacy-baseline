import { syllable } from "syllable";

/**
 * Calculate Flesch-Kincaid Grade Level
 * Formula: 0.39 × (average sentence length) + 11.8 × (average syllables per word) - 15.59
 * Lower scores indicate easier readability
 */
export function calculateFleschKincaid(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Clean and normalize text
  const cleanText = text.replace(/[^\w\s\.!?]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Count sentences (split by periods, exclamation marks, question marks)
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  if (sentenceCount === 0) return 0;
  
  // Count words
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  if (wordCount === 0) return 0;
  
  // Count syllables
  let syllableCount = 0;
  for (const word of words) {
    syllableCount += syllable(word);
  }
  
  // Calculate average sentence length and average syllables per word
  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;
  
  // Flesch-Kincaid formula
  const score = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;
  
  return Math.round(score * 100) / 100;
}