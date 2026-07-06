"""
This script was used for the early trials when multiple prompt types were part of the experiment.
May be useful for future experiments with multiple prompt types.
Privacy Experiment Data Aggregator
Calculates comprehensive aggregate statistics from raw experiment data.
"""

import pandas as pd
import numpy as np
import sys
import os
from pathlib import Path

def load_and_clean_data(filepath):
    """Load CSV data and handle missing values."""
    try:
        df = pd.read_csv(filepath)
        print(f"Loaded {len(df)} rows from {filepath}")
        
        # Convert N/A strings to NaN for proper handling
        df = df.replace('N/A', np.nan)
        
        # Convert numeric columns to proper types
        numeric_columns = ['TargetLength', 'ActualWordCount', 'NLI_DataCollection', 
                          'NLI_PrivacyExplanation', 'NLI_AverageScore', 
                          'FleschKincaid', 'ColemanLiau', 'WordFrequencyScore']
        
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        return df
        
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def calculate_basic_stats(df, group_cols, metrics):
    """Calculate mean, std, count for specified metrics."""
    stats = []
    
    # Handle case where no grouping columns are provided (overall stats)
    if not group_cols:
        row = {}
        row['SampleSize'] = len(df)
        
        for metric in metrics:
            if metric in df.columns:
                values = df[metric].dropna()
                row[f'Mean_{metric}'] = values.mean() if len(values) > 0 else np.nan
                row[f'Std_{metric}'] = values.std() if len(values) > 0 else np.nan
            else:
                row[f'Mean_{metric}'] = np.nan
                row[f'Std_{metric}'] = np.nan
                
        stats.append(row)
    else:
        # Normal grouping case
        for group_name, group_df in df.groupby(group_cols):
            if isinstance(group_name, tuple):
                group_dict = dict(zip(group_cols, group_name))
            else:
                group_dict = {group_cols[0]: group_name}
            
            row = group_dict.copy()
            row['SampleSize'] = len(group_df)
            
            for metric in metrics:
                if metric in group_df.columns:
                    values = group_df[metric].dropna()
                    row[f'Mean_{metric}'] = values.mean() if len(values) > 0 else np.nan
                    row[f'Std_{metric}'] = values.std() if len(values) > 0 else np.nan
                else:
                    row[f'Mean_{metric}'] = np.nan
                    row[f'Std_{metric}'] = np.nan
                    
            stats.append(row)
    
    return pd.DataFrame(stats)

def create_aggregation_reports(df, output_dir):
    """Create comprehensive aggregation reports."""
    
    metrics = ['ActualWordCount', 'NLI_DataCollection', 'NLI_PrivacyExplanation', 
              'NLI_AverageScore', 'FleschKincaid', 'ColemanLiau', 'WordFrequencyScore']
    
    reports = {}
    
    # 1. By Instruction Type and Target Length
    print(" Calculating aggregates by Instruction Type and Target Length...")
    by_instruction_length = calculate_basic_stats(
        df, ['InstructionType', 'TargetLength'], metrics
    )
    reports['by_instruction_length'] = by_instruction_length
    
    # 2. By Instruction Type (Overall)
    print(" Calculating aggregates by Instruction Type...")
    by_instruction = calculate_basic_stats(
        df, ['InstructionType'], metrics
    )
    reports['by_instruction'] = by_instruction
    
    # 3. Overall Statistics
    print(" Calculating overall statistics...")
    overall = calculate_basic_stats(
        df, [], metrics  # No grouping columns for overall stats
    )
    overall['InstructionType'] = 'Overall'
    reports['overall'] = overall
    
    # 4. By Event Type and Instruction Type
    print(" Calculating aggregates by Event Type and Instruction Type...")
    by_event_instruction = calculate_basic_stats(
        df, ['EventKey', 'InstructionType'], metrics
    )
    reports['by_event_instruction'] = by_event_instruction
    
    # 5. By Event Type (Combined Instructions)
    print(" Calculating aggregates by Event Type (combined)...")
    by_event = calculate_basic_stats(
        df, ['EventKey'], metrics
    )
    reports['by_event'] = by_event
    
    # 6. Length Analysis - How well does actual match target?
    print(" Analyzing length accuracy...")
    df_length_analysis = df.copy()
    df_length_analysis['LengthRatio'] = df_length_analysis['ActualWordCount'] / df_length_analysis['TargetLength']
    df_length_analysis['LengthDifference'] = df_length_analysis['ActualWordCount'] - df_length_analysis['TargetLength']
    df_length_analysis['LengthAccuracy'] = np.abs(df_length_analysis['LengthDifference']) / df_length_analysis['TargetLength']
    
    length_metrics = ['LengthRatio', 'LengthDifference', 'LengthAccuracy']
    length_analysis = calculate_basic_stats(
        df_length_analysis, ['InstructionType', 'TargetLength'], length_metrics
    )
    reports['length_analysis'] = length_analysis
    
    return reports

def save_reports(reports, output_dir, base_filename):
    """Save all reports to CSV files."""
    
    saved_files = []
    
    for report_name, report_df in reports.items():
        if not report_df.empty:
            filename = f"{base_filename}_{report_name}.csv"
            filepath = os.path.join(output_dir, filename)
            
            # Round numeric columns to 4 decimal places for readability
            numeric_columns = report_df.select_dtypes(include=[np.number]).columns
            report_df[numeric_columns] = report_df[numeric_columns].round(4)
            
            report_df.to_csv(filepath, index=False)
            saved_files.append(filepath)
            print(f" Saved {report_name}: {filepath}")
    
    return saved_files

def print_summary_statistics(df):
    """Print key summary statistics to console."""
    
    print("\n" + "="*60)
    print(" SUMMARY STATISTICS")
    print("="*60)
    
    # Overall sample size
    print(f" Total Experiments: {len(df)}")
    print(f" Instruction Types: {df['InstructionType'].nunique()} ({', '.join(df['InstructionType'].unique())})")
    print(f" Event Types: {df['EventKey'].nunique()}")
    print(f" Target Lengths: {df['TargetLength'].nunique()} ({', '.join(map(str, sorted(df['TargetLength'].unique())))})")
    
    # Key metrics by instruction type
    print(f"\n RESULTS BY INSTRUCTION TYPE:")
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        print(f"\n{instruction.upper()}:")
        print(f"  • Sample Size: {len(subset)}")
        print(f"  • Avg Word Count: {subset['ActualWordCount'].mean():.1f}")
        print(f"  • Avg Flesch-Kincaid: {subset['FleschKincaid'].mean():.2f}")
        print(f"  • Avg Coleman-Liau: {subset['ColemanLiau'].mean():.2f}")
        print(f"  • Avg Word Freq: {subset['WordFrequencyScore'].mean():.2f}")
        print(f"  • Avg NLI Data Collection Score: {subset['NLI_DataCollection'].mean():.3f}")
        print(f"  • Avg NLI Privacy Explanation Score: {subset['NLI_PrivacyExplanation'].mean():.3f}")
        print(f"  • Avg NLI Avg Score: {subset['NLI_AverageScore'].mean():.3f}")
    
    # Length adherence
    print(f"\n LENGTH ADHERENCE:")
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        length_ratio = (subset['ActualWordCount'] / subset['TargetLength']).mean()
        print(f"  • {instruction}: {length_ratio:.2f}x target length on average")
    
    # Correlation insights
    print(f"\n KEY CORRELATIONS:")
    numeric_df = df.select_dtypes(include=[np.number])
    
    # Length vs Readability
    if 'ActualWordCount' in numeric_df.columns and 'FleschKincaid' in numeric_df.columns:
        length_readability_corr = numeric_df['ActualWordCount'].corr(numeric_df['FleschKincaid'])
        print(f"  • Length vs Flesch-Kincaid: {length_readability_corr:.3f}")

    # Length vs Word Frequency
    if 'ActualWordCount' in numeric_df.columns and 'WordFrequencyScore' in numeric_df.columns:
        length_wordfreq_corr = numeric_df['ActualWordCount'].corr(numeric_df['WordFrequencyScore'])
        print(f"  • Length vs Word Frequency: {length_wordfreq_corr:.3f}")

    # Length vs NLI
    if 'ActualWordCount' in numeric_df.columns and 'NLI_AverageScore' in numeric_df.columns:
        length_nli_corr = numeric_df['ActualWordCount'].corr(numeric_df['NLI_AverageScore'])
        print(f"  • Length vs NLI Score: {length_nli_corr:.3f}")
    
    # NLI vs Readability
    if 'NLI_AverageScore' in numeric_df.columns and 'FleschKincaid' in numeric_df.columns:
        nli_readability_corr = numeric_df['NLI_AverageScore'].corr(numeric_df['FleschKincaid'])
        print(f"  • NLI Score vs Flesch-Kincaid: {nli_readability_corr:.3f}")

    # NLI vs Word Frequency
    if 'NLI_AverageScore' in numeric_df.columns and 'WordFrequencyScore' in numeric_df.columns:
        nli_wordfreq_corr = numeric_df['NLI_AverageScore'].corr(numeric_df['WordFrequencyScore'])
        print(f"  • NLI Score vs Word Frequency: {nli_wordfreq_corr:.3f}")

def main():
    if len(sys.argv) != 2:
        print(" Usage: python aggregate_results.py <raw_data_csv_path>")
        sys.exit(1)
    
    raw_data_path = sys.argv[1]
    
    if not os.path.exists(raw_data_path):
        print(f" File not found: {raw_data_path}")
        sys.exit(1)
    
    # Load data
    df = load_and_clean_data(raw_data_path)
    if df is None:
        sys.exit(1)
    
    # Setup output directory and base filename
    output_dir = os.path.dirname(raw_data_path)
    base_filename = os.path.splitext(os.path.basename(raw_data_path))[0]
    base_filename = base_filename.replace('_raw', '_aggregated')
    
    # Create aggregation reports
    reports = create_aggregation_reports(df, output_dir)
    
    # Save all reports
    saved_files = save_reports(reports, output_dir, base_filename)
    
    # Print summary to console
    print_summary_statistics(df)
    
    # Final output summary
    print(f"\n AGGREGATION COMPLETE!")
    print(f" Output Directory: {output_dir}")
    print(f" Generated {len(saved_files)} report files:")
    for file in saved_files:
        print(f"   • {os.path.basename(file)}")
    
    print(f"\n Key Files:")
    print(f"   • by_instruction_length.csv - Main results by instruction type and target length")
    print(f"   • by_instruction.csv - Overall results by instruction type") 
    print(f"   • by_event_instruction.csv - Results by event type and instruction")
    print(f"   • length_analysis.csv - How well target lengths were achieved")

if __name__ == "__main__":
    main()