import { useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from '../../context/AuthContext';

import Loader from "../../components/Loader";

import useRedirectIfAuth from "../../hooks/useRedirectIfAuth";
import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const { isLoading: authLoading, isAuthenticated } = useRedirectIfAuth()

  // Loading state + checking if auth
  if (authLoading) return <Loader />
  if (isAuthenticated) return null

  // Sets the credentials while typing
  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <LoginForm
      credentials={credentials}
      errors={errors}
      isLoading={isLoading}
      onCredentialsChange={handleChange}
      onLogin={login}
      onErrorsChange={setErrors}
      onLoadingChange={setIsLoading}
      navigate={navigate}
    />
  )
}