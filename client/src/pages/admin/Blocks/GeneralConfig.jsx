import { useEffect, useState, useRef } from "react"

import { useSafeMessage } from "../../../hooks/useSafeMessage"

import { useConfig } from "../../../context"

import Button from "../../../components/Button"
import Input from "../../../components/Input"

import debug from "../../../utils/debug"

import api from "../../../services/api"

import styles from "./styles/GeneralConfig.module.scss"

const GeneralConfig = () => {
  const [isLoading, setIsLoading] = useState(false)
  const config = useConfig()
  const { title, setTitle, color, setColor, logo, setLogo } = config
  const safeMessage = useSafeMessage();
  const [topInput, setTopInput] = useState(title.top)
  const [bottomInput, setBottomInput] = useState(title.bottom)
  const [headerColorInput, setHeaderColorInput] = useState(color.header)
  const [contentColorInput, setContentColorInput] = useState(color.content)


  useEffect(() => {
    debug.log('Config context:', config)
  }, [])

  useEffect(() => {
    setTopInput(title.top)
    setBottomInput(title.bottom)
  }, [title])

  useEffect(() => {
    setHeaderColorInput(color.header)
    setContentColorInput(color.content)
  }, [color])

  const handleSave = async () => {
    try {
      setIsLoading(true)
      safeMessage("loading", "Данные сохраняются...", 1)

      // Update title and color
      await api.updateTitle({
        topTitle: topInput,
        bottomTitle: bottomInput,
        headerColor: headerColorInput
      })
      await setTitle({
        top: topInput,
        bottom: bottomInput
      })
      await setColor({
        header: headerColorInput,
        content: contentColorInput
      })

      safeMessage("success", "Данные сохранены!", 2.5)
    } catch (err) {
      console.error("Failed to update title:", err)
      safeMessage("error", "Ошибка!", 2.5)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpdate = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      safeMessage("error", "Пожалуйста, выберите файл изображения");
      return
    }

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('logo', file)

      const res = await api.uploadLogo(formData)
      setLogo(`${res.data.logoUrl}?t=${Date.now()}`)
      safeMessage("success", "Логотип загружен!");
    } catch (err) {
      console.error("Failed to upload logo:", err);
      safeMessage("error", "Ошибка загрузки логотипа!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      Название сайта:
      <Input
        type="text"
        value={topInput}
        onChange={e => setTopInput(e.target.value)}
        placeholder='Верхняя строка'
        className={styles.textInput}
      />
      <div style={{ height: '10px' }} />
      <Input
        type="text"
        value={bottomInput}
        onChange={e => setBottomInput(e.target.value)}
        placeholder="Нижняя строка"
        className={styles.textInput}
      />
      <div style={{ height: '20px' }} />
      <div className={styles.row}>
        <div className={styles.logoBlockContainer}>
          Загрузить логотип:
          {logo && (
            <img
              src={logo}
              alt="Текущий логотип"
              className={styles.image}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpdate}
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