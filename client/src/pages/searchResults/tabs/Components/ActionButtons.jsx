import { useNavigate } from "react-router";

import Button from "@/components/Button";

import { useAuth } from "@/context/AuthContext";

import styles from '../../searchResults.module.scss'

export const ActionButtons = ({
  activeTab,
  isEditingMeds,
  isEditingFiles,
  handleEdit,
  handleSaveMedications,
  handleSaveFiles,
  handlePrint,
  handleDeletePatient,
  navigate,
}) => {
  const { authState } = useAuth()

  const handleSaveClick = () => {
    if (activeTab === 2 && isEditingMeds) {
      handleSaveMedications();
    } else if (activeTab === 1 && isEditingFiles) {
      handleSaveFiles();
    } else {
      handleEdit();
    }
  };

  return (
    <div className={styles.buttonsContainer}>
      <div style={{ display: 'flex' }}>
        <Button
          text={
            isEditingMeds || isEditingFiles
              ? `Сохранить`
              : `Редактировать`
          }
          onClick={handleSaveClick}
        />
        <Button
          text="Печать"
          className={styles.printButton}
          onClick={handlePrint}
        />
        {authState.isAdmin &&
          <Button
            text="Удалить"
            onClick={handleDeletePatient}
          />
        }
      </div>
      <Button
        text="Назад в список"
        onClick={() => navigate('/patients')}
      />
    </div>
  )
}

export default ActionButtons
