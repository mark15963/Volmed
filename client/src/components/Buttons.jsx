import { useState } from "react";
import { useNavigate } from 'react-router'

import './styles/Button.css'

export const HomeButton = () => {
    const navigate = useNavigate()

    return (
        <button
            className='button'
            onClick={() =>
                navigate('/')
            }
        >
            Назад на главную
        </button>
    )
}

export const TestButton = (props) => {
    const [isWorking, setIsWorking] = useState(false)
    const handleClick = async () => {
        setIsWorking(true)
        console.log('working')
        setTimeout(() => {
            setIsWorking(false)
            console.log('done')
        }, 2000)
    }

    return (
        <div>
            <button
                onClick={handleClick}
                className={`test-button ${isWorking ? "working" : ""}`}
                disabled={isWorking}
            >
                <span className="loader"></span>
                <span className=""></span>
                <span className="button-text">{props.text}</span>
            </button>
        </div>
    )
}

export const Button = ({
    onClick,
    shape,
    type = 'button',
    style,
    icon,
    margin,
    text,
    className,
    disabled,
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(false)

    return (
        <button
            onClick={onClick}
            className={`button ${shape} ${isLoading ? "loading" : ""} ${className}`}
            // disabled={isLoading}
            disabled={disabled}
            type={type}
            style={style}
            {...props}
        >
            <i className={icon}>
                {text && (
                    <span className="button-text" style={margin ? { margin: margin } : undefined}
                    >
                        {text}
                    </span>
                )}
            </i>
        </button>
    )
}

export default Button