import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext.jsx";
import { COLORS } from "../constants/colors.js";

import RoleSelectScreen from "../screens/auth/RoleSelectScreen.jsx";
import PhoneLoginScreen from "../screens/auth/PhoneLoginScreen.jsx";
import OTPVerifyScreen from "../screens/auth/OTPVerifyScreen.jsx";
import ProfileSetupScreen from "../screens/auth/ProfileSetupScreen.jsx";

import HomeScreen from "../screens/customer/HomeScreen.jsx";
import ServiceDetailScreen from "../screens/customer/ServiceDetailScreen.jsx";
import BookingFlowScreen from "../screens/customer/BookingFlowScreen.jsx";
import MyBookingsScreen from "../screens/customer/MyBookingsScreen.jsx";
import ReviewScreen from "../screens/customer/ReviewScreen.jsx";

import JobsScreen from "../screens/professional/JobsScreen.jsx";
import TasksScreen from "../screens/professional/TasksScreen.jsx";
import ProfessionalRegisterScreen from "../screens/professional/ProfessionalRegisterScreen.jsx";
import PendingApprovalScreen from "../screens/professional/PendingApprovalScreen.jsx";

import ProfileScreen from "../screens/ProfileScreen.jsx";
import NotificationsScreen from "../screens/NotificationsScreen.jsx";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabStyle = {
  headerShown: false,
  tabBarActiveTintColor: COLORS.accent,
  tabBarInactiveTintColor: COLORS.textMuted,
  tabBarStyle: { borderTopWidth: 1, borderTopColor: COLORS.border, height: 62, paddingBottom: 8, paddingTop: 6 },
  tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
};

const icon = (code, color) => <Text style={{ fontSize: 16, color }}>{code}</Text>;

function CustomerTabs() {
  return (
    <Tab.Navigator screenOptions={tabStyle}>
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: "Home", tabBarIcon: ({ color }) => icon("\uD83C\uDFE0", color) }} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} options={{ tabBarLabel: "Bookings", tabBarIcon: ({ color }) => icon("\uD83D\uDCCB", color) }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profile", tabBarIcon: ({ color }) => icon("\uD83D\uDC64", color) }} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="BookingFlow" component={BookingFlowScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function ProfessionalTabs() {
  return (
    <Tab.Navigator screenOptions={tabStyle}>
      <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarLabel: "Jobs", tabBarIcon: ({ color }) => icon("\uD83D\uDCBC", color) }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ tabBarLabel: "Tasks", tabBarIcon: ({ color }) => icon("\u2705", color) }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profile", tabBarIcon: ({ color }) => icon("\uD83D\uDC64", color) }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  const professionalApproved = role === "professional" && (user?.status === "approved" || user?.status === "active" || user?.kycStatus === "approved");

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
            <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
            <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="ProfessionalRegister" component={ProfessionalRegisterScreen} />
            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
          </>
        ) : role === "customer" ? (
          <>
            <Stack.Screen name="CustomerApp" component={CustomerTabs} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        ) : (
          <>{professionalApproved ? <Stack.Screen name="ProfessionalApp" component={ProfessionalTabs} /> : <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />}</>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
