"""
Privacy Experiment Data Aggregator and Visualizer
Calculates comprehensive aggregate statistics from raw experiment data, calculated correlations and creates graphs
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
                            'FleschKincaid', 'WordFrequencyScore']
        
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

def calculate_correlations(df):
    """
    Calculate key correlations for the analysis, including the NLI metrics.
    """
    
    correlations = {}
    
    # Overall correlations
    numeric_df = df.select_dtypes(include=[np.number])
    
    if 'ActualWordCount' in numeric_df.columns:
        # Length vs NLI scores
        correlations['Length_vs_NLI_Avg'] = numeric_df['ActualWordCount'].corr(numeric_df['NLI_AverageScore'])
        correlations['Length_vs_NLI_DataCollection'] = numeric_df['ActualWordCount'].corr(numeric_df['NLI_DataCollection'])
        correlations['Length_vs_NLI_PrivacyExplanation'] = numeric_df['ActualWordCount'].corr(numeric_df['NLI_PrivacyExplanation'])
        
        # Length vs readability
        correlations['Length_vs_FleschKincaid'] = -numeric_df['ActualWordCount'].corr(numeric_df['FleschKincaid'])
        correlations['Length_vs_WordFrequency'] = numeric_df['ActualWordCount'].corr(numeric_df['WordFrequencyScore'])
    
    if 'NLI_AverageScore' in numeric_df.columns:
        # NLI Avg vs readability
        correlations['NLI_Avg_vs_FleschKincaid'] = -numeric_df['NLI_AverageScore'].corr(numeric_df['FleschKincaid'])
        correlations['NLI_Avg_vs_WordFrequency'] = numeric_df['NLI_AverageScore'].corr(numeric_df['WordFrequencyScore'])

    if 'NLI_DataCollection' in numeric_df.columns:
        # NLI DataCollection vs readability
        correlations['NLI_DataCollection_vs_FleschKincaid'] = -numeric_df['NLI_DataCollection'].corr(numeric_df['FleschKincaid'])
        correlations['NLI_DataCollection_vs_WordFrequency'] = numeric_df['NLI_DataCollection'].corr(numeric_df['WordFrequencyScore'])

    if 'NLI_PrivacyExplanation' in numeric_df.columns:
        # NLI PrivacyExplanation vs readability
        correlations['NLI_PrivacyExplanation_vs_FleschKincaid'] = -numeric_df['NLI_PrivacyExplanation'].corr(numeric_df['FleschKincaid'])
        correlations['NLI_PrivacyExplanation_vs_WordFrequency'] = numeric_df['NLI_PrivacyExplanation'].corr(numeric_df['WordFrequencyScore'])

    # Length-controlled correlations
    length_controlled_corrs = []
    for length in sorted(df['TargetLength'].dropna().unique()):
        length_df = df[df['TargetLength'] == length]
        if len(length_df) >= 3:  # Need at least 3 points for correlation
            length_corrs = {
                'TargetLength': length,
                'SampleSize': len(length_df)
            }
            
            # NLI vs readability within this length
            for nli_col in ['NLI_AverageScore', 'NLI_DataCollection', 'NLI_PrivacyExplanation']:
                if nli_col in length_df.columns and 'FleschKincaid' in length_df.columns:
                    valid_data = length_df[[nli_col, 'FleschKincaid']].dropna()
                    if len(valid_data) >= 3:
                        length_corrs[f'{nli_col}_vs_FleschKincaid'] = -valid_data[nli_col].corr(valid_data['FleschKincaid'])
                    else:
                        length_corrs[f'{nli_col}_vs_FleschKincaid'] = np.nan
                
                if nli_col in length_df.columns and 'WordFrequencyScore' in length_df.columns:
                    valid_data = length_df[[nli_col, 'WordFrequencyScore']].dropna()
                    if len(valid_data) >= 3:
                        length_corrs[f'{nli_col}_vs_WordFrequency'] = valid_data[nli_col].corr(valid_data['WordFrequencyScore'])
                    else:
                        length_corrs[f'{nli_col}_vs_WordFrequency'] = np.nan
            
            length_controlled_corrs.append(length_corrs)
    
    return correlations, pd.DataFrame(length_controlled_corrs)

def create_aggregation_reports(df):
    """Create comprehensive aggregation reports."""
    
    metrics = ['ActualWordCount', 'NLI_DataCollection', 'NLI_PrivacyExplanation', 
               'NLI_AverageScore', 'FleschKincaid', 'WordFrequencyScore']
    
    reports = {}
    
    # 1. By Target Length
    print(" Calculating aggregates by Target Length...")
    by_length = calculate_basic_stats(df, ['TargetLength'], metrics)
    reports['by_length'] = by_length
    
    # 2. Overall Statistics
    print(" Calculating overall statistics...")
    overall = calculate_basic_stats(df, [], metrics)
    reports['overall'] = overall
    
    # 3. By Event Type
    print(" Calculating aggregates by Event Type...")
    by_event = calculate_basic_stats(df, ['EventKey'], metrics)
    reports['by_event'] = by_event
    
    # 4. Length Analysis - How well does actual match target?
    print(" Analyzing length accuracy...")
    df_length_analysis = df.copy()
    df_length_analysis['LengthRatio'] = df_length_analysis['ActualWordCount'] / df_length_analysis['TargetLength']
    df_length_analysis['LengthDifference'] = df_length_analysis['ActualWordCount'] - df_length_analysis['TargetLength']
    df_length_analysis['LengthAccuracy'] = np.abs(df_length_analysis['LengthDifference']) / df_length_analysis['TargetLength']
    
    length_metrics = ['LengthRatio', 'LengthDifference', 'LengthAccuracy']
    length_analysis = calculate_basic_stats(df_length_analysis, ['TargetLength'], length_metrics)
    reports['length_analysis'] = length_analysis
    
    # 5. Correlation Analysis
    print(" Calculating correlations...")
    overall_correlations, length_controlled_correlations = calculate_correlations(df)
    
    # Convert overall correlations to DataFrame
    corr_df = pd.DataFrame([overall_correlations])
    reports['overall_correlations'] = corr_df
    reports['length_controlled_correlations'] = length_controlled_correlations
    
    return reports

def create_visualizations(df, reports, output_dir, base_filename):
    """
    Create comprehensive visualizations with scatter plots and new charts.
    """
    label_fontsize = 18
    tick_label_fontsize = 16
    
    plt.style.use('default')
    sns.set_palette("husl")
    
    # Figure 1: Main metrics by length (as scatter plots)
    fig1, axes = plt.subplots(3, 2, figsize=(18, 18))
        
    # Flatten the axes array for easy iteration
    axes = axes.flatten()
    
    # Define metrics to plot
    metrics = {
        'NLI_AverageScore': ('NLI Average Score', 'Consistency (Average)'),
        'NLI_DataCollection': ('NLI Privacy Policy', 'Consistency (Privacy Policy)'),
        'NLI_PrivacyExplanation': ('NLI PIPEDA', 'Consistency (PIPEDA)'),
        'FleschKincaid': ('Flesch-Kincaid Grade Level', 'Readability (Flesch-Kincaid)'),
        'WordFrequencyScore': ('Word Frequency Score', 'Readability (Word Frequency)'),
        'ActualWordCount': ('Actual Word Count', 'Length Adherence'),
    }
    
    # Create a subplot for each metric
    for i, (metric, (y_label, title)) in enumerate(metrics.items()):
        ax = axes[i]
        sns.regplot(x='ActualWordCount', y=metric, data=df, ax=ax, scatter_kws={'alpha': 0.5}, line_kws={'color': 'red'}, ci=None)
        ax.set_xlabel('Actual Word Count', fontsize=label_fontsize)
        ax.set_ylabel(y_label, fontsize=label_fontsize)
        ax.set_title(title, fontsize=label_fontsize)
        ax.grid(True, alpha=0.3)
        ax.tick_params(axis='both', which='major', labelsize=tick_label_fontsize)

    # Clean up any unused subplots if the number of metrics is not 6
    if len(metrics) < len(axes):
        for i in range(len(metrics), len(axes)):
            fig1.delaxes(axes[i])
            
    plt.tight_layout()
    fig1_path = os.path.join(output_dir, f"{base_filename}_metrics_by_length_scatter.png")
    plt.savefig(fig1_path, dpi=300, bbox_inches='tight')
    plt.show()
    
    # Figure 2: Correlation Analysis by Target Length
    if 'length_controlled_correlations' in reports and not reports['length_controlled_correlations'].empty:
        fig2, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig2.suptitle('Consistency-Readability Trade-offs by Target Length', fontsize=20, fontweight='bold')
        
        length_corrs = reports['length_controlled_correlations']
        corr_lengths = length_corrs['TargetLength'].values
        
        # Plot 1: NLI Average vs Flesch-Kincaid
        ax = axes[0, 0]
        ax.plot(corr_lengths, length_corrs['NLI_AverageScore_vs_FleschKincaid'], 'o-', linewidth=2, markersize=8, color='#FF6B6B')
        ax.set_xlabel('Target Length (words)', fontsize=label_fontsize)
        ax.set_ylabel('Correlation Coefficient', fontsize=label_fontsize)
        ax.set_title('Average NLI vs Flesch-Kincaid by Length', fontsize=label_fontsize)
        ax.axhline(y=0, color='gray', linestyle='--', alpha=0.7)
        ax.grid(True, alpha=0.3)
        ax.set_ylim(-1, 1)
        ax.tick_params(axis='both', which='major', labelsize=tick_label_fontsize)

        
        # Plot 2: NLI Average vs Word Frequency
        ax = axes[0, 1]
        ax.plot(corr_lengths, length_corrs['NLI_AverageScore_vs_WordFrequency'], 's-', linewidth=2, markersize=8, color='#4ECDC4')
        ax.set_xlabel('Target Length (words)', fontsize=label_fontsize)
        ax.set_ylabel('Correlation Coefficient', fontsize=label_fontsize)
        ax.set_title('Average NLI vs Word Frequency by Length', fontsize=label_fontsize)
        ax.axhline(y=0, color='gray', linestyle='--', alpha=0.7)
        ax.grid(True, alpha=0.3)
        ax.set_ylim(-1, 1)
        ax.tick_params(axis='both', which='major', labelsize=tick_label_fontsize)

        # Plot 3: NLI Privacy Policy vs Readability
        ax = axes[1, 0]
        ax.plot(corr_lengths, length_corrs['NLI_DataCollection_vs_FleschKincaid'], 'o-', linewidth=2, markersize=8, color='#E5D54F', label='NLI Data Collection vs Flesch-Kincaid')
        ax.plot(corr_lengths, length_corrs['NLI_DataCollection_vs_WordFrequency'], 's-', linewidth=2, markersize=8, color='#3B6B99', label='NLI Data Collection vs Word Frequency')
        ax.set_xlabel('Target Length (words)', fontsize=label_fontsize)
        ax.set_ylabel('Correlation Coefficient', fontsize=label_fontsize)
        ax.set_title('Privacy Policy NLI vs Readability by Length', fontsize=label_fontsize)
        ax.axhline(y=0, color='gray', linestyle='--', alpha=0.7)
        ax.grid(True, alpha=0.3)
        ax.set_ylim(-1, 1)
        ax.legend(fontsize=label_fontsize)
        ax.tick_params(axis='both', which='major', labelsize=tick_label_fontsize)

        # Plot 4: NLI PIPEDA vs Readability
        ax = axes[1, 1]
        ax.plot(corr_lengths, length_corrs['NLI_PrivacyExplanation_vs_FleschKincaid'], 'o-', linewidth=2, markersize=8, color='#E5D54F', label='NLI Privacy Explanation vs Flesch-Kincaid')
        ax.plot(corr_lengths, length_corrs['NLI_PrivacyExplanation_vs_WordFrequency'], 's-', linewidth=2, markersize=8, color='#3B6B99', label='NLI Privacy Explanation vs Word Frequency')
        ax.set_xlabel('Target Length (words)', fontsize=label_fontsize)
        ax.set_ylabel('Correlation Coefficient', fontsize=label_fontsize)
        ax.set_title('PIPEDA NLI vs Readability by Length', fontsize=label_fontsize)
        ax.axhline(y=0, color='gray', linestyle='--', alpha=0.7)
        ax.grid(True, alpha=0.3)
        ax.set_ylim(-1, 1)
        ax.legend(fontsize=label_fontsize)
        ax.tick_params(axis='both', which='major', labelsize=tick_label_fontsize)

        plt.tight_layout()
        fig2_path = os.path.join(output_dir, f"{base_filename}_correlation_analysis.png")
        plt.savefig(fig2_path, dpi=300, bbox_inches='tight')
        plt.show()

    # Figure 3: Overall Correlations Heatmap
    fig3, ax = plt.subplots(1, 1, figsize=(10, 8))
    
    # Create correlation matrix
    numeric_df = df.select_dtypes(include=[np.number])
    corr_matrix = numeric_df.corr()
    
    # Create mask for upper triangle
    mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
    
    sns.heatmap(corr_matrix, mask=mask, annot=True, fmt='.3f', 
                cmap='RdBu_r', center=0, square=True, ax=ax,
                cbar_kws={'label': 'Correlation Coefficient', 'fontsize': label_fontsize},
                annot_kws={"fontsize": label_fontsize})
    ax.set_title('Overall Correlation Matrix', fontsize=14, fontweight='bold')
    ax.tick_params(axis='both', labelsize=label_fontsize)
    
    plt.tight_layout()
    fig3_path = os.path.join(output_dir, f"{base_filename}_correlation_matrix.png")
    plt.savefig(fig3_path, dpi=300, bbox_inches='tight')
    plt.show()
    
    print(f"Visualizations saved:")
    print(f"  • Metrics by length (scatter): {fig1_path}")
    if 'length_controlled_correlations' in reports:
        print(f"  • Correlation analysis: {fig2_path}")
    print(f"  • Correlation matrix: {fig3_path}")

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

def print_summary_statistics(df, reports):
    """Print key summary statistics to console."""
    
    print("\n" + "="*60)
    print(" SUMMARY STATISTICS")
    print("="*60)
    
    # Overall sample size
    print(f" Total Experiments: {len(df)}")
    print(f" Event Types: {df['EventKey'].nunique()}")
    print(f" Target Lengths: {df['TargetLength'].nunique()} ({', '.join(map(str, sorted(df['TargetLength'].unique())))})")
    
    # Overall metrics
    print(f"\n OVERALL RESULTS:")
    print(f"  • Avg Word Count: {df['ActualWordCount'].mean():.1f}")
    print(f"  • Avg Flesch-Kincaid: {df['FleschKincaid'].mean():.2f}")
    print(f"  • Avg Word Freq: {df['WordFrequencyScore'].mean():.2f}")
    print(f"  • Avg NLI Privacy Policy Score: {df['NLI_DataCollection'].mean():.3f}")
    print(f"  • Avg NLI PIPEDA Score: {df['NLI_PrivacyExplanation'].mean():.3f}")
    print(f"  • Avg NLI Avg Score: {df['NLI_AverageScore'].mean():.3f}")
    
    # Length adherence
    length_ratio = (df['ActualWordCount'] / df['TargetLength']).mean()
    print(f"\n LENGTH ADHERENCE:")
    print(f"  • Overall: {length_ratio:.2f}x target length on average")
    
    # Key correlations
    if 'overall_correlations' in reports and not reports['overall_correlations'].empty:
        corr_data = reports['overall_correlations'].iloc[0]
        print(f"\n KEY CORRELATIONS:")
        print(f"  • Length vs Flesch-Kincaid: {corr_data['Length_vs_FleschKincaid']:.3f}")
        print(f"  • Length vs Word Frequency: {corr_data['Length_vs_WordFrequency']:.3f}")
        print(f"  • Length vs NLI Avg Score: {corr_data['Length_vs_NLI_Avg']:.3f}")
        print(f"  • Length vs NLI Privacy Policy Score: {corr_data['Length_vs_NLI_DataCollection']:.3f}")
        print(f"  • Length vs NLI PIPEDA Score: {corr_data['Length_vs_NLI_PrivacyExplanation']:.3f}")
        print(f"  • NLI Avg vs Flesch-Kincaid: {corr_data['NLI_Avg_vs_FleschKincaid']:.3f}")
        print(f"  • NLI Avg vs Word Frequency: {corr_data['NLI_Avg_vs_WordFrequency']:.3f}")
        print(f"  • NLI Privacy Policy vs Flesch-Kincaid: {corr_data['NLI_DataCollection_vs_FleschKincaid']:.3f}")
        print(f"  • NLI Privacy Policy vs Word Frequency: {corr_data['NLI_DataCollection_vs_WordFrequency']:.3f}")
        print(f"  • NLI PIPEDA vs Flesch-Kincaid: {corr_data['NLI_PrivacyExplanation_vs_FleschKincaid']:.3f}")
        print(f"  • NLI PIPEDA vs Word Frequency: {corr_data['NLI_PrivacyExplanation_vs_WordFrequency']:.3f}")

def main():
    if len(sys.argv) != 2:
        print(" Usage: python analyze_results.py <raw_data_csv_path>")
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
    base_filename = base_filename.replace('_raw', '_analysis')
    
    # Create aggregation reports
    reports = create_aggregation_reports(df)
    
    # Save all reports
    saved_files = save_reports(reports, output_dir, base_filename)
    
    # Create visualizations
    try:
        create_visualizations(df, reports, output_dir, base_filename)
    except Exception as e:
        print(f"Warning: Could not create visualizations: {e}")
        print("Make sure matplotlib and seaborn are installed: pip install matplotlib seaborn")
    
    # Print summary to console
    print_summary_statistics(df, reports)
    
    # Final output summary
    print(f"\n ANALYSIS COMPLETE!")
    print(f" Output Directory: {output_dir}")
    print(f" Generated {len(saved_files)} report files:")
    for file in saved_files:
        print(f"  • {os.path.basename(file)}")
    
    print(f"\n Key Files:")
    print(f"  • by_length.csv - Main results by target length")
    print(f"  • overall_correlations.csv - Overall correlation analysis") 
    print(f"  • length_controlled_correlations.csv - Correlations within each length")
    print(f"  • length_analysis.csv - Length adherence analysis")

if __name__ == "__main__":
    main()