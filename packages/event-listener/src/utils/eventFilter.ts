// Event Filter List
let filterList: string[];
const SUBSTRATE_EVENT_SECTIONS = process.env.SUBSTRATE_EVENT_SECTIONS;
if (!SUBSTRATE_EVENT_SECTIONS || SUBSTRATE_EVENT_SECTIONS == "all") {
  filterList = ["all"];
} else {
  filterList = SUBSTRATE_EVENT_SECTIONS.split(",").map(item => item.trim());
}

export const isFiltered = (eventStr: string): boolean => {
  // filter event section
  if (!(filterList.includes(eventStr) || filterList.includes("all"))) {
    return false;
  } else {
    return true;
  }
};
