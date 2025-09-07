import { AuthProvider } from "./AuthContext";
import { UsersDataProvider } from "./UsersDataContext";
import { PatientDataProvider } from "./PatientDataContext";
import { ConfigProvider } from "./ConfigContext";

export const AppProviders = ({ children }) => {
  return (
    <ConfigProvider>
      <AuthProvider>
        <UsersDataProvider>
          <PatientDataProvider>
            {children}
          </PatientDataProvider>
        </UsersDataProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

export * from "./AuthContext";
export * from "./PatientDataContext";
export * from "./UsersDataContext";
export * from "./ConfigContext";