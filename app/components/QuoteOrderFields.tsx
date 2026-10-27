import Image from "next/image";
import fields from "./quote-fields.json";

export type OrderAnswers = Record<string, string | string[]>;

export function orderFieldVisible(id: string, answers: OrderAnswers) {
  switch (id) {
    case "99": return answers["96"] === "Smooth Acrylic";
    case "97": return String(answers["96"] || "").startsWith("Custom Photographic");
    case "39": return answers["28"] === "Tooled Ribs (spine width only)";
    case "40": return answers["28"] === "Raised Ribs";
    case "42": return answers["28"] === "Raised Ribs";
    case "82": return answers["48"] === "Yes";
    case "53": case "54": case "55": case "84": return answers["51"] === "Yes";
    case "46": case "47": return answers["45"] === "Yes";
    case "58": return Number(answers["57"]) > 0;
    default: return true;
  }
}

export function orderInputName(name: string) {
  const contactNames: Record<string, string> = {
    "q6_name[first]": "first-name", "q6_name[last]": "last-name",
    "q9_phoneNumber[full]": "phone", "q8_email": "email",
  };
  return contactNames[name] || name;
}

export default function QuoteOrderFields({ answers, onChange }: {
  answers: OrderAnswers;
  onChange: (id: string, value: string | string[]) => void;
}) {
  return <div className="order-fields">{fields.map(field => {
    if (!orderFieldVisible(field.id, answers)) return null;
    if (field.type === "head") return <div className="order-heading" key={field.id}><h3>{field.label}</h3>{field.note && <p>{field.note}</p>}</div>;
    if (field.type === "image") return <figure key={field.id} className="order-example">
      <Image src={field.src!} alt={field.alt!} width={field.width!} height={field.height!} unoptimized />
      <figcaption>{field.alt}</figcaption>
    </figure>;
    if (field.type === "fullname" || field.type === "address") return <fieldset key={field.id}>
      <legend>{field.label} *</legend><div className="form-grid two-col">{field.inputs!.map(input => <label key={input.name}>
        {input.label}{input.required ? " *" : ""}<input name={orderInputName(input.name)} autoComplete={input.autoComplete} required={input.required} />
      </label>)}</div>
    </fieldset>;
    const id = `order-${field.id}`;
    const value = answers[field.id] || "";
    if (field.type === "radio" || field.type === "checkbox") return <fieldset className="order-choice" key={field.id}>
      <legend>{field.label}{field.required ? " *" : ""}</legend>
      <div className="order-options">{field.options!.map(option => <label key={option}>
        <input type={field.type} name={field.name} value={option}
          required={field.type === "radio" && field.required}
          checked={Array.isArray(value) ? value.includes(option) : value === option}
          onChange={event => onChange(field.id, field.type === "checkbox"
            ? (event.target.checked ? [...(Array.isArray(value) ? value : []), option] : (Array.isArray(value) ? value : []).filter(item => item !== option))
            : option)} />{option === "other" ? "Other" : option}
      </label>)}</div>
      {field.id === "13" && value === "other" && <label>Other cover leather *<input name="q13_typeA[other]" required /></label>}
      {field.id === "46" && Array.isArray(value) && value.includes("Other") && <label htmlFor="order-imprinting-other">Other imprinting option: *
        <input id="order-imprinting-other" name="imprinting-other" required />
      </label>}
    </fieldset>;
    return <label key={field.id} htmlFor={id}>{field.label}{field.required ? " *" : ""}
      {field.note && !["42", "58"].includes(field.id) && <span className="field-note">{field.note}</span>}
      {field.type === "dropdown" ? <select id={id} name={orderInputName(field.name!)} required={field.required} value={String(value)} onChange={event=>onChange(field.id,event.target.value)}>
        <option value="" disabled>Please select</option>{field.options!.map(option=><option key={option}>{option}</option>)}
      </select> : field.type === "textarea" ? <textarea id={id} name={field.name} rows={4} required={field.required} />
        : <input id={id} name={orderInputName(field.name!)} type={field.type === "number" ? "number" : field.type === "phone" ? "tel" : field.type === "email" ? "email" : "text"}
          autoComplete={field.inputs?.[0].autoComplete || undefined} required={field.required}
          aria-describedby={["42", "58"].includes(field.id) ? `${id}-note` : undefined}
          min={field.type === "number" ? (field.id === "57" ? 0 : 0.01) : undefined}
          step={field.type === "number" ? (field.id === "57" ? 1 : "any") : undefined}
          onChange={event=>onChange(field.id,event.target.value)} />}
      {["42", "58"].includes(field.id) && <span id={`${id}-note`} className="field-note">{field.note}</span>}
    </label>;
  })}</div>;
}
