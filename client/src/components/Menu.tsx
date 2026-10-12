// Tabs names in constants
import styles from './styles/Menu.module.scss'

type MenuItem = {name: string};
type CardProps = {
  name: string,
  isActive: boolean,
  onClick: () => void;
}
type MenuProps = {
  items?: MenuItem[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

export const Card = ({ name, isActive, onClick }: CardProps) => {
  return (
    <div
      className={`${styles.menuCard} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <h3 style={{ margin: '4px 0' }}>
        {name}
      </h3>
    </div>
  )
}

export const Menu = ({ 
  items = [], 
  activeTab = 0, 
  onTabChange = () => {} 
}: MenuProps) => {
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