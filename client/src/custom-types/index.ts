export * from "./patient";

export type ConnectionStatus =
  | "online"
  | "offline"
  | "server-error"
  | "timeout"
  | "reconnecting";
