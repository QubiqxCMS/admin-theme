/* Croatian locals for flatpickr */
import { CustomLocale } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/locale";
import { FlatpickrFn } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/instance";

const fp: FlatpickrFn =
  typeof window !== "undefined" && window.flatpickr !== undefined
    ? window.flatpickr
    : {
        l10ns: {},
      } as FlatpickrFn;

export const Croatian: CustomLocale = {
  firstDayOfWeek: 1,

  weekdays: {
    shorthand: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"],
    longhand: [
      "Nedjelja",
      "Ponedjeljak",
      "Utorak",
      "Srijeda",
      "Četvrtak",
      "Petak",
      "Subota",
    ],
  },

  months: {
    shorthand: [
      "Sij",
      "Velj",
      "Ožu",
      "Tra",
      "Svi",
      "Lip",
      "Srp",
      "Kol",
      "Ruj",
      "Lis",
      "Stu",
      "Pro",
    ],
    longhand: [
      "Siječanj",
      "Veljača",
      "Ožujak",
      "Travanj",
      "Svibanj",
      "Lipanj",
      "Srpanj",
      "Kolovoz",
      "Rujan",
      "Listopad",
      "Studeni",
      "Prosinac",
    ],
  },
};

fp.l10ns.hr = Croatian;

export default fp.l10ns;
