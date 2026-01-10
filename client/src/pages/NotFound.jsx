import { useNavigate } from "react-router"

export const NotFound = () => {
    const navigate = useNavigate()

    setTimeout(() => navigate(-1), 3000)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>404</h1>
            <p>Страница не существует</p>
            <p>Обратно назад через 3 секунды...</p>
        </div>
    )
}

export default NotFound