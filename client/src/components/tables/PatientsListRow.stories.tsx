import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent } from "storybook/test";
import { MemoryRouter } from "react-router";

import { PatientsListRow, type PatientRowProps } from "./PatientsListRow";

import styles from "./PatientsListRow.module.scss";

const makePatient = (overrides: Partial<PatientRowProps["patient"]> = {}) =>
  ({
    id: 1428,
    lastName: "Иванов",
    firstName: "Иван",
    patr: "Иванович",
    birthDate: "1997-04-15",
    sex: "M",
    createdAt: "09.01.2025",
    room: "301",
    doctor: "Винер М.И.",
    diag: "I21.0",
    state: "Удовлетворительно",
    allergy: "-",
    ...overrides,
  }) as PatientRowProps["patient"];

const meta = {
  title: "Components/Table/Patient Row",
  component: PatientsListRow,
  tags: ["autodocs"],
  // args: {}, // Default values for all stories
  argTypes: {
    // ← Here we customize controls & documentation
    onRowClick: {
      control: "select",
      options: ["navigate", "popup"],
    },
  },
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ width: "fit-content" }}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.rows}>
                <th>#</th>
                <th>ФИО</th>
                <th>Возраст</th>
                <th>Пол</th>
                <th>Дата поступления</th>
                <th>Отделение/Палата</th>
                <th>Лечащий врач</th>
                <th>Основной Диагноз (МКБ)</th>
                <th>Общее состояние</th>
                {/*  
                · зелёный - Удовлетворительно 
                · жёлтый - Средней степени тяжести 
                · оранжевый - Тяжёлое
                · красный - Крайне тяжёлое 
                · #86e5ffbf - Выписан / Переведён / Отказ от госпитализации
              */}
                <th>Риски/Аллергии</th>
              </tr>
            </thead>
            <tbody>
              <Story />
            </tbody>
          </table>
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof PatientsListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {
  name: "Одна строка",
  args: {
    patient: makePatient(),
    onRowClick: "navigate",
  },
};

export const ManyRows: Story = {
  name: "Несколько строк (пример таблицы)",
  args: {
    patient: makePatient(),
    onRowClick: "navigate",
  },
  render: () => (
    <>
      <PatientsListRow patient={makePatient()} onRowClick="navigate" />

      <PatientsListRow
        patient={makePatient({
          id: 1531,
          lastName: "Петрова",
          firstName: "Анна",
          patr: "Сергеевна",
          birthDate: "1998-09-04",
          sex: "Ж",
          created_at: "10.01.2026",
          room: "401",
          doctor: "Оборовский В.Д.",
          diag: "I21.0",
          state: "Средней степени тяжести",
          allergy: "-",
        })}
        onRowClick="navigate"
      />

      <PatientsListRow
        patient={makePatient({
          id: 1894,
          lastName: "Смирнов",
          firstName: "Дмитрий",
          patr: "Александрович",
          birthDate: "1965-09-14",
          sex: "M",
          created_at: "08.01.2026",
          room: "311",
          doctor: "Оборовский В.Д.",
          diag: "I21.0",
          state: "Крайне тяжёлое",
          allergy: "Пенициллин",
        })}
        onRowClick="navigate"
      />

      <PatientsListRow
        patient={makePatient({
          id: 2047,
          lastName: "Козлова",
          firstName: "Мария",
          patr: "Викторовна",
          birthDate: "1977-04-14",
          sex: "Ж",
          created_at: "12.01.2026",
          room: "304",
          doctor: "Винер М.И.",
          diag: "I21.0",
          state: "Выписан",
          allergy: "-",
        })}
        onRowClick="navigate"
      />
    </>
  ),
};

export const InteractiveExample: Story = {
  name: "Интерактив (клик)",
  args: {
    patient: makePatient({ lastName: "Смирнов", firstName: "Дмитрий" }),
    onRowClick: "navigate",
  },
  // Function that is executed after the story is rendered.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole("button", { name: /Смирнов/ });
    await userEvent.click(row);
  },
};
