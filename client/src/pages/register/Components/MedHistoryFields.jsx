import { Form, Input, Select, Tooltip } from 'antd';

import styles from '../register.module.scss'
import { useState } from 'react';
import Textarea from '../../../components/Textarea';

const isPastCutoffDate = new Date() > new Date('2025-05-31');

export const MedHistoryFields = ({ formValues, handleChange }) => {
  const [mkbOptions, setMkbOptions] = useState([])
  const [mkbFetching, setMkbFetching] = useState(false)

  // Fetch ICD(МКБ) API
  const fetchMkbSuggestions = async (query) => {
    if (!query) return [];

    try {
      const res = await axios.post(
        'https://api.gigdata.ru/api/v2/suggest/mkb',
        { query, count: 10 },
        {
          headers: {
            'Authorization': '8bt8og06l34vqy3o48s7mnb63lbp09rempo5nmk7',
            'Content-Type': 'application/json'
          }
        }
      );
      const data = res.data?.suggestions || [];

      return data
        .filter(item => item?.data?.code)
        .map(item => ({
          value: item.data.code,
          label: `${item.data.code} - ${item.value}`
        }));
    } catch (error) {
      console.error('Ошибка при получении подсказок МКБ:', error);
      return [];
    }
  };

  const selectState = (
    <Select>
      <Select.Option
        value='Стабильно'
      >
        Стабильно
      </Select.Option>
      <Select.Option
        value='Cредней степени тяжести'
      >
        Cредней степени тяжести
      </Select.Option>
      <Select.Option
        value='Критическое'
      >
        Критическое
      </Select.Option>
      <Select.Option
        value='Выписан'
      >
        Выписан
      </Select.Option>
    </Select>
  )

  return (
    <div className={styles.bottomForms}>
      <div className={styles.formItem}>
        <label>Жалобы при поступлении</label>
        <Textarea
          autoSize={{ minRows: 2, maxRows: 6 }}
          style={{ width: '100%' }}
        />
      </div>

      <div className={styles.formItem}>
        <label>История настоящего заболевания</label>
        <Textarea
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
      </div>

      <div className={styles.formItem}>
        <label>Анамнез жизни</label>
        <Textarea
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
      </div>

      <div className={styles.formItem}>
        <label>Настоящее состояние больного</label>
        <Textarea
          value={formValues.complaint}
          onChange={e => handleChange("complaint", e.target.value)}
          autoSize={{ minRows: 2, maxRows: 10 }}
        />
      </div>

      <div className={styles.formItem}>
        <label>Клинический диагноз (МКБ)</label>
        <Tooltip placement='top' title='функция работает до 31.05.2025'>
          <Select
            showSearch
            placeholder="Выберите диагноз из МКБ"
            filterOption={false}
            onSearch={isPastCutoffDate ? undefined : async (value) => {
              if (!value) {
                setMkbOptions([]);
                return;
              }
              setMkbFetching(true);
              const options = await fetchMkbSuggestions(value);
              setMkbOptions(options);
              setMkbFetching(false);
            }}
            onSelect={isPastCutoffDate ? undefined : (value, option) => {
              const currentDiag = form.getFieldValue('diag') || ''
              const newDiag = `${option.label};\n${currentDiag}`.trim()
              form.setFieldsValue({
                diag: newDiag,
                mkb: value,
              })
            }}
            notFoundContent={mkbFetching ? 'Поиск...' : 'Ничего не найдено'}
            options={isPastCutoffDate ? [] : mkbOptions}

            disabled={isPastCutoffDate}
          // disable style - main.jsx (colorBgContainerDisabled)
          />
        </Tooltip>
      </div>

      <div className={styles.formItem}>
        <Textarea
          placeholder="Диагноз"
          autoSize={{ minRows: 1, maxRows: 3 }}
        />
      </div>

      <div className={styles.formItem}>
        <label>Сопутствующие заболевания</label>
        <Textarea
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </div>

      <div className={styles.formItem}>
        <label>Рекомендации</label>
        <Textarea
          autoSize={{ minRows: 1, maxRows: 5 }}
        />
      </div>

      <div className={styles.formItem}>
        <label>Статус</label>
        {selectState}
      </div>
    </div>
  )
}