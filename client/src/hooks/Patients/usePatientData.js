import { useEffect, useState } from "react";
import api from "../../services/api";
import debug from "../../utils/debug";
import { useApi } from "../useApi";

/**
 * Hook for loading patient data by ID.
 *
 * Fetches patient info via the API and sets the document title
 * based on loading or error state. Can use preloaded data from router state.
 *
 * @param {number} id - Patient ID. If missing, no request is made.
 * @param {Object} [locationState] - Optional router state, e.g. from `useLocation()`.
 * @param {Object} [locationState.patientData] - Preloaded patient data.
 * @param {Array<Object>} [locationState.results] - Search results to use as a fallback.
 * @returns {{ data: Object|null, loading: boolean, error: any }}
 */
export function usePatientData(id, locationState) {
  const {
    data: fetchedPatient,
    loading,
    error,
  } = useApi(
    () =>
      id
        ? api.getPatient(id)
        : Promise.resolve({
            ok: false,
            data: null,
          }),
    [id]
  );

  const patientData =
    locationState?.patientData ||
    (locationState?.results?.length > 0 && locationState.results[0]) ||
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
