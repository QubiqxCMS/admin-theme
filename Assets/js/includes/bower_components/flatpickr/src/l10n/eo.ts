/* Esperanto locals for flatpickr */
import { CustomLocale } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/locale";
import { FlatpickrFn } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/instance";

const fp: FlatpickrFn =
  typeof window !== "undefined" && window.flatpickr !== undefined
    ? window.flatpickr
    : {
        l10ns: {},
      } as FlatpickrFn;

export const Esperanto: CustomLocale = {
  firstDayOfWeek: 1,

  rangeSeparator: " ĝis ",
  weekAbbreviation: "Sem",
  scrollTitle: "Rulumu por pligrandigi la valoron",
  toggleTitle: "Klaku por ŝalti",

  weekdays: {
    shorthand: ["Dim", "Lun", "Mar", "Mer", "Ĵaŭ", "Ven", "Sab"],
    longhand: [
      "dimanĉo",
      "lundo",
      "mardo",
      "merkredo",
      "ĵaŭdo",
      "vendredo",
      "sabato",
    ],
  },

  months: {
    shorthand: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Maj",
      "Jun",
      "Jul",
      "Aŭg",
      "Sep",
      "Okt",
      "Nov",
      "Dec",
    ],
    longhand: [
      "januaro",
      "februaro",
      "marto",
      "aprilo",
      "majo",
      "junio",
      "julio",
      "aŭgusto",
      "septembro",
      "oktobro",
      "novembro",
      "decembro",
    ],
  },

  ordinal: () => {
    return "-a";
  },
};

fp.l10ns.eo = Esperanto;
export default fp.l10ns;
