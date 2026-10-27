# Gallery Studio

Open https://logosrebinder.com/admin/ or choose **Studio login** in the website footer.

## Your first visit

Johnny signs in with **logoscustombindings@yahoo.com**; Brandall signs in with **bbrake@senecar7.com**. Both accounts are already confirmed and prepared with their requested passwords. No invitation, email confirmation, or Netlify account is needed. Use **Show password** to check your entry. Your browser can remember your login, and supported sessions renew automatically. For future recovery, choose **Forgot your password?** Check spam if an email is missing. Recovery passwords must be at least 9 characters.

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

- Netlify Identity: public registration disabled. Only confirmed **logoscustombindings@yahoo.com** and **bbrake@senecar7.com** accounts with the server-controlled `gallery-editor` role are authorized. Both have identical permissions. No roles are accepted from user metadata. Role changes take effect on the next login or token refresh.
- Site-scoped stores: `gallery-projects-v1` and `gallery-media-v1`. Do not delete these stores during redeployments. `scripts/gallery-seed.mjs` imports the six original projects once and never overwrites an existing record. The seventh image belongs to the stacked-Bibles project.
- Atomic per-project draft/published record writes use strong consistency and `onlyIfMatch`. Homepage selections have a separate conditional-write record capped at three. Media IDs are immutable and bound to one project.
- Public pages read the published Netlify feed server-side with no cache, so publication changes do not wait for rebuilding. Storage failures show an unavailable state, not a successful empty gallery. Project-page and sitemap failures fail rather than silently dropping entries.
- Private reads and mutations require a fresh confirmed approved Identity account and the editor role. Mutations require a matching Origin. Draft photographs are never included in the public feed; public image requests must reference a currently published photo. All private responses use `no-store`.
- Photo originals stay on the uploader’s device. Canvas export and server-side re-encoding strip metadata. Full images are at most 2400px; thumbnails at most 800px. The server validates content and pixel count, not just filenames.
- Windows manual builds must run `node scripts/prepare-sharp-runtime.mjs` before bundling functions. The Netlify build command does this automatically. The media function explicitly includes the Linux Sharp and libvips runtime packages; its encoder loads only during uploads, so saved photographs remain readable independently of encoder initialization.
- `NEXT_PUBLIC_GALLERY_ORIGIN` controls the trusted Netlify origin for both builds; `NEXT_PUBLIC_SITE_ORIGIN` controls canonical URLs. Update both hosts when adopting a domain. Netlify Identity email links and redirect allowlists must also use that domain. Never forward an invitation hash to a different origin.
- Gallery editing does not modify the quote form.
- HEIC conversion uses the unmodified `heic-to` package (LGPL-3.0) on demand in the editor only. Source and license: https://github.com/hoppergee/heic-to . Its bundled decoder derives from https://github.com/strukturag/libheif . The npm lockfile pins the distributed source version; replacement builds can be made by replacing this dependency and rebuilding the site.

## Verification

For a manual release, use `npm run deploy:preview` and `npm run deploy:production` after a complete Netlify build. These commands verify every public image and the form-registration file against `.netlify/static`, require client CSS/JavaScript and all three functions, check the Linux image runtime, and preserve the gallery routes above the website catch-all. They explicitly publish `.netlify/static`; raw `.next` is not a deployable static bundle. For a preview or live website audit, run `npm run audit:assets -- https://YOUR-DEPLOY-URL` (defaults to the live domain). This checks the sitemap pages, all image variants and original assets, CSS backgrounds, client chunks, full gallery photographs, and unauthenticated private-media access. Complete desktop and mobile visual checks before production release.

`public/_redirects` routes optimized Next image URLs to Netlify Image CDN before the generated adapter rules and explicitly forwards the source URL, width, and quality. Keep this file in the static publish bundle. `npm run test:deploy` verifies the release check rejects missing or replaced logos, omitted routing/client assets, omitted gallery functions, and catch-all priority regressions.

Run `node tests/gallery.integration.mjs` for local real-storage integration tests with a mocked Identity upstream. These are isolated from production and do not create accounts or send mail. Run the rendered HTML tests and both production builds before release. Verify both website logins, session persistence, refresh, logout, password recovery, private draft saves and photo uploads on a deploy preview. Archive verification projects after testing. Account provisioning uses only the server-side Identity admin SDK through a temporary secret-protected function, which must be removed before final release. Never save passwords in code, documentation, browser bundles, or logs.
