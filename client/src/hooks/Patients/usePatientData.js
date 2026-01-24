import { useEffect, useMemo, useState } from "react";
import api from "../../services/api/index";
import debug from "../../utils/debug";
import { useApi } from "../useApi";

/**
 * usePatientData
 * ---------------
 * React hook that loads patient data by ID.
 *
 * 💡 The hook automatically decides whether to:
 * - Use **cached data** passed via React Router (`navigate(..., { state })`)
 * - Or **fetch fresh data** from the API if needed
 *
 * ---
 * 🔍 Behavior Summary:
 *
 * 1️⃣ **When navigating from the ListOfPatients**
 * ```js
 * navigate(`/search/${patient.id}`, {
 *   state: { patient }
 * })
 * ```
 * → ✅ Uses preloaded data
 * → ❌ No API call
 * → Debug log: `"Using data from ListOfPatients (no API call)"`
 *
 *
 * 2️⃣ **When navigating from the SearchBar**
 * ```js
 * navigate(`/search/${id}`, {
 *   state: {
 *     results: [data]
 *   }
 * })
 * ```
 * → ✅ Small preloaded object
 * → 🔄 **API call still happens (to fetch full data)**
 * → Debug log: `"Fetching data from API (SearchBar or direct link)"`
 *
 *
 * 3️⃣ **When opening directly via URL**
 * ```js
 * /search/123
 * ```
 * → ❌ No preloaded data
 * → 🔄 **Fetches from API**
 * → Debug log: `"Fetching data from API (SearchBar or direct link)"`
 *
 * ---
 * @example
 * const { data, loading, error } = usePatientData(id, location.state);
 *
 * @param {number} id - Patient ID. If missing, no API request is made.
 * @param {Object} [preloaded] - Optional router state object (from `useLocation().state`).
 * @param {Object} [preloaded.patient] - Patient data (from ListOfPatients).
 * @param {Array<Object>} [preloaded.results] - Search results (from SearchBar).
 * @returns {{ data: Object|null, loading: boolean, error: any }}
 */
export function usePatientData(id, preloaded) {
  const preloadedPatient =
    preloaded?.patient || //From ListOfPatients
    preloaded?.results?.[0] || // FromSearchBar
    null;

  const isFromList = Boolean(preloaded?.patient);
  const isFromSearch = Boolean(preloaded?.results);

  const shouldFetch = Boolean(id && (isFromSearch || !preloadedPatient));

  // debug.log(
  //   `🧩 usePatientData:
  //   ${
  //     isFromList
  //       ? "Using data from ListOfPatients (no API call)"
  //       : shouldFetch
  //         ? "Fetching data from API (SearchBar or direct link)"
  //         : "Using preloaded data"
  //   }`,
  // );

  const {
    data: fetchedPatient,
    loading: apiLoading,
    error: apiError,
  } = useApi(
    () =>
      shouldFetch
        ? api.getPatient(id)
        : Promise.resolve({
            ok: false,
            data: preloadedPatient,
          }),
    [id],
  );

  const patientData = preloadedPatient || fetchedPatient || null;
  const loading = shouldFetch ? apiLoading : false;
  const error = shouldFetch ? apiError : null;

  // Update document title for UX
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

  return {
    data: patientData,
    loading,
    error,
  };
}
