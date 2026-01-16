import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent } from "@storybook/test";

import { PatientsListRow, type PatientRowProps } from "./PatientsListRow";

import styles from "./Row.module.scss";

const meta: Meta<typeof PatientsListRow> = {
  title: "Components/Table/Patient Row",
  component: PatientsListRow,
  tags: ["autodocs"],
  // args: {}, // Default values for all stories
  argTypes: {
    // ← Here we customize controls & documentation
    id: {
      name: "ID",
      control: "number",
      description: "Генерируется автоматически",
    },
    lastName: {
      name: "Фамилия",
      control: "text",
    },
    firstName: {
      name: "Имя",
      control: "text",
    },
    patr: {
      name: "Отчество",
      control: "text",
    },
    age: {
      name: "Age",
      control: "number",
    },
    sex: {
      name: "Sex",
      control: "select",
      options: ["М", "Ж"],
    },
    createdAt: {
      name: "Дата поступления",
      control: "date",
    },
    state: {
      name: "Общее состояние",
      control: "select",
      options: [
        "Удовлетворительное",
        "Cредней степени тяжести",
        "Тяжёлое",
        "Крайне тяжёлое",
        "Выписан",
      ],
      description: "Влияет на цвет строки",
    },
    room: {
      name: "Room",
      control: "text",
      description: "Отделение/Палата",
    },
    doctor: {
      name: "Doctor",
      control: "select",
      options: ["Винер М.И.", "Оборовский В.Д."],
      description: "ФИО лечащего врача",
    },
    allergy: {
      name: "Allergies",
      control: "text",
      description: "Риски/Аллергии",
    },
    onClick: { action: "row clicked" },
  },
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
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
                · зелёный - Удовлетворительное 
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
    ),
  ],
} satisfies Meta<typeof PatientsListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {
  name: "Одна строка",
  args: {
    id: 1428,
    lastName: "Иванов",
    firstName: "Иван",
    patr: "Иванович",
    age: "39",
    sex: "M",
    createdAt: "09.01.2025",
    room: "301",
    doctor: "Винер М.И.",
    mkb: "I21.0",
    state: "Удовлетворительное",
    allergy: "-",
  },
};

export const ManyRows: Story = {
  name: "Несколько строк (пример таблицы)",
  render: () => (
    <>
      <PatientsListRow
        id={1428}
        lastName="Иванов"
        firstName="Иван"
        patr="Иванович"
        age="39"
        sex="M"
        createdAt="09.01.2025"
        room="301"
        doctor="Винер М.И."
        mkb="I21.0"
        state="Удовлетворительное"
        allergy="-"
      />

      <PatientsListRow
        id={1531}
        lastName="Петрова"
        firstName="Анна"
        patr="Сергеевна"
        age="34"
        sex="Ж"
        createdAt="10.01.2026"
        room="401"
        doctor="Оборовский В.Д."
        mkb="I21.0"
        state="Средней степени тяжести"
        allergy="-"
      />

      <PatientsListRow
        id={1894}
        lastName="Смирнов"
        firstName="Дмитрий"
        patr="Александрович"
        age="58"
        sex="M"
        createdAt="08.01.2026"
        room="311"
        doctor="Винер М.И."
        mkb="I21.0"
        state="Тяжёлое"
        allergy="-"
      />

      <PatientsListRow
        id={1894}
        lastName="Смирнов"
        firstName="Дмитрий"
        patr="Александрович"
        age="58"
        sex="M"
        createdAt="08.01.2026"
        room="311"
        doctor="Оборовский В.Д."
        mkb="I21.0"
        state="Крайне тяжёлое"
        allergy="Пенициллин"
      />

      <PatientsListRow
        id={2047}
        lastName="Козлова"
        firstName="Мария"
        patr="Викторовна"
        age="25"
        sex="Ж"
        createdAt="12.01.2026"
        room="304"
        doctor="Винер М.И."
        mkb="I21.0"
        state="Выписан"
        allergy="-"
      />
    </>
  ),
};

export const InteractiveExample: Story = {
  name: "Интерактив (клик)",
  args: {
    ...Row.args,
    lastName: "Смирнов",
    firstName: "Дмитрий",
    state: "Удовлетворительное",
  },
  // Function that is executed after the story is rendered.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole("button", { name: /Смирнов/ });
    await userEvent.click(row);
  },
};
