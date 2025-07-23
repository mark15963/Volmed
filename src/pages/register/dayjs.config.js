import dayjs from "dayjs";
import "dayjs/locale/ru";
import updateLocale from "dayjs/plugin/updateLocale";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(updateLocale);
dayjs.extend(weekday);
dayjs.extend(localeData);

dayjs.locale("ru");

dayjs.updateLocale("ru", {
  weekStart: 1,
  weekdaysMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
});

export const datePickerLocale = {
  ...dayjs.localeData("ru"),
  firstDayOfWeek: 1,
};

export default dayjs;
