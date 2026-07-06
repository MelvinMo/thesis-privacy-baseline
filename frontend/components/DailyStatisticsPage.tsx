import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import StatisticItem from "./StatisticItem"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/Colors";
import { useState } from "react";

export const DailyStatisticsPage = () => {

    const [activeClipTab, setActiveClipTab] = useState<'snoring' | 'talking'>('snoring');

    return (
        <View style={styles.content}>
            {/* Sleep Quality Section */}
            <Text style={styles.sectionTitle}>Sleep Quality</Text>
            <View style={styles.sectionCard}>
                <View style={styles.qualityContainer}>
                    <View style={styles.qualityScoreContainer}>
                        <Image
                            source={require('@/assets/images/sleep-quality-daily.png')}
                            style={{ width: 100, height: 100, borderRadius: 40 }}
                            resizeMode="cover"
                            />
                    </View>
                    <View style={styles.qualityDetails}>
                        <Text style={styles.qualityLabel}>Time in Bed</Text>
                        <Text style={styles.qualityValue}>10:14 PM - 6:44 AM</Text>
                        <Text style={styles.qualityDuration}>8h 30m</Text>
                        <Text style={styles.qualityStatus}>Pretty Good!</Text>
                    </View>
                </View>
            </View>

            <StatisticItem label="Sleep Stages" imageUrl={require("@/assets/images/sleep-stages-daily.png")}/>
            
            {/* Sleep Stage Breakdown */}
            <View style={styles.stagesGrid}>
                <View style={styles.stageItem}>
                    <View style={[styles.stageIcon, { backgroundColor: '#4a4a4a' }]}>
                        <Ionicons name="moon" size={16} color="white" />
                    </View>
                    <Text style={styles.stageLabel}>Deep Sleep</Text>
                    <Text style={styles.stagePercentage}>21%</Text>
                    <Text style={styles.stageDuration}>2h 25m</Text>
                </View>
                
                <View style={styles.stageItem}>
                    <View style={[styles.stageIcon, { backgroundColor: '#6a9eff' }]}>
                        <Ionicons name="moon-outline" size={16} color="white" />
                    </View>
                    <Text style={styles.stageLabel}>Light Sleep</Text>
                    <Text style={styles.stagePercentage}>56%</Text>
                    <Text style={styles.stageDuration}>4h 35m</Text>
                </View>
                
                <View style={styles.stageItem}>
                    <View style={[styles.stageIcon, { backgroundColor: '#8a6aff' }]}>
                        <Ionicons name="eye" size={16} color="white" />
                    </View>
                    <Text style={styles.stageLabel}>REM</Text>
                    <Text style={styles.stagePercentage}>17%</Text>
                    <Text style={styles.stageDuration}>1h 25m</Text>
                </View>
                
                <View style={styles.stageItem}>
                    <View style={[styles.stageIcon, { backgroundColor: '#ffa64a' }]}>
                        <Ionicons name="eye-outline" size={16} color="white" />
                    </View>
                    <Text style={styles.stageLabel}>Awake</Text>
                    <Text style={styles.stagePercentage}>6%</Text>
                    <Text style={styles.stageDuration}>30m</Text>
                </View>
            </View>

            {/* Sleep Insights Section */}
            <View style={styles.insightsContainer}>
                <View style={styles.insightRow}>
                    <View style={styles.insightItem}>
                        <Ionicons name="bed-outline" size={20} color="#4a9eff" />
                        <Text style={styles.insightLabel}>In Bed</Text>
                        <Text style={styles.insightValue}>8h 30 min</Text>
                    </View>
                    <View style={styles.insightItem}>
                        <Ionicons name="moon-outline" size={20} color="#8a6aff" />
                        <Text style={styles.insightLabel}>Asleep</Text>
                        <Text style={styles.insightValue}>7h 34 min</Text>
                    </View>
                    <View style={styles.insightItem}>
                        <Ionicons name="time-outline" size={20} color="#6a9eff" />
                        <Text style={styles.insightLabel}>Asleep After</Text>
                        <Text style={styles.insightValue}>11 min</Text>
                    </View>
                </View>
                
                <View style={styles.insightRow}>
                    <View style={styles.insightItem}>
                        <Ionicons name="volume-medium-outline" size={20} color="#ffa64a" />
                        <Text style={styles.insightLabel}>Noise</Text>
                        <Text style={styles.insightValue}>39 dB</Text>
                    </View>
                    <View style={styles.insightItem}>
                        <Ionicons name="volume-medium-outline" size={20} color="#ff6b6b" />
                        <Text style={styles.insightLabel}>Snoring</Text>
                        <Text style={styles.insightValue}>1h 30 min</Text>
                    </View>
                </View>
            </View>

            {/* Sleep Clips Section */}
            <Text style={styles.sectionTitle}>Sleep Clips</Text>
            <View style={styles.sectionCard}>
                <View style={styles.clipsContainer}>
                    <TouchableOpacity
                        style={[styles.clipTab, activeClipTab === 'snoring' && styles.activeClipTab]}
                        onPress={() => setActiveClipTab('snoring')}
                    >
                        <Text style={[styles.clipTabText, activeClipTab === 'snoring' && styles.activeClipTabText]}>
                            Snoring
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.clipTab, activeClipTab === 'talking' && styles.activeClipTab]}
                        onPress={() => setActiveClipTab('talking')}
                    >
                        <Text style={[styles.clipTabText, activeClipTab === 'talking' && styles.activeClipTabText]}>
                            Talking
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.clipsListContainer}>
                    <View style={styles.clipItem}>
                        <Ionicons name="play-circle-outline" size={24} color="#4a9eff" />
                        <Text style={styles.clipTime}>11:04 PM</Text>
                        <View style={styles.clipWaveform}>
                            <View style={styles.waveformBars}>
                                {[...Array(20)].map((_, i) => (
                                    <View key={i} style={[styles.waveformBar, { height: Math.random() * 20 + 5 }]} />
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.clipItem}>
                        <Ionicons name="play-circle-outline" size={24} color="#4a9eff" />
                        <Text style={styles.clipTime}>11:04 PM</Text>
                        <View style={styles.clipWaveform}>
                            <View style={styles.waveformBars}>
                                {[...Array(20)].map((_, i) => (
                                    <View key={i} style={[styles.waveformBar, { height: Math.random() * 20 + 5 }]} />
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.clipItem}>
                        <Ionicons name="play-circle-outline" size={24} color="#4a9eff" />
                        <Text style={styles.clipTime}>11:04 PM</Text>
                        <View style={styles.clipWaveform}>
                            <View style={styles.waveformBars}>
                                {[...Array(20)].map((_, i) => (
                                    <View key={i} style={[styles.waveformBar, { height: Math.random() * 20 + 5 }]} />
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
};

// ====================================================
// Styles
// ====================================================

const styles = StyleSheet.create({
    content: {
		flex: 1,
		paddingBottom: 20,
	},
	sectionCard: {
		backgroundColor: Colors.lightBlack,
		borderRadius: 16,
		padding: 20,
		marginBottom: 20,
	},
	sectionTitle: {
		color: 'white',
		fontSize: 20,
		fontWeight: '600',
		marginBottom: 15,
		paddingHorizontal: 10,
	},
	
	// Sleep Quality Styles
	qualityContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	qualityScoreContainer: {
		position: 'relative',
		marginRight: 20,
	},
	qualityDetails: {
		flex: 1,
	},
	qualityLabel: {
		color: '#888',
		fontSize: 14,
		marginBottom: 2,
	},
	qualityValue: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 2,
	},
	qualityDuration: {
		color: Colors.lightGrey,
		fontSize: 14,
		marginBottom: 8,
	},
	qualityStatus: {
		color: Colors.generalBlue,
		fontSize: 16,
		fontWeight: '600',
	},
	
	// Sleep Stages Styles
	stagesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginBottom: 20,
		paddingHorizontal: 10,
	},
	stageItem: {
		alignItems: 'center',
		width: '23%',
		marginBottom: 15,
	},
	stageIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
	},
	stageLabel: {
		color: Colors.lightGrey,
		fontSize: 12,
		textAlign: 'center',
		marginBottom: 4,
	},
	stagePercentage: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 2,
	},
	stageDuration: {
		color: Colors.lightGrey,
		fontSize: 12,
	},
	
	// Sleep Insights Styles
	insightsContainer: {
		marginBottom: 20,
	},
	insightRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	insightItem: {
		backgroundColor: Colors.lightBlack,
		borderRadius: 12,
		padding: 16,
		flex: 1,
		marginHorizontal: 4,
		alignItems: 'center',
		minHeight: 80,
	},
	insightLabel: {
		color: Colors.lightGrey,
		fontSize: 12,
		marginTop: 8,
		marginBottom: 4,
		textAlign: 'center',
	},
	insightValue: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
		textAlign: 'center',
	},
	
	// Sleep Clips Styles
	clipsContainer: {
		flexDirection: 'row',
		marginBottom: 20,
	},
	clipTab: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 16,
		marginRight: 10,
		backgroundColor: '#333',
	},
	activeClipTab: {
		backgroundColor: Colors.generalBlue,
	},
	clipTabText: {
		color: Colors.lightGrey,
		fontSize: 14,
		fontWeight: '500',
	},
	activeClipTabText: {
		color: 'white',
	},
	clipsListContainer: {
		gap: 12,
	},
	clipItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: '#333',
		borderRadius: 12,
		gap: 12,
	},
	clipTime: {
		color: 'white',
		fontSize: 14,
		fontWeight: '500',
		minWidth: 60,
	},
	clipWaveform: {
		flex: 1,
		height: 20,
		justifyContent: 'center',
	},
	waveformBars: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	waveformBar: {
		width: 2,
		backgroundColor: Colors.generalBlue,
		borderRadius: 1,
	},
})