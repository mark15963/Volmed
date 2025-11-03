const Row = ({ children, center = false }) => {
    const costume = 'justify-content: center'

    const style = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: center ? "center" : "flex-start",
        width: '100%'
    }

    return (
        <div style={style}>
            {children}
        </div>
    )
}
export default Row