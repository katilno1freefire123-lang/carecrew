import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./src/context/AuthContext.jsx";
import { LangProvider } from "./src/context/LangContext.jsx";
import RootNavigator from "./src/navigation/index.jsx";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LangProvider>
          <AuthProvider>
            <RootNavigator />
            <Toast />
          </AuthProvider>
        </LangProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
