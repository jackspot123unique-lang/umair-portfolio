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

## Expanded Portfolio Status dashboard

- Core Expertise / Portfolio Status desktop card is widened to 600px and the hero layout is expanded while retaining mobile responsiveness.
- Portfolio Status now shows live linked counts for Professional Experience, Internships, Total Projects, Projects Work, Education, Research & Publications, and Certifications.
- Added Project Breakdown cards for each current project category.
- Added Academic Snapshot cards for CGPA — UET Mardan, F.Sc Pre-Engineering, and SSC — Science. Their values read automatically from the Education records.
- Each status card scrolls to its related portfolio section. Project category cards open the matching Project Portfolio tab.

## Expanded first-page breakdown dashboard

- The desktop Core Expertise / Portfolio Status card is expanded again to 720px at large desktop widths. The wider hero layout grows outwards, so the centered circular profile image remains centered while the left content gains space to the left.
- Removed the main Education count card. Education is represented by the linked Academic Snapshot only.
- Added live linked breakdown groups for Professional Experience, Internships, Total Projects, Projects Work, and Research & Publications.
- Certifications remains a single main status card with no breakdown, as requested.

## Automatic new Education snapshot cards

- Every new Academic Degree added in Admin Mode (for example M.S., M.Phil., Ph.D., diploma or another qualification) now automatically appears in the first-page **Academic Snapshot — Education** area.
- The snapshot uses the degree grade/CGPA/marks when available; otherwise it displays the degree year. Each card links back to Education.

## CGPA label

- Changed the Academic Snapshot label from **CGPA — UET Mardan** to **CGPA — B.Sc. Mechanical Engineering**.

## Hero, layout and justified-text refinements

- Shifted the desktop hero profile circle to align above the left Mechanical BIM Engineer content and enlarged it to 205px. The mobile profile layout remains centered and responsive.
- Experience and Internship breakdown cards now show their real date/duration instead of numeric 1, 2, 3 values.
- Changed About to a three-column desktop composition: one About column plus two Capability columns.
- Changed Certifications & Workshops to a two-column desktop grid.
- Added justified text alignment to Professional Experience bullets, Internship descriptions, Project Portfolio descriptions, Projects Work descriptions, Research descriptions, About text and Capability descriptions.

## Additional visual sizing and readability update

- Increased the desktop hero profile circle to 240px.
- Made Portfolio Status numbers, labels and group headings dark navy for stronger contrast.
- Reduced Professional Experience and Internship date value font size to keep date ranges clean in their breakdown cards.
- Reduced Academic Snapshot GPA/marks value size.
- Expanded the About and Certifications containers to 1320px on desktop, widening the two Capability columns and both Certification columns.

## Status colors, compact values and research width update

- Restored the original sky-blue and muted Portfolio Status text palette.
- Reduced Academic Snapshot GPA/marks values to 12px and breakdown dates to 7.5px.
- Projects Work Breakdown now uses live category counts, matching Project Breakdown behavior.
- Research & Publications Breakdown now uses automatic 1, 2, 3… item numbering.
- Research & Publications cards now use the same wide 1320px two-column desktop layout as Certifications.

## Status card size and Projects Work counting correction

- Added final high-specificity compact styles so Academic Snapshot values are 11px and Experience/Internship dates are 8.5px even in the wide four-column dashboard.
- Projects Work Breakdown now lists only categories that actually contain a Projects Work item. Default empty categories with zero counts are no longer shown.

## Project Work / Gallery retirement

- Removed the complete Projects Work / Gallery navigation link, hero button, page section, add/edit/upload/remove UI, first-page main status card and first-page breakdown.
- Removed Gallery defaults from both the full-stack and standalone portfolio data.
- Existing saved Gallery JSON is automatically removed from the in-memory portfolio after deployment and permanently cleared from the saved portfolio record at the next successful admin login/save.
- Existing raw storage files are intentionally not automatically deleted from Cloudflare R2, to avoid deleting files unexpectedly. They are no longer shown or linked by the website and may be removed manually from R2 storage if desired.

## Immediate Research & Publications updates

- Research cards no longer wait for the reveal observer, so a newly added card appears immediately without reloading.
- Add, Edit and Remove Research actions now call the complete render pipeline. This updates the Research & Publications section and the first-page Research status count/breakdown immediately.

## Reliable editable headers

- Fixed Professional Experience and Project Portfolio header persistence. They now save to `sectionHeaders` data instead of temporary DOM-only objects.
- Added editable headers for Core Expertise, Portfolio Status, Internships, Proficiency Levels and Send a Message.
- All existing section header controls (About, Core Competence, Skills, Education, Research & Publications, Certifications and Contact) continue to save through the same persistent data path.

## Accent-preserving minor header editor

- Proficiency Levels and Send a Message now use two-field heading editors: first word(s) and highlighted word.
- The highlighted word is always rendered with the original sky-blue accent after editing.
- Older saved plain/HTML header values are automatically converted to the new two-part format.
- Internship remains a direct persistent plain heading editor.

## Universal two-part Edit Header format

- Every section edit-header modal now uses First word(s) and Highlighted word fields, alongside the existing eyebrow/description fields where applicable.
- About, Core Competence, Professional Experience, Project Portfolio, Skills, Education, Research, Certifications and Contact preserve their blue highlighted final/second phrase after editing.
- Internships, Core Expertise and Portfolio Status now use the same two-part editor and accent renderer.

## Universal picture, logo and status-breakdown customization

- Added Admin Mode Customize Picture and Customize Logo controls with size, horizontal position and vertical position fields.
- Added persistent responsive `mediaLayout` data for profile picture and logo geometry.
- Added an Edit Breakdown Headers control under Portfolio Status for Academic Snapshot, Professional Experience, Internship, Project and Research breakdown headings.

## Certification categories and automatic chronological sorting

- Certifications & Workshops now has Workshops, General Certifications and Technical Certifications groups.
- Each group retains a two-column card layout on desktop and one column on mobile.
- Add/Edit Certificate includes a mandatory category selector.
- Certificates automatically sort from oldest to newest by the entered date within their own category.
- Existing certificate records are automatically categorized when the portfolio loads and persist after the next admin save.

## Freelance, chronological sorting and direct project categories

- Added a fully editable Freelance Experience section between Professional Experience and Internships. It supports title, company/location, date, bullets, tags, files, add/edit/upload/remove and header editing.
- Professional Experience, Freelance Experience, Internships and Research & Publications sort oldest to newest.
- Academic Degrees sort newest to oldest.
- Project Portfolio now displays all categories directly, each under its own heading with a two-column card grid. Project category counts on the first page scroll to the corresponding visible category heading.

## Full-width Project Portfolio cards

- Project Portfolio categories remain directly visible, but each project now appears as one full-width card instead of a two-column tile.
- Project cards use matching white background, border, padding, typography and shadow strength inspired by Professional Experience cards.
- Every category heading still appears before its project cards, and each category retains its automatic project count.

## Compact project and certification category spacing

- Removed the hidden empty Project Portfolio tabs container from page flow.
- Reduced the Project Portfolio heading-to-first-category spacing.
- Removed the duplicate public Certifications & Workshops sub-toolbar before Workshops, while preserving the Add Certificate button in Admin Mode.
- Reduced the Certifications header-to-first-category spacing.

## Final compact spacing and card-color restoration

- Forced zero extra margin between Project/Certification main headers and their first category heading.
- Added a top-level Admin Mode Add Certificate button so the redundant inner certification toolbar can stay completely removed from public layout.
- Restored the original light `var(--bg)` background for all Project Portfolio cards, including FYP, and all Certification cards. New projects/certificates inherit the same background automatically.

## Forced compact mobile category flow

- Added final high-specificity zero-height/zero-margin rules for the old hidden Project tabs and Certifications inner toolbar.
- Project and Certification category lists now begin immediately after their main heading/description area, matching the compact Skills & Software spacing.

## Project category navigation and timeline styling

- Added clickable project category jump boxes with live counts; clicking one scrolls directly to its category.
- Added an Experience-style left vertical rail and marker to each full Project Portfolio category section.
- Added a gradient finish line after every category grid.
- Project cards retain the light original background during hover, touch, active and focus interactions.
