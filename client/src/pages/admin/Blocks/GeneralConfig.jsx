import { useEffect, useState } from "react"

import { useConfig } from "../../../context"

import Button from "../../../components/Button"
import Input from "../../../components/Input"

import api from "../../../services/api"

import styles from "./styles/GeneralConfig.module.scss"

const GeneralConfig = ({ messageApi }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { title, setTitle, color, setColor } = useConfig()
  const [topInput, setTopInput] = useState(title.top)
  const [bottomInput, setBottomInput] = useState(title.bottom)
  const [headerColorInput, setHeaderColorInput] = useState(color.header)
  const [contentColorInput, setContentColorInput] = useState(color.content)

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

      <div className={styles.colorBlocksContainer}>
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

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          Цвет заднего фона
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
            <Input
              type="color"
              value={contentColorInput}
              onChange={e => setContentColorInput(e.target.value)}
            />
            <span>{contentColorInput.toUpperCase()}</span>
          </div>
        </div>

      </div>
      <br />
      <Button
        text="Сохранить"
        onClick={handleSave}
        loading={isLoading}
      />
    </>
  )
}
export default GeneralConfig