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
