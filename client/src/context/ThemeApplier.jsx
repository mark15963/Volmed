import { useConfig } from "./ConfigContext"
import { useEffect } from "react"

const ThemeApplier = ({ children }) => {
  const { theme } = useConfig()

  useEffect(() => {
    document.body.setAttribute("data-theme-app", theme?.app ?? "default")
    document.body.setAttribute("data-theme-table", theme?.table ?? "default")
  }, [theme?.app, theme?.table])
  return children;
}

export default ThemeApplier;