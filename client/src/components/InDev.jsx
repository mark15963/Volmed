import { useAuth } from '../context/AuthContext'
import debug from '../utils/debug'
import { SpinLoader } from './loaders/SpinLoader'

const env = import.meta.env.VITE_ENV

const InDev = ({
  children,
  color = "#ffeb3b",
  opacity = 0.5,
  angle = 45,
  spacing = 20
}) => {
  const { authState } = useAuth()
  if (authState.isLoading) return
  if (!authState.isAuthenticated) return null

  const userRole = authState.user.status;

  const lineStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `repeating-linear-gradient(
      ${angle}deg,
      transparent,
      transparent ${spacing / 2}px,
      ${color} ${spacing / 2}px,
      ${color} ${spacing}px
    )`,
    opacity: opacity,
    pointerEvents: 'none',
    zIndex: 2
  };

  // Show only to tester users in dev mode
  if (["tester", "admin"].includes(userRole) && env === 'development') {
    return (
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          userSelect: 'none',
        }}
      >
        <div
          style={lineStyle}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1
          }}
        >
          {children}
        </div>
      </div>
    )
  }

  // Return nothing for non-tester users
  return (
    <>
    </>
  )
}

export default InDev
