import fields from "./quote-fields.json";

/** Add a readable order sheet while retaining the original registered fields. */
export function quoteSummary(data: FormData): string {
  const sections: string[] = [];
  let heading = "CONTACT AND BOOK DETAILS";
  let lines: string[] = [];
  const value = (name: string) => data.getAll(name).map(entry =>
    typeof entry === "string" ? entry.trim() : entry.size ? entry.name : ""
  ).filter(Boolean).join(", ");
  const add = (label: string, name: string) => {
    const answer = value(name);
    if (answer) lines.push(`${label.replace(/:$/, "")}: ${answer === "other" ? "Other" : answer}`);
  };
  const flush = () => { if (lines.length) sections.push(`${heading}\n${lines.join("\n")}`); lines = []; };
  const contactNames: Record<string, string> = {
    "q6_name[first]": "first-name", "q6_name[last]": "last-name",
    "q9_phoneNumber[full]": "phone", "q8_email": "email",
  };
  const sectionStarts: Record<string, string> = {
    "73": "BOOK DETAILS", "51": "NAME PERSONALIZATION", "45": "IMPRINTING",
    "57": "RIBBON MARKERS", "98": "OTHER REQUESTS",
  };
  const labels: Record<string, string> = {
    "53": "Name on lower left front cover", "54": "Font", "55": "Font color",
    "96": "End pages", "28": "Spine ribs", "42": "Requested raised special shapes",
    "57": "Ribbon quantity", "58": "Ribbon colors", "80": "How the customer found us",
    "48": "Interior liner tooled lines", "51": "Name personalization",
    "45": "Imprinting other than name", "56": "Yapp (cover overhang)",
    "74": "Width (inches)", "76": "Height (inches)", "77": "Spine thickness (inches)",
  };
  for (const field of fields) {
    if (sectionStarts[field.id]) { flush(); heading = sectionStarts[field.id]; }
    if (field.type === "head") {
      if (["88", "19", "20"].includes(field.id)) { flush(); heading = (field.label || "").toUpperCase(); }
      continue;
    }
    if (field.type === "image") continue;
    if (field.type === "fullname" || field.type === "address") {
      for (const input of field.inputs || []) add(input.label, contactNames[input.name] || input.name);
    } else if (field.name) {
      add(labels[field.id] || field.label, contactNames[field.name] || field.name);
      if (field.id === "13") add("Other cover leather", "q13_typeA[other]");
      if (field.id === "46") add("Other imprinting option", "imprinting-other");
    }
  }
  flush(); heading = "ADDITIONAL PROJECT DETAILS";
  for (const [label, name] of [
    ["Preferred contact method", "preferred-contact"], ["Project type", "project-type"],
    ["Book title", "book-title"], ["Book source", "book-source"],
    ["Deadline or occasion", "deadline"], ["Project notes", "project-notes"],
    ["Photo attachment", "photo"], ["Photographic end-page artwork", "end-page-artwork"],
  ]) add(label, name);
  flush();
  return sections.join("\n\n");
}
