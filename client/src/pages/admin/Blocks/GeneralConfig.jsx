import { useSafeMessage } from "../../../hooks/useSafeMessage"

import { useConfig } from "../../../context"

import Button from "../../../components/Button"
import Input from "../../../components/Input"

import debug from "../../../utils/debug"

import styles from "./styles/GeneralConfig.module.scss"
import { useGeneralConfig } from "./hooks/GeneralConfig.hooks"
import { useEffect } from "react"

const GeneralConfig = () => {
  const config = useConfig()
  const safeMessage = useSafeMessage();

  const {
    isLoading,
    titleInput,
    headerColorInput,
    contentColorInput,
    setTitleInput,
    setHeaderColorInput,
    setContentColorInput,
    handleSave,
    handleLogoUpdate
  } = useGeneralConfig(config, safeMessage)

  useEffect(() => {
    debug.log('Config context:', config)
  }, [])

  const handleLogoUpdateWrapper = async (e) => {
    const file = e.target.files[0];
    if (!file) return
    try {
      await handleLogoUpdate(file);
      e.target.value = ''
    } catch { }
  };

  return (
    <>
      Название сайта:
      <Input
        type="text"
        value={titleInput}
        onChange={e => setTitleInput(e.target.value)}
        placeholder='Введите название сайта'
        className={styles.textInput}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isLoading) {
            e.preventDefault()
            handleSave()
          }
        }}
      />
      <div style={{ height: '20px' }} />
      <div className={styles.row}>
        <div className={styles.logoBlockContainer}>
          Загрузить логотип:
          {config.logo && (
            <img
              src={config.logo}
              alt="Текущий логотип"
              className={styles.image}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpdateWrapper}
            className={styles.imageButton}
          />
        </div>

        <div className={styles.separator} />

        <div className={styles.colorBlocksContainer}>
          Цветавая палитра:
          <div className={styles.colorBlocks}>
            Цвет шапки
            <div className={styles.colorPicker}>
              <Input
                type="color"
                value={headerColorInput}
                onChange={e => setHeaderColorInput(e.target.value)}
              />
              <span>{headerColorInput.toUpperCase()}</span>
            </div>
          </div>

          <div className={styles.colorBlocks}>
            Цвет заднего фона
            <div className={styles.colorPicker}>
              <Input
                type="color"
                value={contentColorInput}
                onChange={e => setContentColorInput(e.target.value)}
              />
              <span>{contentColorInput.toUpperCase()}</span>
            </div>
          </div>

        </div>
      </div>
      <br />
      <div className={styles.button}>
        <Button
          text="Сохранить"
          onClick={handleSave}
          loading={isLoading}
        />
      </div>
    </>
  )
}

export default GeneralConfig