import styles from './styles/Block.module.scss'

const Block = ({ children, title }) => {
    return (
        <div className={styles.block}>
            <div className={styles.blockTitle}>
                {title}
            </div>
            <div className={styles.blockContent}>
                {children}
            </div>
        </div>
    )
}
export default Block