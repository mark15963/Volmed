//#region === IMPORTS ===
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from '../../context/AuthContext';
import { fetchUserStatus } from "../../services/fetchUserStatus";
import { debug } from "../../utils";

import Loader from "../../components/ui/loaders/Loader";
import LoginForm from "./components/LoginForm";
import { SpinLoader } from "../../components/ui/loaders/SpinLoader";
//#endregion

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

      if(!res.ok){
        debug.warn(`Auth check failed: ${res.message}`)
        setErrors({
          general: "Authentification service unavailable"
        })
      } else if (!res.isAuthenticated) {
        debug.warn(`Auth check: ${res.message}`)
        setErrors({
          general: "Not authenticated"
        })
      }

      setErrors({})
      
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

  if (isLoading) debug.log("Loading login page")
  if (isCheckingAuth || isLoading) return <SpinLoader />

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