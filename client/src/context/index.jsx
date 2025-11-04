import AuthProvider from "./AuthContext";
import UsersDataProvider from "./UsersDataContext";
import PatientDataProvider from "./PatientDataContext";
import MessageProvider from './MessageContext'
import ConfigProvider from "./ConfigContext";

export const AppProviders = ({ children }) => {
  return (
    <ConfigProvider>
      <MessageProvider>
        <AuthProvider>
          <UsersDataProvider>
            <PatientDataProvider>
              {children}
            </PatientDataProvider>
          </UsersDataProvider>
        </AuthProvider>
      </MessageProvider>
    </ConfigProvider>
  );
};

export * from "./AuthContext";
export * from "./PatientDataContext";
export * from "./UsersDataContext";
export * from "./MessageContext"
export * from "./ConfigContext";