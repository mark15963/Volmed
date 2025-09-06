import { useAuth } from '../context/AuthContext'

const InDev = ({ children, color = "#ffeb3b", opacity = 0.5, angle = 45, spacing = 20 }) => {
    const { authState } = useAuth()
    const userRole = authState.user.status;
    const env = import.meta.env.VITE_ENV

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

    if (["Тестировщик", "tester", "Администратор", "admin"].includes(userRole) && env === 'development') {
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
    return (
        <>
        </>
    )
}

export default InDev
