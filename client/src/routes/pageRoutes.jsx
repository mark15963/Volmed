import { lazy } from "react";
import ProtectedRoute from "../layouts/ProtectedRoute";

const Main = lazy(() => import("../pages/main/Main"));
const SearchResults = lazy(() =>
  import("../pages/searchResults/SearchResults")
);
const List = lazy(() => import("../pages/patientsList/List"));
const RegisterPatient = lazy(() => import("../pages/register/RegisterPatient"));
const EditPatient = lazy(() => import("../pages/edit/EditPatient"));
const Login = lazy(() => import("../pages/login/LoginPage"));
const Administered = lazy(() => import("../pages/nurse/Administered"));
const Discharged = lazy(() => import("../pages/nurse/Discharged"));
const Hospitalized = lazy(() => import("../pages/nurse/Hospitalized"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const NotFound = lazy(() => import("../pages/NotFound"));
const NurseDisplay = lazy(() => import("../pages/main/pages/NurseDisplay"));

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
