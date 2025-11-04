import { Divider } from 'antd';
import moment from 'moment';
import { Block } from './Components/Block';

import styles from '../searchResults.module.scss';

const Tab1 = ({ data }) => {
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
              content={`${data.lastName} ${data.firstName} ${data.patr}`}
            />
            <Block
              text="Дата и время поступления:"
              content={moment(data.created_at).format('DD.MM.YYYY HH:mm')}
            />
            <Block
              text="Форма оказания помощи:"
              content={data.type}
            />
            <Block
              text="Поступил:"
              content={data.freq}
            />
          </div>

          <div className={styles.topFormsB}>
            <Block
              text="Пол:"
              content={data.sex}
            />
            <Block
              text="Дата рождения:"
              content={moment(data.birthDate).format('DD.MM.YYYY')}
            />
            {data.sender ? (
              <Block
                text="Направили:"
                content={
                  <>
                    {data.sender}
                    <br />
                    {data.sendingTime}
                  </>
                }
              />
            ) : (
              <Block
                text="Страховой полис:"
                content={data.insurance}
              />
            )}

          </div>

          <div className={styles.topFormsC}>
            {data.sender ? (
              <Block
                text="Страховой полис:"
                content={data.insurance}
              />
            ) : (
              <></>
            )}
            <Block
              text="Номер телефона:"
              content={formatPhoneNumber(data.phone)}
            />
            <Block
              text="Адрес:"
              content={data.address}
            />
            <Block
              text="E-Mail:"
              content={data.email}
            />
          </div>
        </div>

        {data.firstDiag ? (
          <Block
            text="Диагноз при направлении:"
            content={data.firstDiag}
          />
        ) : (
          <></>
        )}

        <Divider style={{ borderColor: 'rgba(0, 0, 0, 0.81)' }} />

        <div className={styles.bottomForms}>
          <Block
            text="Жалобы при поступлении:"
            content={data.complaint}
          />
          <br />
          <Block
            text="История настоящего заболевания:"
            content={data.anam}
          />
          <br />
          <Block
            text="Анамнез жизни:"
            content={data.life}
          />
          <br />
          <Block
            text="Настоящее состояние больного:"
            content={data.status}
          />
          <br />
          <Block
            text="Клинический диагноз:"
            content={
              <>
                {/* {data.mkb} */}
                {data.diag}
              </>
            }
          />
          <br />
          <Block
            text="Сопутствующие заболевания:"
            content={data.sop_zab}
          />
          <br />
          <Block
            text="Рекомендации:"
            content={data.rec}
          />
        </div>
      </div>
    </div>
  )
}

export default Tab1
