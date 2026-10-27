//#region =====IMPORTS=====
// React, Router, Axios
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import type { Dayjs } from "dayjs";

import { dayjs } from "../../utils";

// Components
import { PersonalInfoFields } from "./Components/PersonalInfoFields";
import { MedHistoryFields } from "./Components/MedHistoryFields";
import { Buttons } from "./Components/Buttons";

// Hooks & Context
import { useAuth, useConfig } from "../../context";
import { useSafeMessage } from "../../hooks/useSafeMessage";

// Constants
import {
  PATIENT_FORM_INITIAL_VALUES,
  type PatientApiPayload,
  type PatientFormValues,
} from "../../constants";

// UI & Services
import styles from "./register.module.scss";
import api from "../../services/api/index";
import {
  ensureString,
  formatDateForServer,
  formatPhoneForServer,
  type PatientForSearch,
} from "../../utils";
//#endregion

interface RegisterPatientsProps {
  initialValues?:
    | (Partial<Omit<PatientFormValues, "birthDate">> & {
        birthDate?: string | Dayjs | null;
      })
    | null;
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
  const { color } = useConfig();

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
  const doctor = [
    authState.user?.lastName,
    authState.user?.firstName,
    authState.user?.patr,
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = <K extends keyof PatientFormValues>(
    name: K,
    value: PatientFormValues[K],
  ) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const required: { key: keyof PatientFormValues; label: string }[] = [
      { key: "lastName", label: "Фамилия" },
      { key: "firstName", label: "Имя" },
      { key: "phone", label: "Номер телефона" },
    ];

    const missing = required.find(({ key }) => {
      const v = formValues[key];
      return v === null || v === undefined || v === "";
    });

    if (missing) {
      safeMessage("warning", `Заполните: ${missing.label}`);
      return;
    }

    const formattedPhone = formatPhoneForServer(formValues.phone);
    if (!formattedPhone) {
      safeMessage("warning", "Введите корректный номер телефона");
      return;
    }

    try {
      setIsLoading(true);
      safeMessage("loading", "Данные сохраняются...");
      setError("");

      const formattedValues: PatientApiPayload = {
        lastName: formValues.lastName,
        firstName: formValues.firstName,
        patr: ensureString(formValues.patr),
        type: formValues.type,
        sex: formValues.sex,
        birthDate: formatDateForServer(formValues.birthDate),
        sender: ensureString(formValues.sender),
        sendingTime: ensureString(formValues.sendingTime),
        insurance: ensureString(formValues.insurance),
        phone: formattedPhone,
        address: ensureString(formValues.address),
        email: ensureString(formValues.email),
        freq: formValues.freq,
        firstDiag: ensureString(formValues.firstDiag),
        complaint: ensureString(formValues.complaint),
        anam: ensureString(formValues.anam),
        life: ensureString(formValues.life),
        status: ensureString(formValues.status),
        mkb: ensureString(formValues.mkb),
        diag: ensureString(formValues.diag),
        sop_zab: ensureString(formValues.sop_zab),
        rec: ensureString(formValues.rec),
        state: formValues.state,
        allergies: ensureString(formValues.allergies),
        doctor,
      };

      const res =
        isEditMode && patientId
          ? await api.updatePatient(patientId, formattedValues)
          : await api.createPatient(formattedValues);

      if (!res.ok) throw new Error(res.message ?? "Create failed");

      const patient = res.data as PatientForSearch | undefined;
      const newOrUpdateId = isEditMode ? patientId : patient?.id;
      if (!newOrUpdateId) throw new Error("Сервер не вернул ID пациента");

      const searchQuery = [patient?.lastName, patient?.firstName, patient?.patr]
        .filter(Boolean)
        .join(" ");

      safeMessage("success", "Данные сохранены!", 2.5);
      navigate(`/search/${newOrUpdateId}`, {
        state: { results: patient, searchQuery },
        replace: true, // Clicking back wont return to the registration
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : ((err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ?? "Неизвестная ошибка");
      setError(message);
      console.error("Registration error:", err);
      safeMessage("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <span className={styles.pageTitle}>
        {isEditMode ? "Редактировать пациента" : "Регистрация пациента"}
      </span>

      {/* {error && <div className={styles.error}>{error}</div>} */}

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
              <Buttons isEditMode={isEditMode} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterPatient;
