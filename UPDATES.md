# Requested update — Portfolio Engr Umair Ahmad

The visual design, colors, animations, layout and existing working integrations are preserved.

## Added

- New Hero Title / Role entries automatically join the animated typed role line.
- Editable/displayed tags for Internships.
- Editable/displayed tags for every Project Portfolio category, including custom categories.
- Editable/displayed tags for Projects Work cards.
- Separate full-width Education and Certifications sections, each with its own navigation link and editable header.

## Corrected

- Project Portfolio attachment routing now uses both **category key and project ID**. Duplicate IDs in BIM/MEP, SolidWorks, Simulation and FYP can no longer send an upload, preview or removal action to the wrong category.
- Projects Work cards no longer show the large top example-image area. Uploaded files remain attached to the correct card and can still be previewed.
- New/updated Projects Work images use the storage URL returned by the existing upload flow.
- Public preview hides the portal download action, prevents the application download/print keyboard actions, and uses a sandboxed/toolbar-reduced PDF preview. Admin mode retains download access.

## Important storage note

The deployed project currently uses public asset URLs so visitors can preview files. The UI now restricts normal visitor download controls. Fully preventing a technically skilled visitor from saving a public URL would require moving existing assets to private storage and serving them through signed, admin-aware preview/download routes; that is not done here to avoid disrupting the live working R2/Neon/Resend deployment.
