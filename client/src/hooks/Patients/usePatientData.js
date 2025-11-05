/* 
fetchPatients.js → for API utilities
usePatientData.js → for UI hooks (built on top of those API utilities)

That’s the same pattern used in scalable React apps:
Hooks = UI state + lifecycle
API helpers = pure network logic 
 */

import { useEffect, useState } from "react";
import { fetchPatientById } from "../../api";
import api from "../../services/api";
import debug from "../../utils/debug";
import { useApi } from "../useApi";

export function usePatientData(id, state) {
  const {
    data: fetchedPatient,
    loading,
    error,
  } = useApi(
    () =>
      id ? fetchPatientById(id) : Promise.resolve({ ok: false, data: null }),
    [id]
  );

  const patientData =
    state?.patientData ||
    (state?.results?.length > 0 && state.results[0]) ||
    fetchedPatient ||
    null;

  // Set document title
  useEffect(() => {
    const title = loading
      ? "Загрузка данных пациента..."
      : error
      ? "Ошибка загрузки"
      : !patientData
      ? "Пациент не найден"
      : `Карта пациента: ${patientData.lastName} ${patientData.firstName}${
          patientData.patr ? ` ${patientData.patr}` : ""
        }`;

    document.title = title;

    return () => {
      document.title = "ГБУ «Городская больница Волновахского района»";
    };
  }, [loading, error, patientData]);

  // Debug output
  useEffect(() => {
    if (patientData) {
      debug.table(
        [patientData],
        ["id", "lastName", "firstName", "diag"],
        "Patient loaded:"
      );
    } else if (error) {
      debug.error("Failed to load patient:", error);
    }
  }, [patientData, error]);

  return {
    data: patientData,
    loading,
    error,
  };
}
