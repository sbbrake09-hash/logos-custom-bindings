export function validateImprinting(data: FormData) {
  if (data.get("q45_imprintingother") !== "Yes") return null;
  const locations = data.getAll("q46_imprintingOptions[]");
  if (!locations.length) return { message: "Please select at least one imprinting location.", field: "q46_imprintingOptions[]" };
  if (locations.includes("Other") && !String(data.get("imprinting-other") || "").trim()) {
    return { message: "Please describe your other imprinting option.", field: "imprinting-other" };
  }
  return null;
}
