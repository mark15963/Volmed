import { fetchUserStatus } from "../services/fetchUserStatus";
import { enableDebug } from "./debug";

export async function initDebugBypass(): Promise<void> {
  if (import.meta.env.VITE_DEBUG === "true") return;

  try {
    const res = await fetchUserStatus();

    if (res.ok && res.isAdmin) {
      enableDebug();
      console.log("Debug enabled for admin");
    }
  } catch (error) {
    console.error("[DEBUG] Failed to initialize debug mode:", error);
  }
}
