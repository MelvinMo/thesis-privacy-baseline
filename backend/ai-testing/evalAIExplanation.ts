import 'dotenv/config'; // this was imported so that env variables do not have to be set up manually in terminal but it still does not work

import { RegulatoryFramework } from '../src/constants/types/Transparency';
import { GeminiLLMService } from '../src/llm/GeminiLLMService';
import { testEvents } from './test-events';
import privacyPolicyData from '../privacyPolicyData.json';
import privacyRegulations from '../privacyRegulations.json';
import { createPrivacyAnalysisPrompt } from '../src/llm/prompts';
import { evalReadability } from './readability/evalReadability';
import { NLIEvaluator } from './consistency/nliEvaluator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This is the main script for running the logical consistency vs length vs readability experiments. 
 * It evaluates how the length of the AI-generated explanations affects their readability and consistency with privacy policies and regulations.
 * 
 * Raw results are stored in a csv file in a test-results folder. 
 * 
 */

// Single instruction focusing on readability
// This can be turned into a list of instructions to test out different kinds of instructions
const instruction = "Provide your analysis in clear, concise, user-friendly language that a non-technical person can understand. Replace complex legal and technical jargon with simple explanations that the average middle schooler can grasp.";

const promptLength: number[] = [15, 20, 25, 30, 40, 50];

interface ExperimentResult {
    eventKey: string;
    targetLength: number;
    actualWordCount: number;
    nliDataCollection: number;
    nliPrivacyExplanation: number;
    nliAverageScore: number;
    fleschKincaid: number;
    wordFrequencyScore: number;
}

function createCSVHeaders(): string {
    return 'EventKey,TargetLength,ActualWordCount,NLI_DataCollection,NLI_PrivacyExplanation,NLI_AverageScore,FleschKincaid,WordFrequencyScore';
}

function resultToCSVRow(result: ExperimentResult): string {
    return [
        result.eventKey,
        result.targetLength,
        result.actualWordCount.toFixed(1),
        isNaN(result.nliDataCollection) ? 'N/A' : result.nliDataCollection.toFixed(3),
        isNaN(result.nliPrivacyExplanation) ? 'N/A' : result.nliPrivacyExplanation.toFixed(3),
        isNaN(result.nliAverageScore) ? 'N/A' : result.nliAverageScore.toFixed(3),
        result.fleschKincaid.toFixed(2),
        result.wordFrequencyScore.toFixed(2)
    ].join(',');
}

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

async function runEval() {
    const llmService = new GeminiLLMService();
    const nliEvaluator = await NLIEvaluator.create();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rawDataFileName = `readability_length_exp_raw_${timestamp}.csv`;
    const rawDataPath = path.join(__dirname, 'test-results', rawDataFileName);

    // Ensure results directory exists
    const resultsDir = path.dirname(rawDataPath);
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }

    fs.writeFileSync(rawDataPath, createCSVHeaders() + '\n');
    
    let totalExperiments = 0;
    let completedExperiments = 0;
    
    // Calculate total experiments for progress tracking
    for (const length of promptLength) {
        totalExperiments += testEvents.size;
    }
    
    console.log(`Starting ${totalExperiments} experiments...`);
    console.log(`Raw data will be saved to: ${rawDataPath}`);

    for (const length of promptLength) {
        console.log(`\n=== Processing target length ${length} words ===`);
        
        for (const [eventKey, testEvent] of testEvents) {
            try {
                const prompt = createPrivacyAnalysisPrompt(
                    testEvent[0],
                    JSON.stringify(privacyPolicyData.privacyPolicy),
                    testEvent[1],
                    [RegulatoryFramework.PIPEDA],
                    JSON.stringify(privacyRegulations.pipeda),
                    instruction,
                    length 
                );
                
                console.log(`Processing event: ${eventKey} (${++completedExperiments}/${totalExperiments})`);
                
                const updatedTransparencyEvent = await llmService.analyzePrivacyRisks(
                    testEvent[0],
                    prompt
                );

                // if there was a gemini error, do not include that test case
                if (updatedTransparencyEvent.aiExplanation?.storage === 'Not currently available'){
                    console.log(`Gemini error for event: ${eventKey} - skipping`);
                    continue;
                }
                        
                const nliScores = await nliEvaluator.evaluateAIExplanation(updatedTransparencyEvent.aiExplanation!);
                const readabilityMetrics = evalReadability(updatedTransparencyEvent.aiExplanation!);
                
                // Calculate actual response length
                const fullResponse = [
                    updatedTransparencyEvent.aiExplanation!.storage || '',
                    updatedTransparencyEvent.aiExplanation!.access || '',
                    updatedTransparencyEvent.aiExplanation!.why || '',
                    updatedTransparencyEvent.aiExplanation!.privacyExplanation || ''
                ].join(' ').trim();
                
                // Approximate words per explanation field, this is not the ideal way to calculate word count but it works for now
                const actualWordCount = countWords(fullResponse) / 4;
                
                // Calculate NLI average (handle NaN values)
                // Not taking a weighted average because they are both equally important to the overall consistency
                const validNliScores = nliScores.filter(score => !isNaN(score));
                const nliAverageScore = validNliScores.length > 0 
                    ? validNliScores.reduce((sum, score) => sum + score, 0) / validNliScores.length 
                    : NaN;
                
                const result: ExperimentResult = {
                    eventKey,
                    targetLength: length,
                    actualWordCount,
                    nliDataCollection: nliScores[0] || NaN,
                    nliPrivacyExplanation: nliScores[1] || NaN,
                    nliAverageScore,
                    fleschKincaid: readabilityMetrics.fleschKincaid,
                    wordFrequencyScore: readabilityMetrics.wordFrequency
                };
                
                // Append result to CSV
                fs.appendFileSync(rawDataPath, resultToCSVRow(result) + '\n');
                
                console.log(`Completed - Words: ${actualWordCount.toFixed(1)}/${length}, NLI: [${nliScores[0]?.toFixed(3) || 'N/A'}, ${nliScores[1]?.toFixed(3) || 'N/A'}], AverageNLI: ${nliAverageScore.toFixed(3)}, FK: ${readabilityMetrics.fleschKincaid.toFixed(1)}, WordFreq: ${readabilityMetrics.wordFrequency.toFixed(1)}`);
            } catch (error: any) {
                console.error(`Error processing event: ${eventKey} - ${error.message}`);
            }
        }
    }

    console.log(`\nAll experiments completed! Raw data saved to: ${rawDataPath}`);
    console.log(`Total experiments: ${completedExperiments}/${totalExperiments}`);
}

runEval();