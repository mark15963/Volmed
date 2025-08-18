import Button from "../../../../components/Buttons";
import { message } from 'antd'
import styles from '../../searchResults.module.css'
import { useNavigate } from "react-router";
import { useAuth } from "../../../../context/AuthContext";

export const ActionButtons = ({
    activeTab,
    isEditing,
    isEditingFiles,
    handleEdit,
    handleSaveMedications,
    handleSaveFiles,
    handlePrint,
    handleDeletePatient,
    navigate,
    medications = [],
}) => {
    const { authState } = useAuth()

    const handleSaveClick = (e) => {
        if (activeTab === 2 && isEditing) {
            //const hasEmptyNames = medications.some(item => !item.name.trim());
            //if (hasEmptyNames) {
            //    message.error('Пожалуйста, заполните все поля');
            //    return;
            //}
            handleSaveMedications(e);
        } else if (activeTab === 1 && isEditingFiles) {
            handleSaveFiles(e);
        } else {
            handleEdit(e);
        }
    };

    return (
        <div className={styles.buttonsContainer}>
            <div style={{ display: 'flex' }}>
                <Button
                    text={
                        isEditing || isEditingFiles
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
