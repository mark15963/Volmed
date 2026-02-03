//#region =====IMPORTS=====
// React, Router, Axios
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";

const { default: dayjs } = await import("../../utils/dayjs.config");

// Components
import { PersonalInfoFields } from "./Components/PersonalInfoFields";
import { MedHistoryFields } from "./Components/MedHistoryFields";
import { Buttons } from "./Components/Buttons";

// Hooks & Context
import { useAuth } from "../../context";
import { useSafeMessage } from "../../hooks/useSafeMessage";

// Constants
import {
  PATIENT_FORM_INITIAL_VALUES,
  PATIENT_STRING_FIELDS_TO_EMPTY,
  type PatientFormValues,
} from "../../constants";

// UI & Services
import styles from "./register.module.scss";
import api from "../../services/api/index";
import {
  ensureString,
  formatDateForServer,
  formatPhone,
  PatientForSearch,
} from "../../utils";
//#endregion

interface RegisterPatientsProps {
  initialValues?: Partial<PatientFormValues> | null;
  isEditMode?: boolean;
  patientId?: string | null;
}

export const RegisterPatient = ({
  initialValues = null,
  isEditMode = false,
  patientId = null,
}: RegisterPatientsProps) => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  const safeMessage = useSafeMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formValues, setFormValues] = useState<PatientFormValues>(() => {
    if (!initialValues) {
      return PATIENT_FORM_INITIAL_VALUES;
    }

    return {
      ...PATIENT_FORM_INITIAL_VALUES,
      ...initialValues,
      birthDate: initialValues.birthDate
        ? dayjs(initialValues.birthDate)
        : null,
    };
  });

  // Doctor's name
  const doctor =
    `${authState.user?.lastName ?? ""} ${authState.user?.firstName ?? ""} ${authState.user?.patr ?? ""}`.trim();

  const handleChange = (name: keyof PatientFormValues, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      safeMessage("loading", "Данные сохраняются...", 1);
      setError("");

      const formattedValues = {
        ...formValues,
        birthDate: formatDateForServer(formValues.birthDate),
        phone: formatPhone(formValues.phone),
        doctor: doctor || "",

        ...Object.fromEntries(
          PATIENT_STRING_FIELDS_TO_EMPTY.map((field) => [
            field,
            ensureString(formValues[field] ?? ""),
          ]),
        ),
      } as PatientFormValues;

      let res;
      if (isEditMode && patientId) {
        res = await api.updatePatient(patientId, formattedValues);
        if (!res.ok) throw new Error(res.message ?? "Update failed");
      } else {
        res = await api.createPatient(formattedValues);
        if (!res.ok) throw new Error(res.message ?? "Create failed");
      }

      setFormValues((prev) => ({ ...prev, mkb: "" }));

      setTimeout(() => {
        safeMessage("success", "Данные сохранены!", 2.5);
        const newOrUpdateId = isEditMode ? patientId : (res as any)?.data?.id;
        if (!newOrUpdateId) throw new Error("No ID returned");

        const patient = res?.data as PatientForSearch | undefined;

        navigate(`/search/${newOrUpdateId}`, {
          state: {
            results: patient,
            searchQuery: `${patient?.lastName ?? ""} ${
              patient?.firstName ?? ""
            } ${patient?.patr ?? ""}`,
          },
        });
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : ((err as any)?.response?.data?.error ?? "Неизвестная ошибка");
      setError(message);
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <span className={styles.pageTitle}>
        {isEditMode ? "Редактировать пациента" : "Регистрация пациента"}
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
              <Buttons isEditMode={isEditMode} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterPatient;
