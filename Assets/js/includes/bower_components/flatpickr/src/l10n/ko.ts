/* Republic of Korea locals for flatpickr */
import { CustomLocale } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/locale";
import { FlatpickrFn } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/instance";

const fp: FlatpickrFn =
  typeof window !== "undefined" && window.flatpickr !== undefined
    ? window.flatpickr
    : {
        l10ns: {},
      } as FlatpickrFn;

export const Korean: CustomLocale = {
  weekdays: {
    shorthand: ["일", "월", "화", "수", "목", "금", "토"],
    longhand: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
  },

  months: {
    shorthand: [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    longhand: [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
  },

  ordinal: () => {
    return "일";
  },
};

fp.l10ns.ko = Korean;

export default fp.l10ns;
