import Button from '../../components/Buttons.tsx';

import styles from "./nurseMenu.module.css"

const NurseMenu = () => {
    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                МЕНЮ МЕДСЕСТЕР
                <div className={styles.buttonsContainer}>
                  <Button 
                      text="Поступившие"
                  />
                  <Button 
                      text="Выписанные"
                  />
                </div>
            </div>
        </div>
    )
}
export default NurseMenu
