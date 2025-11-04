// Used in Content.jsx

import { lazy } from "react";
import ProtectedRoute from "../../layouts/content/ProtectedRoute";

const Main = lazy(() => import("../main/Main"));
const SearchResults = lazy(() =>
  import("../searchResults/SearchResults")
);
const List = lazy(() => import("../patientsList/List"));
const RegisterPatient = lazy(() => import("../register/RegisterPatient"));
const EditPatient = lazy(() => import("../edit/EditPatient"));
const Login = lazy(() => import("../login/LoginPage"));
const Administered = lazy(() => import("../nurse/Administered"));
const Discharged = lazy(() => import("../nurse/Discharged"));
const Hospitalized = lazy(() => import("../nurse/Hospitalized"));
const Dashboard = lazy(() => import("../admin/Dashboard"));
const NotFound = lazy(() => import("../NotFound"));
const NurseDisplay = lazy(() => import("../main/pages/NurseDisplay"));

export const appRoutes = [
  // PUBLIC
  { path: "/login", element: <Login /> },

  // DOCTOR ROUTES
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Main />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patients",
    element: (
      <ProtectedRoute>
        <List />
      </ProtectedRoute>
    ),
  },
  {
    path: "/search/:id",
    element: (
      <ProtectedRoute>
        <SearchResults />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <ProtectedRoute>
        <RegisterPatient />
      </ProtectedRoute>
    ),
  },
  {
    path: "/edit/:id",
    element: (
      <ProtectedRoute>
        <EditPatient />
      </ProtectedRoute>
    ),
  },

  // NURSE ROUTES
  {
    path: "/administered",
    element: (
      <ProtectedRoute roles={["nurse"]}>
        <Administered />
      </ProtectedRoute>
    ),
  },
  {
    path: "/discharged",
    element: (
      <ProtectedRoute roles={["nurse"]}>
        <Discharged />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hospitalized",
    element: (
      <ProtectedRoute roles={["nurse"]}>
        <Hospitalized />
      </ProtectedRoute>
    ),
  },

  // ADMIN ROUTES
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute roles={[]}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/nurse-menu",
    element: (
      <ProtectedRoute roles={["nurse"]}>
        <NurseDisplay />
      </ProtectedRoute>
    ),
  },

  // 404
  { path: "/*", element: <NotFound /> },
];
