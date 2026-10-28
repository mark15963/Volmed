// Tabs names in constants
import styles from "./Tabs.module.scss";

type TabsItem = { name: string };
type CardProps = {
  name: string;
  isActive: boolean;
  onClick: () => void;
};
type TabsProps = {
  items?: TabsItem[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
};

export const Card = ({ name, isActive, onClick }: CardProps) => {
  return (
    <div
      className={`${styles.tabsCard} ${isActive ? styles.active : ""}`}
      onClick={onClick}
    >
      <h3 style={{ margin: "4px 0" }}>{name}</h3>
    </div>
  );
};

export const Tabs = ({
  items = [],
  activeTab = 0,
  onTabChange = () => {},
}: TabsProps) => {
  return (
    <div className={styles.tabsContainer}>
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
