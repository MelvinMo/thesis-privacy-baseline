import { Calendar } from "@/components/Calendar";
import Loader from "@/components/Loader";
import StatisticItem from "@/components/StatisticItem";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, StatusBar, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { useTransparencyStore } from "@/store/transparencyStore";
import { PrivacyIcon } from "@/components/transparency/PrivacyIcon";
import { getPrivacyRiskIcon } from "@/utils/transparency";
import { PrivacyRisk } from "@/constants/types/Transparency";
import { DailyStatisticsPage } from "@/components/DailyStatisticsPage";
import { PrivacyStatisticsPage } from "@/components/transparency/PrivacyStatisticsPage";

/**
 * Since no statistics are actually calculated in the prototype, this screen does not need to do any data collection/data retrieval. 
 * The UI is just static with a bunch of placeholder images. 
 */

export default function Statistics() {
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<'daily' | 'stats'>('daily');
	const [selectedDate, setSelectedDate] = useState(new Date());

	const { statisticsTransparency, setStatisticsTransparency } = useTransparencyStore();
	const [displayNormalUI, setDisplayNormalUI] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
		}, 300);
	}, [selectedDate]);

	useEffect(() => {
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
		}, 300);
	}, [activeTab]);
	
	if (isLoading) {
		return (
			<Loader/>
		);
	}

	return (
		<View style={styles.container}>
			<StatusBar barStyle="light-content" />
			<ImageBackground
				source={{ uri: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
				style={styles.calendarBackgroundImage}
				imageStyle={styles.calendarBackgroundImageStyle}
			>
				<View style={styles.calendarOverlay} />
				<View style={styles.header}>
					<View style={styles.headerLeft}>
						<TouchableOpacity
							style={[styles.tabButton, activeTab === 'daily' && styles.activeTab]}
							onPress={() => {
								setActiveTab('daily')
								setDisplayNormalUI(true);
							}}
						>
							<Text style={[styles.tabText, activeTab === 'daily' && styles.activeTabText]}>
								Daily
							</Text>
						</TouchableOpacity>
						
						<TouchableOpacity
							style={[styles.tabButton, activeTab === 'stats' && styles.activeTab]}
							onPress={() => {
								setActiveTab('stats')
								setDisplayNormalUI(true);
							}}
						>
							<Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
								Statistics
							</Text>
						</TouchableOpacity>
					</View>
					<PrivacyIcon
						handleIconPress={() => setDisplayNormalUI(!displayNormalUI)}
						isOpen={!displayNormalUI}
						iconName={getPrivacyRiskIcon(statisticsTransparency.privacyRisk || PrivacyRisk.LOW)}
						iconSize={50}
					/>
				</View>
				{activeTab === 'daily' && <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
			</ImageBackground>

			<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
				{displayNormalUI ? (
					<>
						{activeTab === 'daily' && (
							<DailyStatisticsPage/>
						)}
						{activeTab === 'stats' && (
							<View style={styles.content}>
								<StatisticItem label="Sleep Quality" imageUrl={require("@/assets/images/sleep-quality-graph.png")}/>
								<StatisticItem label="Sleep Duration" imageUrl={require("@/assets/images/sleep-duration-graph.png")}/>
								<StatisticItem label="Sleep Stages" imageUrl={require("@/assets/images/sleep-duration-graph.png")}/>
								<StatisticItem label="Snore Time" imageUrl={require("@/assets/images/sleep-quality-graph.png")}/>
							</View>
						)}
					</>
				) : (
					<PrivacyStatisticsPage/>
				)}
			</ScrollView>
		</View>
	);
}

// ===============================================================
// Styles
// ===============================================================

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
	},
	calendarBackgroundImage: {
		borderRadius: 16,
		overflow: 'hidden',
		marginBottom: 20,
	},
	calendarBackgroundImageStyle: {
		opacity: 0.6,
	},
	calendarOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 20, 40, 0.8)',
		borderRadius: 16,
	},
	header: {
		flexDirection: 'row',
		paddingTop: 50,
		paddingBottom: 20,
		paddingHorizontal: 30,
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerLeft:{
		flexDirection: 'row',
		alignItems: 'center',
	},
	scrollView: {
		flex: 1,
		paddingHorizontal: 20,
	},
	content: {
		flex: 1,
		paddingBottom: 20,
	},
	tabButton: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
		marginRight: 10,
	},
	activeTab: {
		backgroundColor: Colors.generalBlue,
	},
	tabText: {
		color: Colors.lightGrey,
		fontSize: 18,
		fontWeight: '500',
	},
	activeTabText: {
		color: 'white',
	},
});