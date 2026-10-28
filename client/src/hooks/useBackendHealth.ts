import { useEffect, useState } from "react";

type BackendHealthStatus = "checking" | "healthy" | "unavailable";
export type ConnectionFailureReason = "network" | "server" | "database";

const HEALTH_CHECK_INTERVAL = 3000;
const RECOVERY_RETRY_INTERVAL = 1000;
const HEALTH_CHECK_TIMEOUT = 1500;
const OUTAGE_CONFIRMATION_DELAY = 10000;

export const useBackendHealth = () => {
  const [status, setStatus] = useState<BackendHealthStatus>("checking");
  const [failureReason, setFailureReason] =
    useState<ConnectionFailureReason | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [outageStartedAt, setOutageStartedAt] = useState<number | null>(null);
  const [isBrowserOnline, setIsBrowserOnline] = useState(
    () => navigator.onLine,
  );

  useEffect(() => {
    let disposed = false;
    let requestInProgress = false;
    let outageTimer: ReturnType<typeof setTimeout> | null = null;
    let requestController: AbortController | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let failures = 0;
    let outageStartTime: number | null = null;
    let browserOfflineHandled = false;

    const clearOutageTimer = () => {
      if (outageTimer !== null) {
        clearTimeout(outageTimer);
        outageTimer = null;
      }
    };

    const beginOutage = () => {
      if (outageStartTime !== null) return;

      outageStartTime = Date.now();
      setOutageStartedAt(outageStartTime);
    };

    const startPolling = (delay: number) => {
      if (interval !== null) clearInterval(interval);

      interval = setInterval(() => {
        void checkHealth();
      }, delay);
    };

    const handleOffline = () => {
      if (disposed) return;

      setIsBrowserOnline(false);
      setFailureReason("network");
      beginOutage();

      browserOfflineHandled = true;

      setStatus("unavailable");
      clearOutageTimer();
      startPolling(RECOVERY_RETRY_INTERVAL);
    };

    const handleOnline = () => {
      browserOfflineHandled = false;
      setIsBrowserOnline(true);
      void checkHealth();
    };

    const checkHealth = async () => {
      if (disposed || requestInProgress) return;

      if (!navigator.onLine) {
        setIsBrowserOnline(false);
        setFailureReason("network");
        beginOutage();

        failures += 1;
        setFailedAttempts(failures);

        setStatus("unavailable");
        clearOutageTimer();
        startPolling(RECOVERY_RETRY_INTERVAL);
        return;
      }

      requestInProgress = true;

      const controller = new AbortController();
      requestController = controller;

      const timeoutTimer = setTimeout(() => {
        controller.abort();
      }, HEALTH_CHECK_TIMEOUT);

      try {
        const response = await fetch("/api/health", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        let result: {
          status?: string;
          database?: string;
        } | null = null;

        try {
          result = await response.json();
        } catch {}

        if (!response.ok) {
          if (response.status === 503 && result?.database === "disconnected") {
            throw Object.assign(new Error("Database unavailable"), {
              reason: "database" as const,
            });
          }
          throw Object.assign(new Error(`HTTP ${response.status}`), {
            reason: "server" as const,
          });
        }

        if (result?.status !== "healthy" || result?.database !== "connected") {
          throw Object.assign(new Error("Backend or database unhealthy"), {
            reason:
              result?.database === "disconnected"
                ? ("database" as const)
                : ("server" as const),
          });
        }

        if (disposed) return;

        failures = 0;
        outageStartTime = null;
        browserOfflineHandled = false;

        clearOutageTimer();

        setIsBrowserOnline(true);
        setFailedAttempts(0);
        setFailureReason(null);
        setOutageStartedAt(null);
        setStatus("healthy");

        startPolling(HEALTH_CHECK_INTERVAL);
      } catch (error) {
        if (disposed) return;

        const reason: ConnectionFailureReason =
          typeof error === "object" &&
          error !== null &&
          "reason" in error &&
          (error.reason === "database" || error.reason === "server")
            ? error.reason
            : navigator.onLine
              ? "server"
              : "network";

        failures += 1;
        setFailedAttempts(failures);
        setFailureReason(reason);
        beginOutage();

        if (outageTimer === null) {
          outageTimer = setTimeout(() => {
            outageTimer = null;

            if (!disposed) {
              setStatus("unavailable");
              startPolling(RECOVERY_RETRY_INTERVAL);
            }
          }, OUTAGE_CONFIRMATION_DELAY);
        }
      } finally {
        clearTimeout(timeoutTimer);

        if (requestController === controller) requestController = null;

        requestInProgress = false;
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    void checkHealth();
    startPolling(HEALTH_CHECK_INTERVAL);

    return () => {
      disposed = true;
      requestController?.abort();
      clearOutageTimer();

      if (interval !== null) clearInterval(interval);

      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return {
    isBackendHealthy: status === "healthy",
    isBackendUnavailable: status === "unavailable",
    isCheckingBackend: status === "checking",
    backendHealthStatus: status,
    failureReason,
    failedAttempts,
    outageStartedAt,
    isBrowserOnline,
  };
};
