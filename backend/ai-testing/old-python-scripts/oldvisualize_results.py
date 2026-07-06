"""
This script was used for the early trials when multiple prompt types were part of the experiment.
May be useful for future experiments with multiple prompt types.
Creates comprehensive visualizations from aggregated experiment data.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import sys
import os
from pathlib import Path
import glob

# Set style for better-looking plots
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

def setup_plot_style():
    """Configure matplotlib for high-quality plots."""
    plt.rcParams['figure.figsize'] = (12, 8)
    plt.rcParams['font.size'] = 11
    plt.rcParams['axes.titlesize'] = 14
    plt.rcParams['axes.labelsize'] = 12
    plt.rcParams['xtick.labelsize'] = 10
    plt.rcParams['ytick.labelsize'] = 10
    plt.rcParams['legend.fontsize'] = 10
    plt.rcParams['figure.titlesize'] = 16

def create_instruction_length_visualizations(df, output_dir, base_name):
    """Create visualizations for by_instruction_length data."""
    
    print(" Creating instruction × length visualizations...")
    
    # 1. All Metrics Comparison (NLI + Readability)
    fig, ((ax1, ax2, ax3), (ax4, ax5, ax6)) = plt.subplots(2, 3, figsize=(20, 12))
    fig.suptitle('All Metrics by Instruction Type and Target Length', fontsize=16, y=0.98)
    
    # NLI Average Score
    df_pivot = df.pivot(index='TargetLength', columns='InstructionType', values='Mean_NLI_AverageScore')
    df_pivot.plot(kind='line', ax=ax1, marker='o', linewidth=2, markersize=8)
    ax1.set_title('NLI Average Score')
    ax1.set_xlabel('Target Length (words)')
    ax1.set_ylabel('NLI Average Score')
    ax1.set_ylim(0, 1)  # Set range 0-1 for NLI
    ax1.legend(title='Instruction Type')
    ax1.grid(True, alpha=0.3)
    
    # NLI Data Collection
    df_pivot = df.pivot(index='TargetLength', columns='InstructionType', values='Mean_NLI_DataCollection')
    df_pivot.plot(kind='line', ax=ax2, marker='s', linewidth=2, markersize=8)
    ax2.set_title('NLI Data Collection Score')
    ax2.set_xlabel('Target Length (words)')
    ax2.set_ylabel('NLI Data Collection Score')
    ax2.set_ylim(0, 1)  # Set range 0-1 for NLI
    ax2.legend(title='Instruction Type')
    ax2.grid(True, alpha=0.3)
    
    # NLI Privacy Explanation
    df_pivot = df.pivot(index='TargetLength', columns='InstructionType', values='Mean_NLI_PrivacyExplanation')
    df_pivot.plot(kind='line', ax=ax3, marker='^', linewidth=2, markersize=8)
    ax3.set_title('NLI Privacy Explanation Score')
    ax3.set_xlabel('Target Length (words)')
    ax3.set_ylabel('NLI Privacy Explanation Score')
    ax3.set_ylim(0, 1)  # Set range 0-1 for NLI
    ax3.legend(title='Instruction Type')
    ax3.grid(True, alpha=0.3)
    
    # Flesch-Kincaid
    df_pivot = df.pivot(index='TargetLength', columns='InstructionType', values='Mean_FleschKincaid')
    df_pivot.plot(kind='line', ax=ax4, marker='D', linewidth=2, markersize=8)
    ax4.set_title('Flesch-Kincaid Reading Ease')
    ax4.set_xlabel('Target Length (words)')
    ax4.set_ylabel('F-K Score')
    ax4.set_ylim(0, 20)  # Set range 0-20 for FK
    ax4.legend(title='Instruction Type')
    ax4.grid(True, alpha=0.3)
    
    # Coleman-Liau
    df_pivot = df.pivot(index='TargetLength', columns='InstructionType', values='Mean_ColemanLiau')
    df_pivot.plot(kind='line', ax=ax5, marker='v', linewidth=2, markersize=8)
    ax5.set_title('Coleman-Liau Index')
    ax5.set_xlabel('Target Length (words)')
    ax5.set_ylabel('C-L Index')
    ax5.set_ylim(0, 20)  # Set range 0-20 for Coleman-Liau
    ax5.legend(title='Instruction Type')
    ax5.grid(True, alpha=0.3)
    
    # Word Frequency
    df_pivot = df.pivot(index='TargetLength', columns='InstructionType', values='Mean_WordFrequencyScore')
    df_pivot.plot(kind='line', ax=ax6, marker='>', linewidth=2, markersize=8)
    ax6.set_title('Word Frequency Score')
    ax6.set_xlabel('Target Length (words)')
    ax6.set_ylabel('Word Frequency Score')
    ax6.set_ylim(0, 7)  # Set range 0-7 for Word Frequency
    ax6.legend(title='Instruction Type')
    ax6.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, f'{base_name}_all_metrics.png'), dpi=300, bbox_inches='tight')
    plt.close()
    
    # 2. Multiple Accuracy vs Readability Trade-offs
    fig, ((ax1, ax2, ax3), (ax4, ax5, ax6), (ax7, ax8, ax9)) = plt.subplots(3, 3, figsize=(20, 16))
    fig.suptitle('Accuracy vs Readability Trade-offs', fontsize=16, y=0.98)
    
    # NLI Average vs all readability metrics
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        
        # NLI Average vs Flesch-Kincaid
        scatter = ax1.scatter(subset['Mean_FleschKincaid'], subset['Mean_NLI_AverageScore'], 
                            s=subset['TargetLength']*3, alpha=0.7, label=instruction)
        for idx, row in subset.iterrows():
            ax1.annotate(f"{row['TargetLength']}w", 
                       (row['Mean_FleschKincaid'], row['Mean_NLI_AverageScore']),
                       xytext=(5, 5), textcoords='offset points', fontsize=9)
    
    ax1.set_xlabel('Flesch-Kincaid Score')
    ax1.set_ylabel('NLI Average Score')
    ax1.set_title('NLI Average vs Flesch-Kincaid')
    ax1.set_xlim(0, 20)
    ax1.set_ylim(0, 1)
    ax1.legend(title='Instruction Type')
    ax1.grid(True, alpha=0.3)
    
    # NLI Average vs Coleman-Liau
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        ax2.scatter(subset['Mean_ColemanLiau'], subset['Mean_NLI_AverageScore'], 
                   s=subset['TargetLength']*3, alpha=0.7, label=instruction)
        for idx, row in subset.iterrows():
            ax2.annotate(f"{row['TargetLength']}w", 
                       (row['Mean_ColemanLiau'], row['Mean_NLI_AverageScore']),
                       xytext=(5, 5), textcoords='offset points', fontsize=9)
    
    ax2.set_xlabel('Coleman-Liau Score')
    ax2.set_ylabel('NLI Average Score')
    ax2.set_title('NLI Average vs Coleman-Liau')
    ax2.set_xlim(0, 20)
    ax2.set_ylim(0, 1)
    ax2.legend(title='Instruction Type')
    ax2.grid(True, alpha=0.3)
    
    # NLI Average vs Word Frequency
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        ax3.scatter(subset['Mean_WordFrequencyScore'], subset['Mean_NLI_AverageScore'], 
                   s=subset['TargetLength']*3, alpha=0.7, label=instruction)
        for idx, row in subset.iterrows():
            ax3.annotate(f"{row['TargetLength']}w", 
                       (row['Mean_WordFrequencyScore'], row['Mean_NLI_AverageScore']),
                       xytext=(5, 5), textcoords='offset points', fontsize=9)
    
    ax3.set_xlabel('Word Frequency Score')
    ax3.set_ylabel('NLI Average Score')
    ax3.set_title('NLI Average vs Word Frequency')
    ax3.set_xlim(0, 7)
    ax3.set_ylim(0, 1)
    ax3.legend(title='Instruction Type')
    ax3.grid(True, alpha=0.3)
    
    # NLI Data Collection vs all readability metrics
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        
        # NLI Data Collection vs Flesch-Kincaid
        ax4.scatter(subset['Mean_FleschKincaid'], subset['Mean_NLI_DataCollection'], 
                   s=subset['TargetLength']*3, alpha=0.7, label=instruction)
        for idx, row in subset.iterrows():
            ax4.annotate(f"{row['TargetLength']}w", 
                       (row['Mean_FleschKincaid'], row['Mean_NLI_DataCollection']),
                       xytext=(5, 5), textcoords='offset points', fontsize=9)
    
    ax4.set_xlabel('Flesch-Kincaid Score')
    ax4.set_ylabel('NLI Data Collection Score')
    ax4.set_title('NLI Data Collection vs Flesch-Kincaid')
    ax4.set_xlim(0, 20)
    ax4.set_ylim(0, 1)
    ax4.legend(title='Instruction Type')
    ax4.grid(True, alpha=0.3)
    
    # NLI Data Collection vs Coleman-Liau
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        ax5.scatter(subset['Mean_ColemanLiau'], subset['Mean_NLI_DataCollection'], 
                   s=subset['TargetLength']*3, alpha=0.7, label=instruction)
        for idx, row in subset.iterrows():
            ax5.annotate(f"{row['TargetLength']}w", 
                       (row['Mean_ColemanLiau'], row['Mean_NLI_DataCollection']),
                       xytext=(5, 5), textcoords='offset points', fontsize=9)
    
    ax5.set_xlabel('Coleman-Liau Score')
    ax5.set_ylabel('NLI Data Collection Score')
    ax5.set_title('NLI Data Collection vs Coleman-Liau')
    ax5.set_xlim(0, 20)
    ax5.set_ylim(0, 1)
    ax5.legend(title='Instruction Type')
    ax5.grid(True, alpha=0.3)
    
    # NLI Data Collection vs Word Frequency
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        ax6.scatter(subset['Mean_WordFrequencyScore'], subset['Mean_NLI_DataCollection'], 
                   s=subset['TargetLength']*3, alpha=0.7, label=instruction)
        for idx, row in subset.iterrows():
            ax6.annotate(f"{row['TargetLength']}w", 
                       (row['Mean_WordFrequencyScore'], row['Mean_NLI_DataCollection']),
                       xytext=(5, 5), textcoords='offset points', fontsize=9)
    
    ax6.set_xlabel('Word Frequency Score')
    ax6.set_ylabel('NLI Data Collection Score')
    ax6.set_title('NLI Data Collection vs Word Frequency')
    ax6.set_xlim(0, 7)
    ax6.set_ylim(0, 1)
    ax6.legend(title='Instruction Type')
    ax6.grid(True, alpha=0.3)
    
    # NLI Privacy Explanation vs all readability metrics
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        
        # NLI Privacy vs Flesch-Kincaid
        ax7.scatter(subset['Mean_FleschKincaid'], subset['Mean_NLI_PrivacyExplanation'], 
                   s=subset['TargetLength']*3, alpha=0.7, label=instruction)
        for idx, row in subset.iterrows():
            ax7.annotate(f"{row['TargetLength']}w", 
                       (row['Mean_FleschKincaid'], row['Mean_NLI_PrivacyExplanation']),
                       xytext=(5, 5), textcoords='offset points', fontsize=9)
    
    ax7.set_xlabel('Flesch-Kincaid Score')
    ax7.set_ylabel('NLI Privacy Explanation Score')
    ax7.set_title('NLI Privacy vs Flesch-Kincaid')
    ax7.set_xlim(0, 20)
    ax7.set_ylim(0, 1)
    ax7.legend(title='Instruction Type')
    ax7.grid(True, alpha=0.3)
    
    # NLI Privacy vs Coleman-Liau
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        ax8.scatter(subset['Mean_ColemanLiau'], subset['Mean_NLI_PrivacyExplanation'], 
                   s=subset['TargetLength']*3, alpha=0.7, label=instruction)
        for idx, row in subset.iterrows():
            ax8.annotate(f"{row['TargetLength']}w", 
                       (row['Mean_ColemanLiau'], row['Mean_NLI_PrivacyExplanation']),
                       xytext=(5, 5), textcoords='offset points', fontsize=9)
    
    ax8.set_xlabel('Coleman-Liau Score')
    ax8.set_ylabel('NLI Privacy Explanation Score')
    ax8.set_title('NLI Privacy vs Coleman-Liau')
    ax8.set_xlim(0, 20)
    ax8.set_ylim(0, 1)
    ax8.legend(title='Instruction Type')
    ax8.grid(True, alpha=0.3)
    
    # NLI Privacy vs Word Frequency
    for instruction in df['InstructionType'].unique():
        subset = df[df['InstructionType'] == instruction]
        ax9.scatter(subset['Mean_WordFrequencyScore'], subset['Mean_NLI_PrivacyExplanation'], 
                   s=subset['TargetLength']*3, alpha=0.7, label=instruction)
        for idx, row in subset.iterrows():
            ax9.annotate(f"{row['TargetLength']}w", 
                       (row['Mean_WordFrequencyScore'], row['Mean_NLI_PrivacyExplanation']),
                       xytext=(5, 5), textcoords='offset points', fontsize=9)
    
    ax9.set_xlabel('Word Frequency Score')
    ax9.set_ylabel('NLI Privacy Explanation Score')
    ax9.set_title('NLI Privacy vs Word Frequency')
    ax9.set_xlim(0, 7)
    ax9.set_ylim(0, 1)
    ax9.legend(title='Instruction Type')
    ax9.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, f'{base_name}_accuracy_readability_tradeoffs.png'), dpi=300, bbox_inches='tight')
    plt.close()

def create_event_analysis_visualizations(df, output_dir, base_name, by_instruction=True):
    """Create visualizations for event-based data."""
    
    title_suffix = "by Event Type and Instruction" if by_instruction else "by Event Type (Combined)"
    print(f" Creating event analysis visualizations {title_suffix.lower()}...")
    
    # Performance by Event Type - All NLI and Readability Metrics
    fig, ((ax1, ax2, ax3), (ax4, ax5, ax6)) = plt.subplots(2, 3, figsize=(24, 16))
    fig.suptitle(f'Performance Metrics {title_suffix}', fontsize=16, y=0.98)
    
    if by_instruction:
        # Group by event and instruction
        event_order = df.groupby('EventKey')['Mean_NLI_AverageScore'].mean().sort_values(ascending=False).index
        
        # NLI Average Score by Event and Instruction
        pivot_data = df.pivot(index='EventKey', columns='InstructionType', values='Mean_NLI_AverageScore')
        pivot_data = pivot_data.reindex(event_order)
        pivot_data.plot(kind='bar', ax=ax1, width=0.8)
        ax1.set_title('NLI Average Score by Event Type')
        ax1.set_xlabel('Event Type')
        ax1.set_ylabel('NLI Average Score')
        ax1.set_ylim(0, 1)
        ax1.legend(title='Instruction Type')
        ax1.tick_params(axis='x', rotation=45)
        ax1.grid(True, alpha=0.3)
        
        # NLI Data Collection by Event and Instruction
        pivot_data = df.pivot(index='EventKey', columns='InstructionType', values='Mean_NLI_DataCollection')
        pivot_data = pivot_data.reindex(event_order)
        pivot_data.plot(kind='bar', ax=ax2, width=0.8)
        ax2.set_title('NLI Data Collection Score by Event Type')
        ax2.set_xlabel('Event Type')
        ax2.set_ylabel('NLI Data Collection Score')
        ax2.set_ylim(0, 1)
        ax2.legend(title='Instruction Type')
        ax2.tick_params(axis='x', rotation=45)
        ax2.grid(True, alpha=0.3)
        
        # NLI Privacy Explanation by Event and Instruction
        pivot_data = df.pivot(index='EventKey', columns='InstructionType', values='Mean_NLI_PrivacyExplanation')
        pivot_data = pivot_data.reindex(event_order)
        pivot_data.plot(kind='bar', ax=ax3, width=0.8)
        ax3.set_title('NLI Privacy Explanation Score by Event Type')
        ax3.set_xlabel('Event Type')
        ax3.set_ylabel('NLI Privacy Explanation Score')
        ax3.set_ylim(0, 1)
        ax3.legend(title='Instruction Type')
        ax3.tick_params(axis='x', rotation=45)
        ax3.grid(True, alpha=0.3)
        
        # Flesch-Kincaid by Event and Instruction
        pivot_data = df.pivot(index='EventKey', columns='InstructionType', values='Mean_FleschKincaid')
        pivot_data = pivot_data.reindex(event_order)
        pivot_data.plot(kind='bar', ax=ax4, width=0.8)
        ax4.set_title('Flesch-Kincaid Score by Event Type')
        ax4.set_xlabel('Event Type')
        ax4.set_ylabel('F-K Score')
        ax4.set_ylim(0, 20)
        ax4.legend(title='Instruction Type')
        ax4.tick_params(axis='x', rotation=45)
        ax4.grid(True, alpha=0.3)
        
        # Coleman-Liau by Event and Instruction
        pivot_data = df.pivot(index='EventKey', columns='InstructionType', values='Mean_ColemanLiau')
        pivot_data = pivot_data.reindex(event_order)
        pivot_data.plot(kind='bar', ax=ax5, width=0.8)
        ax5.set_title('Coleman-Liau Score by Event Type')
        ax5.set_xlabel('Event Type')
        ax5.set_ylabel('C-L Score')
        ax5.set_ylim(0, 20)
        ax5.legend(title='Instruction Type')
        ax5.tick_params(axis='x', rotation=45)
        ax5.grid(True, alpha=0.3)
        
        # Word Frequency by Event and Instruction
        pivot_data = df.pivot(index='EventKey', columns='InstructionType', values='Mean_WordFrequencyScore')
        pivot_data = pivot_data.reindex(event_order)
        pivot_data.plot(kind='bar', ax=ax6, width=0.8)
        ax6.set_title('Word Frequency Score by Event Type')
        ax6.set_xlabel('Event Type')
        ax6.set_ylabel('Word Frequency Score')
        ax6.set_ylim(0, 7)
        ax6.legend(title='Instruction Type')
        ax6.tick_params(axis='x', rotation=45)
        ax6.grid(True, alpha=0.3)
        
    else:
        # Single instruction analysis
        event_order = df.sort_values('Mean_NLI_AverageScore', ascending=False)['EventKey']
        
        # Bar plots for combined data
        ax1.bar(event_order, df.sort_values('Mean_NLI_AverageScore', ascending=False)['Mean_NLI_AverageScore'])
        ax1.set_title('NLI Average Score by Event Type')
        ax1.set_xlabel('Event Type')
        ax1.set_ylabel('NLI Average Score')
        ax1.set_ylim(0, 1)
        ax1.tick_params(axis='x', rotation=45)
        ax1.grid(True, alpha=0.3)
        
        ax2.bar(event_order, df.sort_values('Mean_NLI_AverageScore', ascending=False)['Mean_NLI_DataCollection'])
        ax2.set_title('NLI Data Collection Score by Event Type')
        ax2.set_xlabel('Event Type')
        ax2.set_ylabel('NLI Data Collection Score')
        ax2.set_ylim(0, 1)
        ax2.tick_params(axis='x', rotation=45)
        ax2.grid(True, alpha=0.3)
        
        ax3.bar(event_order, df.sort_values('Mean_NLI_AverageScore', ascending=False)['Mean_NLI_PrivacyExplanation'])
        ax3.set_title('NLI Privacy Explanation Score by Event Type')
        ax3.set_xlabel('Event Type')
        ax3.set_ylabel('NLI Privacy Explanation Score')
        ax3.set_ylim(0, 1)
        ax3.tick_params(axis='x', rotation=45)
        ax3.grid(True, alpha=0.3)
        
        ax4.bar(event_order, df.sort_values('Mean_NLI_AverageScore', ascending=False)['Mean_FleschKincaid'])
        ax4.set_title('Flesch-Kincaid Score by Event Type')
        ax4.set_xlabel('Event Type')
        ax4.set_ylabel('F-K Score')
        ax4.set_ylim(0, 20)
        ax4.tick_params(axis='x', rotation=45)
        ax4.grid(True, alpha=0.3)
        
        ax5.bar(event_order, df.sort_values('Mean_NLI_AverageScore', ascending=False)['Mean_ColemanLiau'])
        ax5.set_title('Coleman-Liau Score by Event Type')
        ax5.set_xlabel('Event Type')
        ax5.set_ylabel('C-L Score')
        ax5.set_ylim(0, 20)
        ax5.tick_params(axis='x', rotation=45)
        ax5.grid(True, alpha=0.3)
        
        ax6.bar(event_order, df.sort_values('Mean_NLI_AverageScore', ascending=False)['Mean_WordFrequencyScore'])
        ax6.set_title('Word Frequency Score by Event Type')
        ax6.set_xlabel('Event Type')
        ax6.set_ylabel('Word Frequency Score')
        ax6.set_ylim(0, 7)
        ax6.tick_params(axis='x', rotation=45)
        ax6.grid(True, alpha=0.3)
    
    plt.tight_layout()
    suffix = "event_instruction" if by_instruction else "event_combined"
    plt.savefig(os.path.join(output_dir, f'{base_name}_{suffix}_analysis.png'), dpi=300, bbox_inches='tight')
    plt.close()

def process_all_csv_files(base_path):
    """Process all CSV files and create visualizations."""
    
    setup_plot_style()
    
    base_dir = os.path.dirname(base_path)
    base_filename = os.path.splitext(os.path.basename(base_path))[0]
    base_filename = base_filename.replace('_raw', '_aggregated')
    
    # Find all related CSV files
    csv_files = glob.glob(os.path.join(base_dir, f"{base_filename}_*.csv"))
    
    if not csv_files:
        print(f" No CSV files found matching pattern: {base_filename}_*.csv")
        return
    
    print(f"Found {len(csv_files)} CSV files to visualize")
    
    # Create output directory for visualizations
    viz_dir = os.path.join(base_dir, 'visualizations')
    os.makedirs(viz_dir, exist_ok=True)
    
    for csv_file in csv_files:
        filename = os.path.basename(csv_file)
        file_type = filename.replace(f"{base_filename}_", "").replace(".csv", "")
        
        print(f"\nProcessing: {filename}")
        
        try:
            df = pd.read_csv(csv_file)
            
            if df.empty:
                print(f"Skipping empty file: {filename}")
                continue
            
            viz_base_name = f"{base_filename}_{file_type}"
            
            if file_type == "by_instruction_length":
                create_instruction_length_visualizations(df, viz_dir, viz_base_name)
            
            elif file_type == "by_event_instruction":
                create_event_analysis_visualizations(df, viz_dir, viz_base_name, by_instruction=True)
                
            elif file_type == "by_event":
                create_event_analysis_visualizations(df, viz_dir, viz_base_name, by_instruction=False)
                
            else:
                print(f"Unknown file type: {file_type}, skipping visualization")
                continue
                
            print(f" Created visualizations for {file_type}")
            
        except Exception as e:
            print(f" Error processing {filename}: {e}")
            continue
    
    print(f"\nVISUALIZATION COMPLETE!")
    print(f"All visualizations saved to: {viz_dir}")
    print(f" Generated comprehensive charts for all data perspectives")

def main():
    if len(sys.argv) != 2:
        print("Usage: python visualize_results.py <base_csv_path>")
        print("Example: python visualize_results.py privacy_experiment_raw_2025-08-07.csv")
        sys.exit(1)
    
    base_path = sys.argv[1]
    
    if not os.path.exists(base_path):
        print(f"Base file not found: {base_path}")
        sys.exit(1)
    
    process_all_csv_files(base_path)

if __name__ == "__main__":
    main()