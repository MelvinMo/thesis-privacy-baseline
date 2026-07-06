/**
 * Coleman-Liau was used in the initial trials, but as it was found to be inaccurate, it was removed from consideration.
 *
 * Calculate Coleman-Liau Index
 * Formula: 0.0588 × L - 0.296 × S - 15.8
 * where L = average number of letters per 100 words
 * and S = average number of sentences per 100 words
 */
export function calculateColemanLiau(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Clean text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Count letters (alphabetic characters only)
  const letters = cleanText.match(/[a-zA-Z]/g) || [];
  const letterCount = letters.length;
  
  // Count words
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Count sentences
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  if (wordCount === 0) return 0;
  
  // Calculate L and S per 100 words
  const L = (letterCount / wordCount) * 100;
  const S = (sentenceCount / wordCount) * 100;
  
  // Coleman-Liau formula
  const score = 0.0588 * L - 0.296 * S - 15.8;
  
  return Math.round(score * 100) / 100;
}