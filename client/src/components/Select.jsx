import styles from './styles/Select.module.scss'

const Select = ({ children }) => {
    const id = 1
    const name = 'test'

    return (
        <>
            <select className={styles.select} name={name} id={id}>
                {children}
            </select>
        </>
    )
}

export default Select