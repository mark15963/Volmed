import { DatePicker, Form, Input, Radio, Select } from 'antd';

const { default: dayjs, datePickerLocale } = await import('../dayjs.config')

import styles from '../register.module.css'
import { IMaskInput } from 'react-imask';

export const PersonalInfoFields = ({ form }) => {
    return (
        <div>
            <div className={styles.topForms}>
                <div className={styles.topFormsA}>
                    <Form.Item
                        label={<span className={styles.formLabel}>Фамилия</span>}
                        name="lastName"
                        rules={[{
                            required: true,
                            message: ''
                        }]}
                    >
                        <Input
                            placeholder='Фамилия'
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles.formLabel}>Имя</span>}
                        name="firstName"
                        rules={[{
                            required: true,
                            message: ''
                        }]}
                    >
                        <Input placeholder='Имя' />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles.formLabel}>Отчество</span>}
                        name="patr"
                    >
                        <Input placeholder='Отчество' />
                    </Form.Item>

                    <Form.Item
                        label={<span className={styles.formLabel}>Форма оказания помощи</span>}
                        name="type"
                    >
                        <Select
                            options={[
                                { value: 'Плановая', label: 'Плановая' },
                                { value: 'Экстренная', label: 'Экстренная' }
                            ]}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span className={styles.formLabel}>Поступил</span>}
                        name="freq"
                    >
                        <Select
                            options={[
                                { value: 'Впервые', label: 'Впервые' },
                                { value: 'Повторно', label: 'Повторно' }
                            ]}
                        />
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
                        rules={[{
                            required: true,
                            message: ''
                        }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD.MM.YYYY"
                            placeholder="Выберите дату"
                            locale={datePickerLocale}
                        />
                    </Form.Item>
                    <Form.Item
                        label={<span className={styles.formLabel}>Направили</span>}
                        name="sender"
                    >
                        <Input placeholder='Направили' />
                    </Form.Item>
                    <Form.Item
                        label={<span className={styles.formLabel}>Дата и время направления</span>}
                        name="sendingTime"
                    >
                        <Input placeholder='Дата и время направления' />
                    </Form.Item>
                </div>

                <div className={styles.topFormsC}>
                    <Form.Item
                        label={<span className={styles.formLabel}>Страховой полис</span>}
                        name="insurance"
                    >
                        <Input placeholder='Страховой полис' />
                    </Form.Item>
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
                                borderRadius: '6px',
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
                            placeholder="E-Mail"
                            autoComplete='off'
                        />
                    </Form.Item>
                </div>

            </div>
            <Form.Item
                label={<span className={styles.formLabel}>Диагноз при направлении</span>}
                name="firstDiag"
                style={{ borderBottomStyle: 'solid', borderBottomColor: 'black', borderBottomWidth: '1px', paddingBottom: '20px' }}
            >
                <Input placeholder='Диагноз при направлении' />
            </Form.Item>
        </div>
    )
}
