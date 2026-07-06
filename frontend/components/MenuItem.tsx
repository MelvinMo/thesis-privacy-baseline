import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";

export type MenuItemProps = {
  title: string;
  onPress: () => void;
  chevronDirection?: "forward" | "down";
};

const MenuItem = ({ title, onPress, chevronDirection="forward" } : MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={styles.menuItemText}>{title}</Text>
    <Ionicons name={`chevron-${chevronDirection}`} size={18} color={Colors.generalBlue} />
  </TouchableOpacity>
);

//================================================
// Styles
//================================================

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: Colors.lightBlack,
    borderRadius: 12,
    marginBottom: 15,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.generalBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
});

export default MenuItem;