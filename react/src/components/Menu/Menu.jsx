import styles from './Menu.module.css'

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
            {items.map((item, index) => (
                <Card
                    key={index}
                    name={item.name}
                    isActive={activeTab === index}
                    onClick={() => onTabChange(index)}
                />
            ))}
        </div>
    );
};