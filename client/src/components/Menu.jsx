import styles from './styles/Menu.module.css'

export const Card = ({ name, isActive, onClick }) => {
    return (
        <div
            className={`${styles.menuCard} ${isActive ? styles.active : ''}`}
            onClick={onClick}
        >
            <h3>{name}</h3>
        </div>
    )
}

export const Menu = ({ items, activeTab, onTabChange }) => {
    return (
        <div className={styles.menuContainer}>
            {items.map((item, main) => (
                <Card
                    key={main}
                    name={item.name}
                    isActive={activeTab === main}
                    onClick={() => onTabChange(main)}
                />
            ))}
        </div>
    );
};