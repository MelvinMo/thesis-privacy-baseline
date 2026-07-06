"""
This script was used for the early trials when multiple prompt types were part of the experiment.
May be useful for future experiments with multiple prompt types.
Length-Controlled Correlation Analysis
Calculates and visualizes accuracy vs readability correlations within each length category.
"""

import pandas as pd
import numpy as np
import sys
import os
import matplotlib.pyplot as plt
import seaborn as sns

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

def calculate_length_controlled_correlations(df):
    """Calculate accuracy vs readability correlations within each length category."""
    
    results = []
    
    # Get unique target lengths
    target_lengths = sorted(df['TargetLength'].dropna().unique())
    
    for length in target_lengths:
        # Filter data for this length
        length_df = df[df['TargetLength'] == length].copy()
        
        if len(length_df) < 3:  # Need at least 3 points for meaningful correlation
            print(f"Warning: Only {len(length_df)} samples for length {length}, skipping correlation")
            continue
            
        # Calculate correlations between NLI_AverageScore and readability metrics
        correlations = {}
        
        # NLI vs Flesch-Kincaid
        if 'NLI_AverageScore' in length_df.columns and 'FleschKincaid' in length_df.columns:
            valid_data = length_df[['NLI_AverageScore', 'FleschKincaid']].dropna()
            if len(valid_data) >= 3:
                correlations['NLI_vs_Flesch'] = valid_data['NLI_AverageScore'].corr(valid_data['FleschKincaid'])
            else:
                correlations['NLI_vs_Flesch'] = np.nan
        
        # NLI vs Word Frequency
        if 'NLI_AverageScore' in length_df.columns and 'WordFrequencyScore' in length_df.columns:
            valid_data = length_df[['NLI_AverageScore', 'WordFrequencyScore']].dropna()
            if len(valid_data) >= 3:
                correlations['NLI_vs_WordFreq'] = valid_data['NLI_AverageScore'].corr(valid_data['WordFrequencyScore'])
            else:
                correlations['NLI_vs_WordFreq'] = np.nan
        
        # Also calculate by instruction type within this length
        for instruction in length_df['InstructionType'].unique():
            inst_df = length_df[length_df['InstructionType'] == instruction]
            
            if len(inst_df) < 3:
                continue
                
            inst_correlations = {}
            
            # NLI vs Flesch-Kincaid for this instruction type
            if 'NLI_AverageScore' in inst_df.columns and 'FleschKincaid' in inst_df.columns:
                valid_data = inst_df[['NLI_AverageScore', 'FleschKincaid']].dropna()
                if len(valid_data) >= 3:
                    inst_correlations[f'NLI_vs_Flesch_{instruction}'] = valid_data['NLI_AverageScore'].corr(valid_data['FleschKincaid'])
                else:
                    inst_correlations[f'NLI_vs_Flesch_{instruction}'] = np.nan
            
            # NLI vs Word Frequency for this instruction type
            if 'NLI_AverageScore' in inst_df.columns and 'WordFrequencyScore' in inst_df.columns:
                valid_data = inst_df[['NLI_AverageScore', 'WordFrequencyScore']].dropna()
                if len(valid_data) >= 3:
                    inst_correlations[f'NLI_vs_WordFreq_{instruction}'] = valid_data['NLI_AverageScore'].corr(valid_data['WordFrequencyScore'])
                else:
                    inst_correlations[f'NLI_vs_WordFreq_{instruction}'] = np.nan
            
            correlations.update(inst_correlations)
        
        # Add sample size info
        result = {
            'TargetLength': length,
            'SampleSize': len(length_df),
            'SampleSize_Readable': len(length_df[length_df['InstructionType'] == 'readable']) if 'readable' in length_df['InstructionType'].values else 0,
            'SampleSize_Accurate': len(length_df[length_df['InstructionType'] == 'accurate']) if 'accurate' in length_df['InstructionType'].values else 0,
        }
        
        # Add all correlations
        result.update(correlations)
        results.append(result)
    
    return pd.DataFrame(results)

def create_tradeoff_plots(correlation_results, output_dir, base_filename):
    """
    Creates and saves a multi-panel visualization of the trade-offs.
    """
    # Set up the plotting style
    plt.style.use('ggplot')
    sns.set_palette("viridis")
    
    # Create a figure with multiple subplots
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('Accuracy-Readability Trade-offs by Response Length', fontsize=18, fontweight='bold', y=1.02)
    
    lengths = correlation_results['TargetLength'].values
    
    # Plot 1: Overall correlations by length
    ax1 = axes[0, 0]
    ax1.plot(lengths, correlation_results['NLI_vs_Flesch'], 'o-', linewidth=2, markersize=8, label='NLI vs Flesch-Kincaid')
    ax1.plot(lengths, correlation_results['NLI_vs_WordFreq'], 's-', linewidth=2, markersize=8, label='NLI vs Word Frequency')
    ax1.axhline(y=0, color='gray', linestyle='--', alpha=0.7)
    ax1.set_xlabel('Target Length (words)')
    ax1.set_ylabel('Correlation Coefficient')
    ax1.set_title('Overall Trade-off Patterns')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim(-1, 1)

    # Plot 2: NLI vs Flesch-Kincaid by instruction type
    ax2 = axes[0, 1]
    ax2.plot(lengths, correlation_results.get('NLI_vs_Flesch_readable', [np.nan] * len(lengths)), 'o-', linewidth=2, markersize=8, label='Readable Prompt')
    ax2.plot(lengths, correlation_results.get('NLI_vs_Flesch_accurate', [np.nan] * len(lengths)), '^-', linewidth=2, markersize=8, label='Accurate Prompt')
    ax2.axhline(y=0, color='gray', linestyle='--', alpha=0.7)
    ax2.set_xlabel('Target Length (words)')
    ax2.set_ylabel('Correlation Coefficient')
    ax2.set_title('NLI vs Flesch-Kincaid by Prompt Type')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    ax2.set_ylim(-1, 1)

    # Plot 3: NLI vs Word Frequency by instruction type
    ax3 = axes[1, 0]
    ax3.plot(lengths, correlation_results.get('NLI_vs_WordFreq_readable', [np.nan] * len(lengths)), 'o-', linewidth=2, markersize=8, label='Readable Prompt')
    ax3.plot(lengths, correlation_results.get('NLI_vs_WordFreq_accurate', [np.nan] * len(lengths)), '^-', linewidth=2, markersize=8, label='Accurate Prompt')
    ax3.axhline(y=0, color='gray', linestyle='--', alpha=0.7)
    ax3.set_xlabel('Target Length (words)')
    ax3.set_ylabel('Correlation Coefficient')
    ax3.set_title('NLI vs Word Frequency by Prompt Type')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    ax3.set_ylim(-1, 1)
    
    # Plot 4: Heatmap of all correlations
    ax4 = axes[1, 1]
    
    heatmap_data = []
    heatmap_labels = []
    
    for _, row in correlation_results.iterrows():
        length = row['TargetLength']
        
        # Overall correlations
        heatmap_data.append([row.get('NLI_vs_Flesch', np.nan), row.get('NLI_vs_WordFreq', np.nan)])
        heatmap_labels.append(f'{length}w Overall')
        
        # Readable prompt correlations
        if 'NLI_vs_Flesch_readable' in row and 'NLI_vs_WordFreq_readable' in row:
            heatmap_data.append([row.get('NLI_vs_Flesch_readable', np.nan), row.get('NLI_vs_WordFreq_readable', np.nan)])
            heatmap_labels.append(f'{length}w Readable')
        
        # Accurate prompt correlations
        if 'NLI_vs_Flesch_accurate' in row and 'NLI_vs_WordFreq_accurate' in row:
            heatmap_data.append([row.get('NLI_vs_Flesch_accurate', np.nan), row.get('NLI_vs_WordFreq_accurate', np.nan)])
            heatmap_labels.append(f'{length}w Accurate')
    
    heatmap_df = pd.DataFrame(heatmap_data, 
                              columns=['NLI vs Flesch-Kincaid', 'NLI vs Word Frequency'],
                              index=heatmap_labels)
    
    sns.heatmap(heatmap_df, annot=True, fmt='.2f', cmap='coolwarm', center=0, 
                vmin=-1, vmax=1, ax=ax4, cbar_kws={'label': 'Correlation Coefficient'})
    ax4.set_title('Correlation Heatmap')
    ax4.set_ylabel('Length & Prompt Type')
    
    # Adjust layout
    plt.tight_layout()
    
    # Save the plot
    plot_filename = f"{base_filename}_tradeoff_analysis.png"
    plot_path = os.path.join(output_dir, plot_filename)
    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    plt.show()
    
    print(f"Multi-panel visualization saved to: {plot_path}")
    return plot_path

def main():
    """Main function to run the analysis and visualization."""
    if len(sys.argv) != 2:
        print("Usage: python correlation_analysis.py <raw_data_csv_path>")
        sys.exit(1)
        
    raw_data_path = sys.argv[1]
    
    if not os.path.exists(raw_data_path):
        print(f"File not found: {raw_data_path}")
        sys.exit(1)
    
    # Load and clean data
    df = load_and_clean_data(raw_data_path)
    if df is None:
        sys.exit(1)
    
    # Calculate length-controlled correlations
    correlation_results = calculate_length_controlled_correlations(df)
    
    # Setup output path
    output_dir = os.path.dirname(raw_data_path)
    base_filename = os.path.splitext(os.path.basename(raw_data_path))[0]
    output_filename = f"{base_filename}_length_controlled_correlations.csv"
    output_path = os.path.join(output_dir, output_filename)
    
    # Round to 3 decimal places for readability
    numeric_columns = correlation_results.select_dtypes(include=[np.number]).columns
    correlation_results[numeric_columns] = correlation_results[numeric_columns].round(3)
    
    # Save results
    correlation_results.to_csv(output_path, index=False)
    
    print(f"\nLength-Controlled Correlation Analysis Complete!")
    print(f"Results saved to: {output_path}")
    
    # Create visualizations
    try:
        create_tradeoff_plots(correlation_results, output_dir, base_filename)
        print(f"\nVisualizations created successfully!")
    except Exception as e:
        print(f"Warning: Could not create visualizations. Make sure you have 'matplotlib' and 'seaborn' installed (pip install matplotlib seaborn). Error: {e}")

if __name__ == "__main__":
    main()