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
                      className={styles.button}
                  />
                  <Button 
                      text="Выписанные"
                      className={styles.button}
                  />
                </div>
            </div>
        </div>
    )
}
export default NurseMenu
