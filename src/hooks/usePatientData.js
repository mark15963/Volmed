import { useEffect, useState } from "react";
import api from "../services/api";

export function usePatientData(id, state) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPatientData = async () => {
      try {
        if (!isMounted) return;

        let patientData =
          state?.patientData ||
          (state?.results?.length > 0 && state.results[0]) ||
          (id && (await api.getPatient(id).then((res) => res.data)));

        if (!patientData) throw new Error("Данные пациента не найдены");

        if (!isMounted) return;

        setData(patientData);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPatientData();

    return () => {
      isMounted = false;
    };
  }, [id, state]);

  // Set document title
  useEffect(() => {
    const title = loading
      ? "Загрузка данных пациента..."
      : error
      ? "Ошибка загрузки"
      : !data
      ? "Пациент не найден"
      : `Карта пациента: ${data.lastName} ${data.firstName}${
          data.patr ? ` ${data.patr}` : ""
        }`;

    document.title = title;

    return () => {
      document.title = "ГБУ «Городская больница Волновахского района»";
    };
  }, [loading, error, data]);

  return { data, loading, error };
}
