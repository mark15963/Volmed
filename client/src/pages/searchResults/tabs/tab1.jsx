import { Divider } from 'antd';
import styles from '../searchResults.module.css';
import moment from 'moment';

export const Tab1 = ({ data }) => {
    function formatPhoneNumber(phone) {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11 && digits.startsWith('7')) {
            return `+7(${digits.slice(1, 4)})${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
        }
        return phone;
    }

    return (
        <div className={styles.info}>
            <div className={styles.bg}>
                <div className={styles.topForms}>
                    <div className={styles.topFormsA}>
                        <div className={styles.title}>ФИО:
                            <span className={styles.data}>
                                {data.lastName} {data.firstName} {data.patr}
                            </span>
                        </div>
                        <div className={styles.title}>№ карты:<br />
                            <span>
                                {data.id}
                            </span>
                        </div>
                        <div className={styles.title}>Дата поступления: <br />
                            <span>
                                {moment(data.created_at).format('DD.MM.YYYY')}
                            </span>
                        </div>
                    </div>
                    <div className={styles.topFormsB}>
                        <div className={styles.title}>Пол: <br />
                            <span>
                                {data.sex}
                            </span>
                        </div>
                        <div className={styles.title}>Дата рождения:<br />
                            <span>
                                {moment(data.birthDate).format('DD.MM.YYYY')}
                            </span>
                        </div>
                    </div>
                    <div className={styles.topFormsC}>
                        <div className={styles.title}>Номер телефона: <br />
                            <span>
                                {formatPhoneNumber(data.phone)}
                            </span>
                        </div>
                        <div className={styles.title}>Адрес: <br />
                            <span>
                                {data.address}
                            </span>
                        </div>
                        <div className={styles.title}>E-Mail: <br />
                            <span>
                                {data.email}
                            </span>
                        </div>
                    </div>
                </div>

                <Divider style={{ borderColor: 'black' }} />

                <div className={styles.bottomForms}>
                    <div className={styles.title}>Жалобы при поступлении: <br />
                        <span>
                            {data.complaint}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>История настоящего заболевания: <br />
                        <span>
                            {data.anam}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Анамнез жизни: <br />
                        <span>
                            {data.life}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Настоящее состояние больного: <br />
                        <span>
                            {data.status}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Клинический диагноз: <br />
                        <span>
                            {/* {data.mkb} */}
                            {data.diag}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Сопутствующие заболевания: <br />
                        <span>
                            {data.sop_zab}
                        </span>
                    </div>
                    <br />
                    <div className={styles.title}>Рекомендации: <br />
                        <span>
                            {data.rec}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Tab1