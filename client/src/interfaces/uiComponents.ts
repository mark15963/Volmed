import { ConnectionStatus } from "@custom-types/index";
import { ReactNode } from "react";

export interface TooltipHoverProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
  delay?: number;
}

export interface OfflineFallbackProps {
  status?: ConnectionStatus;
}

//#region === Loaders ===
/**
 * Props for the {@link SpinLoader} component
 */
export interface SpinLoaderProps {
  color?: string;
  size?: number;
  className?: string;
}

/**
 * Props for the {@link SkeletonLoader} component
 */
export interface SkeletonLoaderProps {
  /**
   * How many rows to show on preload (optional)
   */
  lines?: number | string;
}
//#endregion
//#region === Table ===
/**
 * Props for the {@link ListOfPatients} component.
 */
export interface ListOfPatientsProps {
  /**
   * Filter mode for displaying patients.
   * @default "all"
   */
  option?: "all" | "active" | "non-active";

  /**
   * Visual theme of the patient table.
   * @default "default"
   */
  theme?: "default" | "light" | "dark";

  /**
   * Behavior when clicking on a patient row.
   * - `"navigate"` — navigates to the patient's detailed page
   * - `"popup"` — opens a modal popup with patient details (Tab1 content)
   * @default "navigate"
   */
  onRowClick?: "navigate" | "popup";
}
//#endregion
//#region === Icons ===
export interface SexIconProps {
  sex: string;
  className?: string;
  size?: number;
}
//#endregion
