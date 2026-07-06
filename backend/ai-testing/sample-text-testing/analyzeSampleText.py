'''
    Simple script to analyze the sample text data and determine correlations
'''

import pandas as pd

def calculate_correlations():
    """
    Reads the CSV file, calculates the specified correlations, and
    prints them to the console, and saves them to a new CSV file.
    """
    try:
        # Load the CSV file into a pandas DataFrame
        df = pd.read_csv('sampleTextTest.csv')
        
        # Calculate correlations
        corr_wc_nli = df['WordCount'].corr(df['NLI_Score'])
        corr_wc_flesch = df['WordCount'].corr(df['FleschKincaid'])
        corr_wc_wordfreq = df['WordCount'].corr(df['WordFrequencyScore'])
        corr_nli_wordfreq = df['NLI_Score'].corr(df['WordFrequencyScore'])
        corr_nli_flesch = df['NLI_Score'].corr(df['FleschKincaid'])
        
        # Print correlations to the console
        print("--- Correlations Report ---")
        print(f"Correlation between Word Count and NLI Score: {corr_wc_nli:.3f}")
        print(f"Correlation between Word Count and Flesch-Kincaid Score: {corr_wc_flesch:.3f}")
        print(f"Correlation between Word Count and Word Frequency Score: {corr_wc_wordfreq:.3f}")
        print(f"Correlation between NLI Score and Word Frequency Score: {corr_nli_wordfreq:.3f}")
        print(f"Correlation between NLI Score and Flesch-Kincaid Score: {corr_nli_flesch:.3f}")

        # Store correlations in a new DataFrame
        correlations_data = {
            'Correlation Pair': [
                'Word Count vs. NLI Score',
                'Word Count vs. Flesch-Kincaid Score',
                'Word Count vs. Word Frequency Score',
                'NLI Score vs. Word Frequency Score',
                'NLI Score vs. Flesch-Kincaid Score'
            ],
            'Correlation Value': [
                corr_wc_nli,
                corr_wc_flesch,
                corr_wc_wordfreq,
                corr_nli_wordfreq,
                corr_nli_flesch
            ]
        }
        
        correlations_df = pd.DataFrame(correlations_data)
        
        # Save the new DataFrame to a CSV file
        correlations_df.to_csv('correlations_report.csv', index=False)
        print("\nCorrelations successfully saved to 'correlations_report.csv'.")
        
    except FileNotFoundError:
        print("Error: 'sampleTextTest.csv' not found.")
        print("Please ensure you have run your TypeScript script to generate the file.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    calculate_correlations()