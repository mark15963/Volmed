//#region =====IMPORTS=====
// React, Router, Axios
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

const { default: dayjs, datePickerLocale } = await import('./dayjs.config')

// Components
import { usePageTitle } from '../../utils/usePageTitle'
import { PersonalInfoFields } from './Components/PersonalInfoFields'
import { MedHistoryFields } from './Components/MedHistoryFields'
import { Buttons } from './Components/Buttons'

// Hooks & Context
import { useAuth } from "../../context"
import { useSafeMessage } from '../../hooks/useSafeMessage'

// Constants
import { PATIENT_FORM_INITIAL_VALUES } from '../../constants'

// UI & Services
import styles from './register.module.scss'
import api from '../../services/api.js'
import debug from '../../utils/debug.js'
//#endregion


export const RegisterPatient = ({ initialValues = null, isEditMode = false, patientId = null }) => {
  const navigate = useNavigate()
  const { authState } = useAuth();

  const safeMessage = useSafeMessage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formValues, setFormValues] = useState(() => {
    if (!initialValues) {
      return PATIENT_FORM_INITIAL_VALUES
    }
    return {
      ...initialValues,
      birthDate: initialValues.birthDate
        ? dayjs(initialValues.birthDate)
        : null
    }
  })
  // const [formValues, setFormValues] = useState({
  //   lastName: '',
  //   firstName: '',
  //   patr: '',
  //   type: 'Плановая',
  //   sex: '',
  //   birthDate: null,
  //   sender: '',
  //   sendingTime: '',
  //   insurance: '',
  //   phone: '',
  //   address: '',
  //   email: '',
  //   freq: 'Впервые',
  //   firstDiag: '',
  //   complaint: '',
  //   anam: '',
  //   life: '',
  //   status: '',
  //   mkb: '',
  //   diag: '',
  //   sop_zab: '',
  //   rec: '',
  //   state: 'Удовлетворительно',
  // })

  const doctor = `${authState.user?.lastName ?? ""} ${authState.user?.firstName ?? ""} ${authState.user?.patr ?? ""}`.trim();

  // useEffect(() => {
  //   if (initialValues) {
  //     setFormValues({
  //       ...initialValues,
  //       birthDate: initialValues.birthDate
  //         ? dayjs(initialValues.birthDate)
  //         : null
  //     });
  //   }
  // }, [initialValues]);

  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true);
      safeMessage("loading", "Данные сохраняются...", 1)
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
        doctor: doctor || "",
      };

      let res
      if (isEditMode && patientId) {
        res = await api.updatePatient(patientId, formattedValues)
        if (!res.ok) throw new Error(res.message)
      } else {
        res = await api.createPatient(formattedValues, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (!res.ok) throw new Error(res.message)
      }

      setFormValues(prev => ({ ...prev, mkb: '' }))

      setTimeout(() => {
        safeMessage("success", "Данные сохранены!", 2.5)
        navigate(`/search/${isEditMode ? patientId : res.data.id}`, {
          state: {
            results: res.data,
            searchQuery: `${res.data.lastName} ${res.data.firstName} ${res.data.patr}`
          }
        });
      }, 1000)

    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <span className={styles.pageTitle}>
        {isEditMode
          ? 'Редактировать пациента'
          : 'Регистрация пациента'
        }
      </span>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={onSubmit}>
        <div className={styles.info}>
          <div className={styles.bg}>
            <div className={styles.form}>
              <PersonalInfoFields
                formValues={formValues}
                handleChange={handleChange}
                safeMessage={safeMessage}
              />
              <MedHistoryFields
                formValues={formValues}
                handleChange={handleChange}
              />
              <Buttons
                isEditMode={isEditMode}
              />
            </div>
          </div>
        </div >
      </form>
    </div >
  )
}

export default RegisterPatient
