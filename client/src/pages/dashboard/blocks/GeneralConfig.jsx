//#region ===== IMPORTS ===== 
import { useEffect } from "react"

// Components
import Button from "../../../components/Button"
import Input from "../../../components/Input"

// Tools
import { useSafeMessage } from "../../../hooks/useSafeMessage"
import { useGeneralConfig } from "./hooks/GeneralConfig.hooks"
import { useConfig } from "../../../context"
import debug from "../../../utils/debug"

// UI
import styles from "./styles/GeneralConfig.module.scss"
import { Select } from "antd"
//#endregion
/**
 * GeneralConfig Component
 * -----------------------
 * Displays and manages the application's general configuration settings, including the site title, logo, and color palette customization.
 *
 * This component interacts with the global configuration context and uses the `useGeneralConfig` hook to handle local input state, updates, and saving. It also integrates `useSafeMessage` for user feedback and `debug` for development logging.
 *
 * @description
 * **Features:**
 * - Edit the website title and save changes.
 * - Upload and preview a logo image.
 * - Adjust and preview header, background, and container colors.
 * - Disable inputs and show loading states during save operations.
 */
const GeneralConfig = () => {
  const config = useConfig()
  const safeMessage = useSafeMessage();

  /** @type {{ isLoading: boolean, inputs: any, handleChange: Function, handleSave: Function, handleLogoUpdate: Function }} */
  const { isLoading, inputs, handleChange, handleSave, handleLogoUpdate } = useGeneralConfig(config, safeMessage)

  useEffect(() => {
    debug.log('Config context:', config)
  }, [])

  /**
   * Handles logo file selection and preview before saving.
   *
   * @async
   * @function handleLogoUpdateWrapper
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event.
   * @returns {Promise<void>} Resolves when the logo preview is updated.
   *
   * @description
   * This function:
   * - Extracts the uploaded file from the input event.
   * - Passes it to `handleLogoUpdate()`.
   * - Saves in local, server and cache.
   */
  const handleLogoUpdateWrapper = async (e) => {
    const file = e.target.files[0];
    if (!file) return
    try {
      await handleLogoUpdate(file);
      e.target.value = ''
    } catch {

    }
  };

  const selectTableTheme = (
    <Select
      value={inputs.table}
      onChange={(value) => {
        handleChange("table", value)
      }}
      className={styles.themePicker}
    >
      <Select.Option value="default">Стандартная</Select.Option>
      <Select.Option value="light">Светлая</Select.Option>
      <Select.Option value="dark">Темная</Select.Option>
    </Select>
  )
  const selectAppTheme = (
    <Select
      value={inputs.app}
      onChange={(value) => {
        handleChange("app", value)
      }}
      className={styles.themePicker}
    >
      <Select.Option value="default">Стандартная</Select.Option>
      <Select.Option value="light">Светлая</Select.Option>
      <Select.Option value="dark">Темная</Select.Option>
    </Select>
  )

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
          <Input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpdateWrapper}
            loading={isLoading}
            loadingText="Сохраняется..."
          />
        </div>

        <div className={styles.blocksColorContainer}>
          <div className={styles.paletteTitle}>
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

        <div className={styles.themeColorContainer}>
          <div className={styles.themeTitle}>
            Тема:
          </div>
          <div className={styles.themeBlocks}>
            <p>Тема сайта:</p>
            <div className={styles.themePicker}>
              {selectAppTheme}
            </div>
          </div>
          <div className={styles.themeBlocks}>
            <p>Таблицы:</p>
            <div className={styles.themePicker}>
              {selectTableTheme}
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