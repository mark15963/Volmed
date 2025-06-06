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

export const Button = (props) => {
    const [isLoading, setIsLoading] = useState(false)

    return (
        <div>
            <button
                onClick={props.onClick}
                className={`button ${props.shape} ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
                type={props.type}
            >
                <i className={props.icon}>
                    {props.text && (
                        <span className="button-text" style={props.margin ? { margin: props.margin } : undefined}
                        >
                            {props.text}
                        </span>
                    )}
                </i>
            </button>
        </div>
    )
}

export default Button