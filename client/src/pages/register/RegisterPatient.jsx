import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { Input, Form, Alert, Radio, DatePicker, Select, message, Tooltip, Cascader } from "antd"
import { IMaskInput } from 'react-imask';
import dayjs, { datePickerLocale } from './dayjs.config'

import Button from '../../components/Buttons.tsx';

import { usePageTitle } from '../../components/PageTitle'
import styles from './register.module.css'
import api from '../../services/api';

const environment = import.meta.env.VITE_ENV
const apiUrl = import.meta.env.VITE_API_URL

export const RegisterPatient = ({ initialValues = null, isEditMode = false, patientId = null }) => {

    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()
    const [mkbOptions, setMkbOptions] = useState([])
    const [mkbFetching, setMkbFetching] = useState(false)

    const success = async () => {
        await messageApi
            .open({
                type: 'loading',
                content: 'Данные сохраняются...',
                duration: 1
            })
        messageApi.success('Данные сохранены!', 2.5)
    };

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

    usePageTitle("Регистрация пациента");

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                birthDate: initialValues.birthDate ? dayjs(initialValues.birthDate) : null
            });
        }
    }, [initialValues, form]);

    const onFinish = async (formValues) => {
        try {
            setIsLoading(true);
            setError('');

            const formattedValues = {
                ...formValues,
                patr: formValues.patr || "",
                birthDate: formValues.birthDate ? formValues.birthDate.format('YYYY-MM-DD') : null,
                phone: formValues.phone
                    ? `+7${formValues.phone.replace(/\D/g, '').replace(/^7/, '')}`
                    : '',
                email: formValues.email || "",
                address: formValues.address || "",
                complaint: formValues.complaint || "",
                anam: formValues.anam || "",
                life: formValues.life || "",
                status: formValues.status || "",
                diag: formValues.diag || "",
                mkb: formValues.mkb || "",
                sop_zab: formValues.sop_zab || "",
                rec: formValues.rec || "",
                state: formValues.state || "",

            };

            let response
            if (isEditMode && patientId) {
                response = await api.updatePatient(patientId, formattedValues)
            } else {
                response = await api.createPatient(formattedValues, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            await success()

            form.resetFields(['mkb'])

            setTimeout(() => {
                navigate(`/search/${isEditMode ? patientId : response.data.id}`, {
                    state: {
                        results: response.data,
                        searchQuery: `${response.data.lastName} ${response.data.firstName} ${response.data.patr}`
                    }
                });
            }, 1000)


        } catch (err) {
            setError(err.response?.data?.error || err.message);
            console.error('Registration error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                fullError: err,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isPastCutoffDate = new Date() > new Date('2025-05-31');

    const selectState = (
        <Select
            defaultValue='Стабильно'
        >
            <Option
                value='Стабильно'
            >
                Стабильно
            </Option>
            <Option
                value='Критическое'
            >
                Критическое
            </Option>
            <Option
                value='Выписан'
            >
                Выписан
            </Option>
        </Select>
    )

    return (
        <div className={styles.container}>
            {contextHolder}
            <h2 style={{ marginBottom: '20px' }}>
                {isEditMode ? 'Редактировать пациента' : 'Регистрация пациента'}
            </h2>
            <div className={styles.info}>
                <div className={styles.bg}>

                    <div className={styles.title}>
                        <p>Заполните ниформацию:</p>
                    </div>

                    {error && <Alert message={error} type='error' showIcon />}

                    <div className={styles.form}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            onFinishFailed={(info) => {
                                console.log('Validation Failed:', info);
                            }}
                            initialValues={{ sex: 'Мужской' }}
                        >
                            <div className={styles.topForms}>
                                <div className={styles.topFormsA}>
                                    <Form.Item
                                        label={<span className={styles.formLabel}>Фамилия</span>}
                                        name="lastName"
                                        rules={[{ required: true, message: 'Пожалуйста, введите фамилию' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className={styles.formLabel}>Имя</span>}
                                        name="firstName"
                                        rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className={styles.formLabel}>Отчество</span>}
                                        name="patr"
                                    >
                                        <Input />
                                    </Form.Item>
                                </div>

                                <div className={styles.topFormsB}>
                                    <Form.Item
                                        label={<span className={styles.formLabel}>Пол</span>}
                                        name="sex"
                                    >
                                        <Radio.Group>
                                            <Radio style={{ color: 'aliceblue' }} value="Мужской">М</Radio>
                                            <Radio style={{ color: 'aliceblue' }} value="Женский">Ж</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                    <Form.Item
                                        label={<span className={styles.formLabel}>Дата рождения</span>}
                                        name="birthDate"
                                        rules={[{ required: true, message: 'Пожалуйста, выберите дату рождения' }]}
                                    >

                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="DD.MM.YYYY"
                                            placeholder="Выберите дату"
                                            locale={datePickerLocale}
                                        />
                                    </Form.Item>
                                </div>

                                <div className={styles.topFormsC}>
                                    <Form.Item
                                        label={<span className={styles.formLabel}>Номер телефона</span>}
                                        name="phone"
                                    >
                                        <IMaskInput
                                            mask="+7(000)000-00-00"
                                            definitions={{ '0': /[0-9]/ }}
                                            // value={form.getFieldValue('phone') || ''}
                                            onAccept={(value) => {
                                                const cleaned = value === '7' ? '' : value;
                                                form.setFieldsValue({ phone: cleaned });
                                            }}
                                            placeholder="+7 (___) ___-__-__"
                                            style={{
                                                width: '100%',
                                                padding: '4px 11px',
                                                fontSize: '14px',
                                                lineHeight: '1.5',
                                                border: '1px solid #d9d9d9',
                                                borderRadius: '6px'
                                            }}
                                            onBlur={(e) => {
                                                const val = e.target.value;
                                                if (val && val.length < 16) {
                                                    // full mask length is 16: "+7(000)000-00-00"
                                                    message.warning('Номер телефона неполный');
                                                }
                                                form.setFieldsValue({ phone: val });
                                            }}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className={styles.formLabel}>Адрес</span>}
                                        name="address"
                                    >
                                        <Input
                                            placeholder="г. Москва, ул..."
                                            autoComplete='off'
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label={<span className={styles.formLabel}>E-Mail</span>}
                                        name="email"
                                        rules={[
                                            {
                                                type: 'email',
                                                message: ''
                                            }
                                        ]}
                                    >
                                        <Input
                                            placeholder=""
                                            autoComplete='off'
                                        />
                                    </Form.Item>
                                </div>
                            </div>

                            <div className={styles.bottomForms}>
                                <br />
                                <Form.Item
                                    label={<span className={styles.formLabel}>Жалобы при поступлении</span>}
                                    name="complaint"
                                >
                                    <Input.TextArea
                                        placeholder="Жалобы при поступлении"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>История настоящего заболевания</span>}
                                    name="anam"
                                >
                                    <Input.TextArea
                                        placeholder="История настоящего заболевания"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Анамнез жизни</span>}
                                    name="life"
                                >
                                    <Input.TextArea
                                        placeholder="Анамнез жизни"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Настоящее состояние больного</span>}
                                    name="status"
                                >
                                    <Input.TextArea
                                        placeholder="Настоящее состояние больного"
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
                                        placeholder="Сопутствующие заболевания"
                                        autoSize={{ minRows: 2, maxRows: 4 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Рекомендации</span>}
                                    name="rec"
                                >
                                    <Input.TextArea
                                        placeholder="Рекомендации"
                                        autoSize={{ minRows: 1, maxRows: 5 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Статус</span>}
                                    name='state'
                                >
                                    {selectState}
                                </Form.Item>

                                <div className={styles.buttons}>
                                    <Button
                                        text={
                                            isEditMode
                                                ? 'Сохранить изменения'
                                                : 'Зарегистрировать пациента'
                                        }
                                        type='submit'
                                        loading={isLoading}
                                    />

                                    <Button
                                        text='Назад'
                                        onClick={() => navigate(-1)}
                                    />
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default RegisterPatient