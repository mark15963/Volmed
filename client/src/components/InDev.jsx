import { useAuth } from '../context/AuthContext'

const InDev = ({ children, color = "#ffeb3b", opacity = 0.5, angle = 45, spacing = 20 }) => {
    const { authState } = useAuth()

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

    const userRole = authState.user.status;

    if (["Тестировщик", "tester", "Администратор", "admin"].includes(userRole) && import.meta.env.NODE_ENV === 'development') {
        return (
            <div
                style={{
                    position: 'relative',
                    display: 'inline-block'
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
