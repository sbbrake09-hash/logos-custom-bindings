"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import QuoteOrderFields from "./QuoteOrderFields";
import type { OrderAnswers } from "./QuoteOrderFields";
import { validateImprinting } from "./quote-validation";
import { quoteSummary } from "./quote-summary";

const MAX_FILE_BYTES = 7 * 1024 * 1024;

export default function QuoteForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState<OrderAnswers>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const imprintingError = validateImprinting(data);
    if (imprintingError) {
      setStatus("error");
      setMessage(imprintingError.message);
      form.querySelector<HTMLInputElement>(`input[name="${imprintingError.field}"]`)?.focus();
      return;
    }
    const files = [...data.values()].filter((value): value is File => value instanceof File && value.size > 0);
    if (files.reduce((total, file) => total + file.size, 0) > MAX_FILE_BYTES) {
      setStatus("error");
      setMessage("Please keep all attachments together under 7 MB so they can be delivered safely.");
      return;
    }
    setStatus("sending");
    setMessage("");
    data.set("order-summary", quoteSummary(data));
    try {
      const response = await fetch("/__forms.html", { method: "POST", body: data });
      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      setAnswers({});
      setStatus("success");
      setMessage("Thank you. Your project details are on their way to Logos The Bible Rebinder. We’ll be in touch soon.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong while sending your request. Please try again or email logoscustombindings@yahoo.com directly.");
    }
  }

  return (
    <form className="quote-form" name="custom-binding-quote" method="POST" action="/__forms.html"
      data-netlify="true" netlify-honeypot="bot-field" encType="multipart/form-data" onSubmit={handleSubmit}>
      <input type="hidden" name="form-name" value="custom-binding-quote" />
      <input type="hidden" name="subject" data-remove-prefix value="New Logos The Bible Rebinder quote request" />
      <p className="honeypot" aria-hidden="true"><label>Don’t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
      <p className="field-note">Fields marked * are required. Additional choices appear as you customize your rebind.</p>
      <QuoteOrderFields answers={answers} onChange={(id, value) => setAnswers(current => ({ ...current, [id]: value }))} />
      {String(answers["96"] || "").startsWith("Custom Photographic") && <label>Photographic end-page artwork (PDF)
        <span className="field-note">Provide a high-quality digital PDF. All attachments together must be under 7 MB.</span>
        <input name="end-page-artwork" type="file" accept="application/pdf" />
      </label>}
      <fieldset>
        <legend>Additional project details</legend>
        <label>Best way to reach you<select name="preferred-contact" defaultValue="Email"><option>Email</option><option>Phone</option><option>Either is fine</option></select></label>
        <label>What would you like us to make or restore?
          <select name="project-type" defaultValue="Custom Bible rebinding">
            <option>Custom Bible rebinding</option><option>Bible repair or restoration</option><option>Custom leather Bible</option>
            <option>Book or journal restoration</option><option>Hand-bound journal or custom notebook</option>
            <option>Customizations for a Bible, journal, or notebook</option><option>Custom note pad holder or other custom work</option><option>Not sure yet</option>
          </select>
        </label>
        <label>Bible, book, or notebook title<input name="book-title" /></label>
        <label>Do you already have the book?<select name="book-source" defaultValue="I will mail my own book"><option>I will mail my own book</option><option>I’m interested in a Bible or notebook from Logos</option><option>I’m not sure yet</option></select></label>
        <label>Desired deadline or occasion<input name="deadline" placeholder="Optional—tell us if this is for a gift or special date" /></label>
        <label>Project notes<textarea name="project-notes" rows={4} /></label>
        <label>Optional photo<span className="field-note">An image of the cover, spine, or damage is helpful. All attachments together must be under 7 MB.</span><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" /></label>
      </fieldset>
      <button className="button form-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending your request…" : "Send project details ↗"}</button>
      <p className={`form-status ${status}`} role="status" aria-live="polite">{message}</p>
      <p className="form-privacy">Your details are used only to respond to this project inquiry.</p>
    </form>
  );
}
