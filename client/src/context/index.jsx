import AuthProvider from "./AuthContext";
import UsersDataProvider from "./UsersDataContext";
import PatientDataProvider from "./PatientDataContext";
import MessageProvider from './MessageContext'
import ConfigProvider from "./ConfigContext";
import ThemeApplier from "./ThemeApplier"
import { debug } from "../utils";

debug.log("DEVELOPER VERSION")

export const AppProviders = ({ children }) => {
  return (
    <ThemeApplier>
      <ConfigProvider>
        <MessageProvider>
          <AuthProvider>
            {/* <UsersDataProvider> */}
            {/* <PatientDataProvider> */}
            {children}
            {/* </PatientDataProvider> */}
            {/* </UsersDataProvider> */}
          </AuthProvider>
        </MessageProvider>
      </ConfigProvider>
    </ThemeApplier>
  );
};

export * from "./AuthContext";
export * from "./PatientDataContext";
export * from "./UsersDataContext";
export * from "./MessageContext";
export * from "./ConfigContext";
export * from "./ThemeApplier"