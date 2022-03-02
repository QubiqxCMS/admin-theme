/* Ukrainian locals for flatpickr */
import { CustomLocale } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/locale";
import { FlatpickrFn } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/instance";

const fp: FlatpickrFn =
  typeof window !== "undefined" && window.flatpickr !== undefined
    ? window.flatpickr
    : {
        l10ns: {},
      } as FlatpickrFn;

export const Ukrainian: CustomLocale = {
  firstDayOfWeek: 1,

  weekdays: {
    shorthand: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    longhand: [
      "Неділя",
      "Понеділок",
      "Вівторок",
      "Середа",
      "Четвер",
      "П'ятниця",
      "Субота",
    ],
  },

  months: {
    shorthand: [
      "Січ",
      "Лют",
      "Бер",
      "Кві",
      "Тра",
      "Чер",
      "Лип",
      "Сер",
      "Вер",
      "Жов",
      "Лис",
      "Гру",
    ],
    longhand: [
      "Січень",
      "Лютий",
      "Березень",
      "Квітень",
      "Травень",
      "Червень",
      "Липень",
      "Серпень",
      "Вересень",
      "Жовтень",
      "Листопад",
      "Грудень",
    ],
  },
};

fp.l10ns.uk = Ukrainian;

export default fp.l10ns;
