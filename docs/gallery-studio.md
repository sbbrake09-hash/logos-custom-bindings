# Johnny’s Gallery Studio

Open https://logos-custom-bindings.netlify.app/admin/ or choose **Studio login** in the website footer.

## Your first visit

Open the invitation sent to **logoscustombindings@yahoo.com**, choose a password of at least 12 characters, and sign in. The invitation is personal—do not forward it. If a password reset is needed later, choose **Forgot your password?** Check spam if an email is missing.

## Share a project

1. Choose **New project**. Add a title, a service category, and the story behind the work.
2. Choose **Add photos** from your phone or computer. The studio saves your project text before processing photos. Keep the tab open while each photograph finishes. Up to 20 photos per project; each original can be up to 20 MB and 48 megapixels.
3. Describe each photo in **Alt text**—for example, “Black leather Bible with raised spine ribs and red ribbon markers.” Add captions and Before/After labels if useful.
4. Choose **Use as cover**. Use **Earlier** and **Later** to arrange photographs.
5. **Save draft** keeps your work private. **Preview** shows its layout. **Publish** makes it visible on both websites without a rebuild. Refresh the public page to see it.

Editing a published project does not change the public version until you choose **Publish changes**. A failed photo can be retried individually. Dismiss a failed upload if you no longer want it.

## Homepage selections

Choose **Feature** on up to three published projects. Choose **Featured** again to remove that selection. Empty spaces automatically use the newest published work.

## Hide or restore work

**Unpublish** removes a project from public view but keeps its draft. **Archive** also moves it to the Archived tab. **Restore** brings it back as a draft; publish it again when ready. There is no permanent-delete button.

If another device saved a newer version, the studio blocks your stale save. Keep the page open, copy any unsaved text, and choose **Reload saved version** before continuing.

## Website maintainer notes

- Netlify Identity: invitation-only; email confirmation required. Only the invited, confirmed `logoscustombindings@yahoo.com` user with server-controlled `gallery-editor` role is authorized. No roles are accepted from user metadata.
- Site-scoped stores: `gallery-projects-v1` and `gallery-media-v1`. Do not delete these stores during redeployments. `scripts/gallery-seed.mjs` imports the six original projects once and never overwrites an existing record. The seventh image belongs to the stacked-Bibles project.
- Atomic per-project draft/published record writes use strong consistency and `onlyIfMatch`. Homepage selections have a separate conditional-write record capped at three. Media IDs are immutable and bound to one project.
- Public pages read the published Netlify feed server-side with no cache, so publication changes do not wait for rebuilding. Storage failures show an unavailable state, not a successful empty gallery. Project-page and sitemap failures fail rather than silently dropping entries.
- Private reads and mutations require a fresh confirmed invited Identity account and the editor role. Mutations require a matching Origin. Draft photographs are never included in the public feed; public image requests must reference a currently published photo. All private responses use `no-store`.
- Photo originals stay on the uploader’s device. Canvas export and server-side re-encoding strip metadata. Full images are at most 2400px; thumbnails at most 800px. The server validates content and pixel count, not just filenames.
- `NEXT_PUBLIC_GALLERY_ORIGIN` controls the trusted Netlify origin for both builds; `NEXT_PUBLIC_SITE_ORIGIN` controls canonical URLs. Update both hosts when adopting a domain. Netlify Identity email links and redirect allowlists must also use that domain. Never forward an invitation hash to a different origin.
- Gallery editing does not modify the quote form or Etsy storefront.
- HEIC conversion uses the unmodified `heic-to` package (LGPL-3.0) on demand in the editor only. Source and license: https://github.com/hoppergee/heic-to . Its bundled decoder derives from https://github.com/strukturag/libheif . The npm lockfile pins the distributed source version; replacement builds can be made by replacing this dependency and rebuilding the site.

## Verification

Run `node tests/gallery.integration.mjs` for local real-storage integration tests with a mocked Identity upstream. These are isolated from production and do not create accounts or send mail. Run the rendered HTML tests and both production builds before release. Live invitation acceptance and physical-iPhone testing must be completed by Johnny with his account; do not create additional editor accounts automatically.
