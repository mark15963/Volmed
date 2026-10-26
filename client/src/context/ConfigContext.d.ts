import { Dispatch, SetStateAction, ReactNode } from "react";

export type ThemeVariant = "default" | "light" | "dark";

export interface ConfigContextValue {
  title: string;
  setTitle: (title: string) => Promise<boolean>;
  color: { header: string; content: string; container: string };
  setColor: (color: {
    header: string;
    content: string;
    container: string;
  }) => Promise<boolean>;
  logo: string | null;
  setLogo: (url: string) => void;
  theme: { table: ThemeVariant; app: ThemeVariant };
  setTheme: (theme: {
    table: ThemeVariant;
    app: ThemeVariant;
  }) => Promise<boolean>;
  isLoading: boolean;
  defaults: typeof import("../constants").CONFIG_DEFAULTS;
}

export function useConfig(): ConfigContextValue;

export const ConfigProvider: (props: { children: ReactNode }) => JSX.Element;
export default ConfigProvider;
