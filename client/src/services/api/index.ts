import { endpoints } from "./endpoints";
import { requestWrapper } from "./requestWrapper";


/**
 * API Service
 * ------------
 * Centralized axios wrapper for all backend requests.
 * Provides automatic JSON handling, response parsing, and debugging logs.
 *
 * The main API object
 * -------------------
 * Each property here is a preconfigured endpoint call.
 * These can be imported anywhere in the frontend codebase.
 *
 * Parameters to use
 * -----------------
 * - ok
 * - data
 * - status
 * - message
 *
 * @example
 *    const result = await api.getPatients();
 *    if (result.ok) setPatients(result.data);
 *
 * @example
 *    import api from "@/services/api";
 *    const { ok, data } = await api.getPatients();
 *    if (ok) console.log(data);
 */
const apiCore = { // public HTTP verb helpers

  // example: api.get(/patients)
  get: (url: string, config = {}) => requestWrapper("get", url, null, config),
  post: (url: string, data?: any, config = {}) => requestWrapper("post", url, data, config),
  put: (url: string, data?: any, config = {}) => requestWrapper("put", url, data, config),
  delete: (url: string, config = {}) => requestWrapper("delete", url, null, config),
};

const api = {
  ...apiCore,
  ...endpoints // domain-specific methods using apiCore
}

export default api