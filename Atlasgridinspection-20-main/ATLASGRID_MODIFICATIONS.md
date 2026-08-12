# AtlasGrid REA Portal UI Modifications

This update preserves the existing white/light-green REA portal and sidebar while cleaning up tab content and adding the workflow requested in the design discussions.

## Changes

- Kept the sidebar: Overview, Claims, Verified reports, Project map, Contractors, Analytics.
- Added action badges for Claims and Verified reports.
- Removed the old behavior that rendered contractor, analytics, map, and report sections beneath every tab.
- Claims now starts from an existing contract/project register and shows approved coordinates.
- Added CSV/Excel import entry point and a future REA-system connector entry point.
- Added an REA consultant-assignment dialog. REA assigns the consultant firm only; the consultant remains responsible for field-officer assignment.
- Added a dedicated Contractors workspace focused on projects, inspections, verified projects, compliance, findings, re-inspections, risk, corrective actions, and contractor profiles.
- Simplified Verified Reports into one KPI row, one filter area, one records table, pagination, and one controlled-record notice.
- Corrected sample verified-report locations and project identifiers so different projects no longer all display Kano or the same project ID.
- Project Map continues to use the real Nigeria SVG state-boundary dataset from `@svg-maps/nigeria`.
- Added a compact Nigeria-map mode and used it in the Overview Project Coverage & Risk card.
- Added Beneficiaries Verified and Capacity Verified executive KPIs to the Overview.
- Removed the redundant Projects-by-State overview panel because geographic oversight is already represented by the map.
- Increased typography and control sizes across REA Overview, Claims, Verified Reports, Project Map, Contractors, and Analytics.
- Preserved the white/light-green Nigerian government visual direction.

## Verification performed

- TypeScript/TSX syntax-transpile checks passed for all modified React files.
- CSS opening/closing brace balance check passed.
- Full dependency installation could not complete in the execution environment before timeout, so a full Vite production build was not available here.
