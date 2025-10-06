import { useEffect, useState } from "react"

import { useConfig } from "../../../context"

import Button from "../../../components/Button"
import Input from "../../../components/Input"

import api from "../../../services/api"

import styles from "./styles/GeneralConfig.module.scss"
import debug from "../../../utils/debug"

const GeneralConfig = ({ messageApi }) => {
  const [isLoading, setIsLoading] = useState(false)
  const config = useConfig()
  const { title, setTitle, color, setColor, logo, setLogo } = config

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
      await messageApi.open({
        type: 'loading',
        content: 'Данные сохраняются...',
        duration: 1
      })

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

      messageApi.success('Данные сохранены!', 2.5)
    } catch (err) {
      console.error("Failed to update title:", err)
      messageApi.error("Ошибка!", 2.5)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpdate = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      messageApi.error('Пожалуйста, выберите файл изображения');
      return
    }

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('logo', file)

      const res = await api.uploadLogo(formData)

      setLogo(`${res.data.logoUrl}?t=${Date.now()}`)
      messageApi.success('Логотип загружен!');
    } catch (err) {
      console.error("Failed to upload logo:", err);
      messageApi.error("Ошибка загрузки логотипа!");
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