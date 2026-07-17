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
- The currently selected Project Portfolio category is now preserved after add, edit, upload, remove and save renders. Adding a project while viewing SolidWorks automatically preselects SolidWorks; the same applies to BIM/MEP, Simulation, FYP and custom categories.
- Projects Work cards no longer show the large top example-image area. Uploaded files remain attached to the correct card and can still be previewed.
- New/updated Projects Work images use the storage URL returned by the existing upload flow.
- Public visitors can preview images and PDFs with normal browser controls. They can also use normal print/download controls as requested.
- Public Word, PowerPoint and Excel documents use the Microsoft Office web viewer when the uploaded R2 URL is public. Unsupported document formats fall back to the normal Download button.
- Admin mode keeps the same preview/download controls.

## Research & Publications section

- Added a separate **Research & Publications** section after Education and before Certifications.
- It has its own navigation link, editable heading, add/edit/remove controls, file uploads and publication URL field.
- Research item types include Research Paper, Conference Paper, Technical Research, Thesis / Dissertation, Case Study and Other.
- Core Expertise / Portfolio Status card is wider and slightly raised/right-aligned on desktop.
- Capability cards are slightly shifted right and upward on desktop without affecting mobile layout.
