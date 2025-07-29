import { AuthProvider } from "./AuthContext";
import { UsersDataProvider } from "./UsersDataContext";
import { PatientDataProvider } from "./PatientDataContext";
import Loader from "../components/Loader";
import { useEffect, useState } from "react";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <UsersDataProvider>
        <PatientDataProvider>
          {children}
        </PatientDataProvider>
      </UsersDataProvider>
    </AuthProvider>
  );
};

export * from "./AuthContext";
export * from "./PatientDataContext";
export * from "./UsersDataContext";