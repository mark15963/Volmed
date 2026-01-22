//#region ===== IMPORTS =====
import { IMaskInput } from 'react-imask';


// TOOLS
import Input from '../../../components/Input';
const { default: dayjs, datePickerLocale } = await import('../../../utils/dayjs.config')
import { PhoneField } from '../../../components/PhoneField';
import {
  ADMISSION_TYPE_OPTIONS,
  SEX_OPTIONS,
  FORM_OF_CARE_OPTIONS
} from '../../../constants';

// UI
import { DatePicker, Radio, Form, Select } from 'antd';
import styles from '../register.module.scss'
//#endregion

export const PersonalInfoFields = ({ formValues, handleChange, safeMessage }) => {
  return (
    <div className={styles.topForms}>
      <div className={styles.topFormsA}>
        <div className={styles.formItem}>
          <label>Фамилия</label>
          <Input
            placeholder='Фамилия'
            value={formValues.lastName}
            onChange={e => handleChange('lastName', e.target.value)}
          />
        </div>

        <div className={styles.formItem}>
          <label>Имя</label>
          <Input
            placeholder='Имя'
            value={formValues.firstName}
            onChange={e => handleChange('firstName', e.target.value)}
          />
        </div>

        <div className={styles.formItem}>
          <label>Отчество</label>
          <Input
            placeholder='Отчество'
            value={formValues.patr}
            onChange={e => handleChange('patr', e.target.value)} />
        </div>

        <div className={styles.formItem}>
          <label>Форма оказания помощи</label>
          <Select
            value={formValues.type}
            onChange={val => handleChange('type', val)}
            options={FORM_OF_CARE_OPTIONS}
          />
        </div>
      </div>

      <div className={styles.topFormsB}>
        <div className={styles.formItem}>
          <label>Пол</label>
          <Radio.Group
            style={{ width: '100%' }}
            value={formValues.sex}
            onChange={e => handleChange("sex", e.target.value)}
          >
            {SEX_OPTIONS.map(opt => (
              <Radio
                key={opt.value}
                style={{ color: 'aliceblue', fontWeight: '500' }}
                value={opt.value}
              >
                {opt.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        <div className={styles.formItem}>
          <label>Дата рождения</label>
          <DatePicker
            style={{ width: '100%' }}
            value={formValues.birthDate}
            onChange={date => handleChange("birthDate", date)}
            format="DD.MM.YYYY"
            placeholder="Выберите дату"
            locale={datePickerLocale}
          />
        </div>

        <div className={styles.formItem}>
          <label>Направили</label>
          <Input
            placeholder='Направили'
            value={formValues.sender}
            onChange={e => handleChange("sender", e.target.value)}
          />
        </div>

        <div className={styles.formItem}>
          <label>Дата и время направления</label>
          <Input
            placeholder='Дата и время направления'
            value={formValues.sendingTime}
            onChange={e => handleChange("sendingTime", e.target.value)}
          />
        </div>
      </div>

      <div className={styles.topFormsC}>
        <div className={styles.formItem}>
          <label>Страховой полис</label>
          <Input
            placeholder='Страховой полис'
            value={formValues.insurance}
            onChange={e => handleChange('insurance', e.target.value)}
          />
        </div>

        <div className={styles.formItem}>
          <label>Номер телефона</label>
          <PhoneField
            value={formValues.phone}
            onChange={(val) => handleChange('phone', val)}
            safeMessage={safeMessage}
          />
        </div>

        <div className={styles.formItem}>
          <label>Адрес</label>
          <Input
            placeholder="г. Москва, ул..."
            autoComplete='off'
            value={formValues.address}
            onChange={e => handleChange('address', e.target.value)}
          />
        </div>

        <div className={styles.formItem}>
          <label>E-mail</label>
          <Input
            placeholder="E-Mail"
            autoComplete='off'
            type='email'
            value={formValues.email}
            onChange={e => handleChange('email', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.freq}>
        <label>Поступил</label>
        <Select
          value={formValues.freq}
          onChange={val => handleChange('freq', val)}
          options={ADMISSION_TYPE_OPTIONS}
        />
      </div>
      <div className={styles.firstDiag}>
        <label>Диагноз при направлении</label>
        <Input
          placeholder='Диагноз при направлении'
          value={formValues.firstDiag}
          onChange={e => handleChange('firstDiag', e.target.value)}
        />
      </div>
    </div>
  )
}
