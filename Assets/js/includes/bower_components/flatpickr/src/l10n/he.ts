/* Hebrew locals for flatpickr */
import { CustomLocale } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/locale";
import { FlatpickrFn } from "Admin/Assets/js/includes/bower_components/flatpickr/src/types/instance";

const fp: FlatpickrFn =
  typeof window !== "undefined" && window.flatpickr !== undefined
    ? window.flatpickr
    : {
        l10ns: {},
      } as FlatpickrFn;

export const Hebrew: CustomLocale = {
  weekdays: {
    shorthand: ["א", "ב", "ג", "ד", "ה", "ו", "ז"],
    longhand: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
  },

  months: {
    shorthand: [
      "ינו׳",
      "פבר׳",
      "מרץ",
      "אפר׳",
      "מאי",
      "יוני",
      "יולי",
      "אוג׳",
      "ספט׳",
      "אוק׳",
      "נוב׳",
      "דצמ׳",
    ],
    longhand: [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ],
  },
};

fp.l10ns.he = Hebrew;

export default fp.l10ns;
