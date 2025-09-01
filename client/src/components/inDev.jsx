const InDev = ({ children, color = "#ffeb3b", opacity = 0.5, angle = 45, spacing = 20 }) => {
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

export default InDev