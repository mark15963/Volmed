import { useEffect, useState } from "react";

import { useAuth } from '../../context/AuthContext';

import Loader from "../../components/loaders/Loader";
import LoginForm from "./components/LoginForm";
import { fetchUserStatus } from "../../api";
import { debug } from "../../utils/debug";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetchUserStatus()
      debug.log("Auth check:", res.message)

      // Redirect to home if user came from another page
      if (res.isAuthenticated) {
        navigate('/')
      } else {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [navigate])

  // Sets the credentials while typing
  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isCheckingAuth || isLoading) return <Loader />

  return (
    <LoginForm
      credentials={credentials}
      errors={errors}
      isLoading={isLoading}
      onCredentialsChange={handleChange}
      onLogin={login}
      onErrorsChange={setErrors}
      onLoadingChange={setIsLoading}
    />
  )
}