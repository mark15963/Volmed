import { useConfig } from "./ConfigContext"
import { useEffect } from "react"

const ThemeApplier = ({ children }) => {
  const { theme } = useConfig()

  useEffect(() => {
    document.body.setAttribute("data-theme-app", theme?.app ?? "default")
  }, [theme?.app])
  return children;
}

export default ThemeApplier;