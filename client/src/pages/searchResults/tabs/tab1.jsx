import { Divider } from 'antd';
import moment from 'moment';
import { Block } from './Components/Block';

import styles from '../searchResults.module.scss';
import { useLocation } from 'react-router';

const Tab1 = ({ data }) => {
  const location = useLocation()
  const locPatient = location?.state?.patient

  const patient = locPatient || data
  if (!patient) return <div>No patient data available.</div>

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
            <Block
              text="ФИО:"
              content={`${patient.lastName} ${patient.firstName} ${patient.patr}`}
            />
            <Block
              text="Дата и время поступления:"
              content={moment(patient.created_at).format('DD.MM.YYYY HH:mm')}
            />
            <Block
              text="Форма оказания помощи:"
              content={patient.type}
            />
            <Block
              text="Поступил:"
              content={patient.freq}
            />
          </div>

          <div className={styles.topFormsB}>
            <Block
              text="Пол:"
              content={patient.sex}
            />
            <Block
              text="Дата рождения:"
              content={moment(patient.birthDate).format('DD.MM.YYYY')}
            />
            {data.sender ? (
              <Block
                text="Направили:"
                content={
                  <>
                    {patient.sender}
                    <br />
                    {patient.sendingTime}
                  </>
                }
              />
            ) : (
              <Block
                text="Страховой полис:"
                content={patient.insurance}
              />
            )}

          </div>

          <div className={styles.topFormsC}>
            {patient.sender ? (
              <Block
                text="Страховой полис:"
                content={patient.insurance}
              />
            ) : (
              <></>
            )}
            <Block
              text="Номер телефона:"
              content={formatPhoneNumber(patient.phone)}
            />
            <Block
              text="Адрес:"
              content={patient.address}
            />
            <Block
              text="E-Mail:"
              content={patient.email}
            />
          </div>
        </div>

        {patient.firstDiag ? (
          <Block
            text="Диагноз при направлении:"
            content={patient.firstDiag}
          />
        ) : (
          <></>
        )}

        <Divider style={{ borderColor: 'rgba(0, 0, 0, 0.81)' }} />

        <div className={styles.bottomForms}>
          <Block
            text="Жалобы при поступлении:"
            content={patient.complaint}
          />
          <br />
          <Block
            text="История настоящего заболевания:"
            content={patient.anam}
          />
          <br />
          <Block
            text="Анамнез жизни:"
            content={patient.life}
          />
          <br />
          <Block
            text="Настоящее состояние больного:"
            content={patient.status}
          />
          <br />
          <Block
            text="Клинический диагноз:"
            content={
              <>
                {/* {patient.mkb} */}
                {patient.diag}
              </>
            }
          />
          <br />
          <Block
            text="Сопутствующие заболевания:"
            content={patient.sop_zab}
          />
          <br />
          <Block
            text="Рекомендации:"
            content={patient.rec}
          />
        </div>
      </div>
    </div>
  )
}

export default Tab1
