import styles from './styles/Input.module.css'

export const Input = ({
    title,
    type = 'text',
    value,
    placeholder,
    name,
    onChange,
    autoComplete,
    style,
    required,
    ...props
}) => {
    return (
        <>
            <label style={{ color: 'aliceblue' }}>
                {title && (
                    <>
                        {title}
                        {': '}
                    </>
                )}

                <input
                    placeholder={placeholder}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    style={style}
                    required={required}
                    {...props}
                />
            </label>
        </>
    )
}

export default Input