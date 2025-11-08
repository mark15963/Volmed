import { DatePicker, Radio, Form, Select } from 'antd';
import { IMaskInput } from 'react-imask';
const { default: dayjs, datePickerLocale } = await import('../dayjs.config')

import Input from '../../../components/Input';

import styles from '../register.module.scss'

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
            options={[
              { value: 'Плановая', label: 'Плановая' },
              { value: 'Экстренная', label: 'Экстренная' }
            ]}
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
            <Radio style={{ color: 'aliceblue' }} value="Мужской">М</Radio>
            <Radio style={{ color: 'aliceblue' }} value="Женский">Ж</Radio>
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
          <IMaskInput
            mask="+7(000)000-00-00"
            value={formValues.phone}
            definitions={{ '0': /[0-9]/ }}
            onAccept={(val) => handleChange('phone', val === '7' ? '' : val)}
            onBlur={(e) => {
              const val = e.target.value;
              if (val && val.length < 16) {
                // full mask length is 16: "+7(000)000-00-00"
                safeMessage("warning", "Номер телефона неполный");
              }
              handleChange('phone', val);
            }}
            placeholder="+7 (___) ___-__-__"
            style={{
              width: '100%',
              padding: '4px 11px',
              fontSize: '14px',
              lineHeight: '1.5',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
            }}
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
          <label>E-Mail</label>
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
          options={[
            { value: 'Впервые', label: 'Впервые' },
            { value: 'Повторно', label: 'Повторно' }
          ]}
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
