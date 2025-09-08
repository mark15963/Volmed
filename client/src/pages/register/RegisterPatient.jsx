//#region =====IMPORTS=====
// React, Router, Axios
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

const { Form, Alert, message } = await import('antd/es')
const { default: dayjs, datePickerLocale } = await import('./dayjs.config')

// Components
import { usePageTitle } from '../../components/PageTitle'
import { PersonalInfoFields } from './Components/PersonalInfoFields.jsx'
import { Buttons } from './Components/Buttons.jsx'
import { MedHistoryFields } from './Components/MedHistoryFields.jsx'

// UI & Services
import styles from './register.module.css'
import api from '../../services/api';
//#endregion

export const RegisterPatient = ({ initialValues = null, isEditMode = false, patientId = null }) => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

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
                birthDate: formValues.birthDate?.format('YYYY-MM-DD'),
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
                })
            }

            await messageApi.open({
                type: 'loading',
                content: 'Данные сохраняются...',
                duration: 1
            })
            messageApi.success('Данные сохранены!', 2.5)

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

    return (
        <div className={styles.container}>
            {contextHolder}
            <span className={styles.pageTitle}>
                {isEditMode ? 'Редактировать пациента' : 'Регистрация пациента'}
            </span>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={(info) => {
                    messageApi.error("Ошибка! Проверьте все поля.")
                    console.log('Validation Failed. Check fields', info);
                }}
                initialValues={{
                    sex: 'Мужской',
                    state: 'Стабильно'
                }}
            >
                <div className={styles.info}>
                    <div className={styles.bg}>
                        <div className={styles.title}>
                            <p>Заполните ниформацию:</p>
                        </div>

                        {error && <Alert message={error} type='error' showIcon />}

                        <div className={styles.form}>
                            <PersonalInfoFields form={form} messageApi={messageApi} />
                            <MedHistoryFields form={form} />
                            <Buttons form={form} isEditMode={isEditMode} />
                        </div>
                    </div>
                </div >
            </Form>
        </div >
    )
}

export default RegisterPatient
