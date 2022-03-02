/* Malaysian locals for flatpickr */
import { CustomLocale } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/locale";
import { FlatpickrFn } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/instance";

const fp: FlatpickrFn =
  typeof window !== "undefined" && window.flatpickr !== undefined
    ? window.flatpickr
    : {
        l10ns: {},
      } as FlatpickrFn;

export const Malaysian: CustomLocale = {
  weekdays: {
    shorthand: ["Min", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"],
    longhand: [
      "Minggu",
      "Isnin",
      "Selasa",
      "Rabu",
      "Khamis",
      "Jumaat",
      "Sabtu",
    ],
  },

  months: {
    shorthand: [
      "Jan",
      "Feb",
      "Mac",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Ogo",
      "Sep",
      "Okt",
      "Nov",
      "Dis",
    ],
    longhand: [
      "Januari",
      "Februari",
      "Mac",
      "April",
      "Mei",
      "Jun",
      "Julai",
      "Ogos",
      "September",
      "Oktober",
      "November",
      "Disember",
    ],
  },

  firstDayOfWeek: 1,

  ordinal: () => {
    return "";
  },
};

export default fp.l10ns;
