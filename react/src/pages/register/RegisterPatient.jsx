import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Form, Alert, Radio, DatePicker, Select } from "antd";
const { Option } = Select
import styles from './register.module.css'
import moment from 'moment'


export const RegisterPatient = ({
    initialValues = null,
    isEditMode = false,
    patientId = null,
    onSubmitSuccess = () => { }
}) => {

    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [form] = Form.useForm()

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                birthDay: initialValues.birthDay ? moment(initialValues.birthDay) : null
            });
        }
    }, [initialValues, form]);

    /*
        const handleSearchChange = (e) => {
            setSearchValue()
        }
    */
    const handleChange = (e) => {
        setSearchValue(e.target.value)
        setError('')
    }
    /*
        const handleSearchSubmit = async (e) => {
            e?.preventDefault();
    
            // Validate input
            if (!searchValue.trim()) {
                setError('Пожалуйста, введите номер истории болезни');
                return;
            }
    
            if (isNaN(searchValue)) {
                setError('Номер истории болезни должен быть числом');
                return;
            }
    
            setIsLoading(true);
            setError('');
    
            try {
                const response = await fetch(`http://localhost:5000/api/patients/${searchValue}`);
    
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Пациент не найден');
                    }
                    throw new Error('Ошибка при получении данных пациента');
                }
    
                const patientData = await response.json();
    
                // Fill form with existing patient data
                form.setFieldsValue({
                    lastName: patientData.lastName,
                    firstName: patientData.firstName,
                    patr: patientData.patr,
                    sex: patientData.sex,
                    birthDay: moment(patientData.birthDay).format('YYYY-MM-DD'),
                    phone: patientData.phone,
                    address: patientData.address,
                    complaint: patientData.complaint,
                    anam: patientData.anam,
                    life: patientData.life,
                    status: patientData.status,
                    mkb: patientData.mkb,
                    diag: patientData.diag,
                    sop_zab: patientData.sop_zab,
                    rec: patientData.rec
                });
    
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
    */
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate input
        if (!searchValue.trim()) {
            setError('Please enter a patient ID')
            return
        }

        if (isNaN(searchValue)) {
            setError('Patient ID must be a number')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(`http://localhost:5000/api/patients/${searchValue}`)

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Patient not found')
                }
                throw new Error('Failed to fetch patient data')
            }

            const patientData = await response.json()

            // Navigate to results page with the patient data
            navigate('/search', {
                state: {
                    results: [patientData], // Wrap in array to match table structure
                    searchQuery: searchValue
                }
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const onFinish = async (formValues) => {
        try {
            setIsLoading(true);
            setError('');

            const formattedValues = {
                ...formValues,
                birthDay: formValues.birthDay ? moment(formValues.birthDay).format('YYYY-MM-DD') : null
            };

            let response
            let url = 'http://localhost:5000/api/patients'

            if (isEditMode && patientId) {
                response = await fetch(`${url}/${patientId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formattedValues),
                });
            } else {
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formattedValues),
                });
            }

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Ошибка при сохранении данных');
            }


            if (onSubmitSuccess) {
                onSubmitSuccess(responseData);
            } else {
                navigate('/search', {
                    state: {
                        results: [responseData],
                        searchQuery: `${responseData.lastName} ${responseData.firstName}`
                    }
                });
            }

        } catch (err) {
            setError(err.message);
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainBlock}>
                <div className={styles.info}>
                    <div className={styles.title}>
                        <h2
                            style={{ marginBottom: '20px' }}
                        >
                            {isEditMode ? 'Редактировать пациента' : 'Регистрация пациента'}
                        </h2>
                        <p>Заполните ниформацию:</p>
                    </div>

                    {error && <Alert message={error} type='error' showIcon />}

                    <div className={styles.form}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={{ sex: 'Мужской' }}
                        >
                            <div className={styles.topForms}>
                                <div className={styles.topFormsA}>
                                    <Form.Item
                                        label="Фамилия"
                                        name="lastName"
                                        rules={[{ required: true, message: 'Пожалуйста, введите фамилию' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="Имя"
                                        name="firstName"
                                        rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="Отчество"
                                        name="patr"
                                    >
                                        <Input />
                                    </Form.Item>
                                </div>

                                <div className={styles.topFormsB}>
                                    <Form.Item
                                        label="Пол"
                                        name="sex"
                                    >
                                        <Radio.Group>
                                            <Radio value="Мужской">М</Radio>
                                            <Radio value="Женский">Ж</Radio>
                                        </Radio.Group>
                                    </Form.Item>

                                    <Form.Item
                                        label="Дата рождения"
                                        name="birthDay"
                                        rules={[{ required: true, message: 'Пожалуйста, выберите дату рождения' }]}
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="DD.MM.YYYY"
                                            placeholder="Выберите дату"
                                        />
                                    </Form.Item>
                                </div>

                                <div className={styles.topFormsC}>
                                    <Form.Item
                                        label="Номер телефона"
                                        name="phone"
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="Адрес"
                                        name="address"
                                    >
                                        <Input placeholder="г. Москва, ул..." />
                                    </Form.Item>
                                </div>
                            </div>
                            <div className='bottomForms'>
                                <Form.Item
                                    label="Жалобы при поступлении"
                                    name="complaint"
                                >
                                    <Input.TextArea
                                        placeholder="Жалобы при поступлении"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="История настоящего заболевания"
                                    name="anam"
                                >
                                    <Input.TextArea
                                        placeholder="История настоящего заболевания"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Анамнез жизни"
                                    name="life"
                                >
                                    <Input.TextArea
                                        placeholder="Анамнез жизни"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Настоящее состояние больного"
                                    name="status"
                                >
                                    <Input.TextArea
                                        placeholder="Настоящее состояние больного"
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Клинический диагноз (МКБ)"
                                    name="mkb"
                                >
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        style={{ width: '100%' }}>
                                        <Option value="">Не выбрано</Option>
                                        <Option value="Другие">Другие</Option>
                                        {/* Add your MKB options here */}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label="Диагноз"
                                    name="diag"
                                >
                                    <Input.TextArea
                                        placeholder="Диагноз"
                                        autoSize={{ minRows: 1, maxRows: 3 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Сопутствующие заболевания"
                                    name="sop_zab"
                                >
                                    <Input.TextArea
                                        placeholder="Сопутствующие заболевания"
                                        autoSize={{ minRows: 2, maxRows: 4 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Рекомендации"
                                    name="rec"
                                >
                                    <Input.TextArea
                                        placeholder="Рекомендации"
                                        autoSize={{ minRows: 1, maxRows: 5 }}
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isLoading}
                                    >
                                        {isEditMode ? 'Сохранить изменения' : 'Зарегистрировать пациента'}
                                    </Button>
                                    <Button
                                        style={{ marginLeft: 8 }}
                                        onClick={() => navigate('/')}
                                    >
                                        На главную
                                    </Button>
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>

        </div>
    )
}