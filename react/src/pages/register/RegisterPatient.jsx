import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import { Button, Input, Form, Alert, Radio, DatePicker, Select, Upload, message } from "antd"
import { UploadOutlined } from '@ant-design/icons'

import dayjs, { datePickerLocale } from './dayjs.config'

import { usePageTitle } from '../../components/PageTitle/PageTitle'
import styles from './register.module.css'

const { Option } = Select
const { Dragger } = Upload;

export const RegisterPatient = ({
    initialValues = null,
    isEditMode = false,
    patientId = null,
}) => {

    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage();

    const success = () => {
        messageApi
            .open({
                type: 'loading',
                content: 'Данные сохраняются...',
                duration: 2
            })
            .then(() => messageApi.success('Данные сохранены!', 2.5))
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        action: `http://localhost:5000/api/patients/${patientId || 'temp'}/upload`,
        onChange(info) {
            const { status } = info.file
            if (status !== 'uploading') {
                setFileList(info.fileList)
            }
            if (status === 'done') {
                messageApi.success(`${info.file.name} файл успешно загружен.`);
            } else if (status === 'error') {
                messageApi.error(`${info.file.name} ошибка загрузки файла.`);
            } else if (status === 'removed') {

            }
        },
        onRemove: async (file) => {
            try {
                // Only attempt deletion if the file was successfully uploaded
                if (file.response?.path) {
                    await axios.delete(`http://localhost:5000/api/files`, {
                        data: { filePath: file.response.path }
                    });
                }
                return true; // Allow removal from list
            } catch (error) {
                messageApi.error(`Ошибка удаления файла: ${file.name}`);
                return false; // Prevent removal from list
            }
        },
        beforeUpload(file) {
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                messageApi.error('Файл должен быть меньше 10MB!');
                return Upload.LIST_IGNORE;
            }
            return true;
        },
        defaultFileList: []
    }

    usePageTitle("Регистрация пациента");

    console.log(initialValues)

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                birthDate: initialValues.birthDate ? dayjs(initialValues.birthDate) : null
            });
        }
    }, [initialValues, form]);

    console.log(isEditMode, patientId)

    const onFinish = async (formValues) => {
        try {
            setIsLoading(true);
            setError('');

            const formattedValues = {
                ...formValues,
                birthDate: formValues.birthDate ? formValues.birthDate.format('YYYY-MM-DD') : null
            };

            let response
            let url = 'http://localhost:5000/api/patients'

            console.log(isEditMode, patientId)
            if (isEditMode && patientId) {
                response = await axios.put(`${url}/${patientId}`, formattedValues, {
                });
                console.log('PUT:', formattedValues)
            } else {
                response = await axios.post(url, formattedValues, {
                });
                console.log('POST:', formattedValues)
            }

            const responseData = response.data;

            // Check for successful status (2xx)
            if (response.status < 200 || response.status >= 300) {
                throw new Error(responseData.error || 'Ошибка при сохранении данных');
            }

            success()

            await new Promise(resolve => setTimeout(resolve, 3000))


            if (!isEditMode) {
                console.log(responseData.id)
                navigate(`/search/${responseData.id}`, {
                    state: {
                        results: responseData,
                        searchQuery: `${responseData.lastName} ${responseData.firstName} ${responseData.patr}`
                    }
                });

                console.log('Registered', responseData)
            } else {
                console.log(patientId)
                navigate(`/search/${patientId}`, {
                    state: {
                        results: responseData,
                        searchQuery: `${responseData.lastName} ${responseData.firstName} ${responseData.patr}`
                    }
                });

                console.log('Updated', responseData)
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
            {contextHolder}
            <h2
                style={{ marginBottom: '20px' }}
            >
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
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label={<span className={styles.formLabel}>Адрес</span>}
                                        name="address"
                                    >
                                        <Input placeholder="г. Москва, ул..." />
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
                                        <Input placeholder="" />
                                    </Form.Item>
                                </div>
                            </div>

                            <div className={styles.bottomForms}>
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
                                        autoSize={{ minRows: 2, maxRows: 6 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span className={styles.formLabel}>Клинический диагноз (МКБ)</span>}
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
                                    label={<span className={styles.formLabel}>Диагноз</span>}
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
                                    label={
                                        <span className={styles.formLabel}>
                                            Медицинские документы
                                        </span>
                                    }
                                >

                                    <Dragger {...uploadProps}>
                                        <p className="ant-upload-drag-icon">
                                            <UploadOutlined />
                                        </p>
                                        <p className="ant-upload-text">Нажмите или перетащите файлы в эту область</p>
                                        <p className="ant-upload-hint">
                                            Поддерживаются файлы до 10MB (PDF, JPG, PNG)
                                        </p>

                                    </Dragger>
                                </Form.Item>

                                <div className={styles.buttons}>
                                    <Button
                                        htmlType="submit"
                                        loading={isLoading}
                                    >
                                        {isEditMode ? 'Сохранить изменения' : 'Зарегистрировать пациента'}
                                    </Button>
                                    <Button
                                        style={{ marginLeft: 8 }}
                                        onClick={() => navigate(-1)}
                                    >
                                        Назад
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}