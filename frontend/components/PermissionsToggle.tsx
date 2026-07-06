import { View, Text, StyleSheet, Switch } from "react-native";

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
}

const PermissionsToggle = ({ value, onValueChange, label }: ToggleProps) => {
  return (
    <View style={styles.toggleContainer}>
      {/* Conditionally render a label if provided */}
      {label && <Text style={styles.toggleLabel}>{label}</Text>}
      <Switch
        onValueChange={onValueChange}
        value={value}
        trackColor={{ false: "#ccc", true: "#4CAF50" }} 
        thumbColor={value ? "white" : "white"}
        ios_backgroundColor="#ccc"
      />
    </View>
  );
};

// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row", 
    alignItems: "center",
    marginVertical: 10,
    width: '100%', 
    paddingHorizontal: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: "white", 
    flex: 2,
    marginRight: 10, 
  },
});

export default PermissionsToggle;