import { Form, Input, Select, Tooltip } from 'antd';

import styles from '../register.module.css'
import { useState } from 'react';

const isPastCutoffDate = new Date() > new Date('2025-05-31');

export const MedHistoryFields = ({ form }) => {
    const [mkbOptions, setMkbOptions] = useState([])
    const [mkbFetching, setMkbFetching] = useState(false)

    // Fetch ICD(МКБ) API
    const fetchMkbSuggestions = async (query) => {
        if (!query) return [];

        try {
            const response = await axios.post(
                'https://api.gigdata.ru/api/v2/suggest/mkb',
                { query, count: 10 },
                {
                    headers: {
                        'Authorization': '8bt8og06l34vqy3o48s7mnb63lbp09rempo5nmk7',
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = response.data?.suggestions || [];

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
            <Form.Item
                label={<span className={styles.formLabel}>Жалобы при поступлении</span>}
                name="complaint"
            >
                <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    style={{ width: '100%' }}
                />
            </Form.Item>

            <Form.Item
                label={<span className={styles.formLabel}>История настоящего заболевания</span>}
                name="anam"
            >
                <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 6 }}
                />
            </Form.Item>

            <Form.Item
                label={<span className={styles.formLabel}>Анамнез жизни</span>}
                name="life"
            >
                <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 6 }}
                />
            </Form.Item>

            <Form.Item
                label={<span className={styles.formLabel}>Настоящее состояние больного</span>}
                name="status"
            >
                <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 10 }}
                />
            </Form.Item>

            <Form.Item
                label={<span className={styles.formLabel}>Клинический диагноз (МКБ)</span>}
                name="mkb"
            >
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
                        style={{ width: '100%' }}
                        disabled={isPastCutoffDate}
                    // disable style - main.jsx (colorBgContainerDisabled)
                    />
                </Tooltip>
            </Form.Item>

            <Form.Item
                name="diag"
            >
                <Input.TextArea
                    placeholder="Диагноз"
                    autoSize={{ minRows: 1, maxRows: 3 }}
                />
            </Form.Item>

            <Form.Item
                label={<span className={styles.formLabel}>Сопутствующие заболевания</span>}
                name="sop_zab"
            >
                <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 4 }}
                />
            </Form.Item>

            <Form.Item
                label={<span className={styles.formLabel}>Рекомендации</span>}
                name="rec"
            >
                <Input.TextArea
                    autoSize={{ minRows: 1, maxRows: 5 }}
                />
            </Form.Item>

            <Form.Item
                label={<span className={styles.formLabel}>Статус</span>}
                name='state'
            >
                {selectState}
            </Form.Item>
        </div>
    )
}