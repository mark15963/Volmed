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
    inputs,
    handleChange,
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
        value={inputs.title}
        onChange={e => handleChange("title", e.target.value)}
        placeholder='Введите название сайта'
        className={styles.textInput}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isLoading) {
            e.preventDefault()
            handleSave()
          }
        }}
      />
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
          <div className={styles.palateTitle}>
            Цветавая палитра:
          </div>
          <div className={styles.colorBlocks}>
            Цвет шапки
            <div className={styles.colorPicker}>
              <Input
                type="color"
                value={inputs.header}
                onChange={e => handleChange("header", e.target.value)}
              />
              <span>{inputs.header.toUpperCase()}</span>
            </div>
          </div>

          <div className={styles.colorBlocks}>
            Цвет заднего фона
            <div className={styles.colorPicker}>
              <Input
                type="color"
                value={inputs.content}
                onChange={e => handleChange("content", e.target.value)}
              />
              <span>{inputs.content.toUpperCase()}</span>
            </div>
          </div>

          <div className={styles.colorBlocks}>
            Цвет контейнера
            <div className={styles.colorPicker}>
              <Input
                type="color"
                value={inputs.container}
                onChange={e => handleChange("container", e.target.value)}
              />
              <span>{inputs.container.toUpperCase()}</span>
            </div>
          </div>

        </div>
      </div>
      <div className={styles.button}>
        <Button
          text="Сохранить"
          onClick={handleSave}
          loading={isLoading}
          loadingText="Сохраняется..."
        />
      </div>
    </>
  )
}

export default GeneralConfig