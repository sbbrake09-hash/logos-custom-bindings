"use client";

import { useState } from "react";
import type { FormEvent } from "react";

const MAX_FILE_BYTES = 7 * 1024 * 1024;

export default function QuoteForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const photo = form.elements.namedItem("photo") as HTMLInputElement | null;

    if (photo?.files?.[0] && photo.files[0].size > MAX_FILE_BYTES) {
      setStatus("error");
      setMessage("Please keep the photo under 7 MB so it can be delivered safely.");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        body: new FormData(form),
      });

      if (!response.ok) throw new Error("Submission failed");
      form.reset();
      setStatus("success");
      setMessage("Thank you. Your project details are on their way to Logos Custom Bindings. We’ll be in touch soon.");
    } catch {
      setStatus("error");
      setMessage("Something went wrong while sending your request. Please try again or email logoscustombindings@yahoo.com directly.");
    }
  }

  return (
    <form
      className="quote-form"
      name="custom-binding-quote"
      method="POST"
      action="/__forms.html"
      data-netlify="true"
      netlify-honeypot="bot-field"
      encType="multipart/form-data"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="custom-binding-quote" />
      <input type="hidden" name="subject" data-remove-prefix value="New Logos Custom Bindings quote request" />
      <p className="honeypot" aria-hidden="true"><label>Don’t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>

      <fieldset>
        <legend>Your contact details</legend>
        <div className="form-grid two-col">
          <label>First name <input name="first-name" type="text" autoComplete="given-name" required /></label>
          <label>Last name <input name="last-name" type="text" autoComplete="family-name" required /></label>
          <label>Email address <input name="email" type="email" autoComplete="email" required /></label>
          <label>Phone number <input name="phone" type="tel" autoComplete="tel" /></label>
        </div>
        <label>Best way to reach you
          <select name="preferred-contact" defaultValue="Email">
            <option>Email</option>
            <option>Phone</option>
            <option>Either is fine</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Tell us about the project</legend>
        <label>What would you like us to make or restore?
          <select name="project-type" defaultValue="" required>
            <option value="" disabled>Select a project type</option>
            <option>Custom Bible rebinding</option>
            <option>Bible repair or restoration</option>
            <option>Custom leather Bible</option>
            <option>Book or journal restoration</option>
            <option>Hand-bound journal or custom notebook</option>
            <option>Customizations for a Bible, journal, or notebook</option>
            <option>Custom note pad holder or other custom work</option>
            <option>Not sure yet</option>
          </select>
        </label>
        <div className="form-grid two-col">
          <label>Bible, book, or notebook title <input name="book-title" type="text" /></label>
          <label>Approximate dimensions <input name="dimensions" type="text" placeholder="Height × width × thickness" /></label>
        </div>
        <label>Do you already have the book?
          <select name="book-source" defaultValue="I will mail my own book">
            <option>I will mail my own book</option>
            <option>I’m interested in a Bible or notebook from Logos</option>
            <option>I’m not sure yet</option>
          </select>
        </label>
        <label>What condition is it in?
          <textarea name="condition" rows={4} placeholder="Tell us about worn covers, loose pages, a damaged spine, water damage, or anything else we should know." required />
        </label>
      </fieldset>

      <fieldset>
        <legend>Finishing details</legend>
        <div className="form-grid two-col">
          <label>Preferred material <input name="preferred-material" type="text" placeholder="For example: leather, soft cover, or open to recommendations" /></label>
          <label>Color or style direction <input name="color-style" type="text" placeholder="For example: oxblood, natural, understated" /></label>
        </div>
        <label>Personalization and details
          <textarea name="personalization" rows={4} placeholder="Imprinting, ribbons, pockets, closures, gilding, initials, or other ideas." />
        </label>
        <label>Desired deadline or occasion <input name="deadline" type="text" placeholder="Optional—tell us if this is for a gift or special date" /></label>
      </fieldset>

      <fieldset>
        <legend>Anything else?</legend>
        <label>Project notes
          <textarea name="project-notes" rows={5} placeholder="Share the story behind the piece, your questions, or anything else that would help us understand the project." />
        </label>
        <label>Optional photo <span className="field-note">One image of the cover, spine, or damage is helpful. Maximum 7 MB.</span>
          <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
      </fieldset>

      <button className="button form-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending your request…" : "Send project details ↗"}
      </button>
      <p className={`form-status ${status}`} role="status" aria-live="polite">{message}</p>
      <p className="form-privacy">Your details are used only to respond to this project inquiry.</p>
    </form>
  );
}
