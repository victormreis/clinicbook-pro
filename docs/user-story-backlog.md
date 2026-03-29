# ClinicBook Pro User Story Backlog

This backlog is the team-facing tracker for product work in ClinicBook Pro.

## Status Legend

- `Planned`: scoped but not started
- `In Progress`: actively being implemented or validated
- `Done`: implemented and verified in the application
- `Needs Review`: implemented but waiting for validation or approval

## Priority Legend

- `P1`: critical for core booking flow
- `P2`: important support capability
- `P3`: valuable improvement or process support

## Story Tracker

| Story ID | User Story | Priority | Status | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| US-01 | User registration | P1 | Done | Backend + Frontend | Authentication entry point |
| US-02 | Secure login | P1 | Done | Backend + Frontend | JWT-based login flow |
| US-03 | Logout | P1 | Done | Backend + Frontend | Token invalidation supported |
| US-04 | Update user profile | P2 | Done | Backend + Frontend | Profile edit screen available |
| US-05 | Admin user management | P2 | Done | Admin Frontend + Backend | User list, role toggle, delete |
| US-06 | View medical specialties | P1 | Done | Frontend + Backend | Available in appointment booking flow |
| US-07 | View doctors by specialty | P1 | Done | Frontend + Backend | Specialty filtering in booking flow |
| US-08 | Admin adds medical specialties | P2 | Done | Admin Frontend + Backend | Clinic management screen |
| US-09 | Admin adds doctors and assigns specialties | P2 | Done | Admin Frontend + Backend | Clinic management screen |
| US-10 | Admin edits/removes doctors | P2 | Done | Admin Frontend + Backend | Clinic management screen |
| US-11 | View available appointment times | P1 | Done | Frontend + Backend | Slot availability shown live |
| US-12 | Book an appointment | P1 | Done | Frontend + Backend | Booking form and API validation |
| US-13 | Cancel an appointment | P1 | Done | Frontend + Backend | User cancellation flow |
| US-14 | Prevent double booking | P1 | Done | Backend + Frontend | Conflict checks on booking/update |
| US-15 | View upcoming appointments | P2 | Done | Frontend + Backend | Upcoming and history sections |
| US-16 | Admin view of appointments | P1 | Done | Admin Frontend + Backend | Admin appointment management screen |
| US-17 | Admin schedule management | P1 | Done | Admin Frontend + Backend | Admin rescheduling support |
| US-18 | Admin appointment cancelation | P1 | Done | Admin Frontend + Backend | Admin cancellation endpoint and UI |
| US-19 | Admin handle schedule | P1 | Done | Admin Frontend + Backend | Filters, review, reschedule workflow |
| US-20 | Admin update appointment details | P1 | Done | Admin Frontend + Backend | Doctor/date/time/status update support |
| US-21 | User confirmation message | P2 | Done | Frontend | Success notices after booking actions |
| US-22 | User clear error message | P2 | Done | Frontend | Error notices with dismiss action |
| US-23 | User responsive application | P2 | Done | Frontend | Responsive layouts across key views |
| US-24 | User simple interface | P2 | Done | Frontend | Simplified booking/admin flows |
| US-25 | System data validation | P1 | Done | Backend + Frontend | Stronger validation for appointments |
| US-26 | Team member tracking user stories | P3 | Done | Product / Project Docs | This tracker is the shared view |
| US-27 | Team member unique user ID | P3 | Done | Product / Project Docs | Story IDs are unique and standardized |
| US-28 | Team member prioritize user stories | P3 | Done | Product / Project Docs | Priority field maintained here |
| US-29 | Team member update story status | P3 | Done | Product / Project Docs | Status field maintained here |
| US-30 | Team member documentation of backlog | P3 | Done | Product / Project Docs | Backlog documented in repo |

## Working Agreement

1. New stories must receive a unique `US-##` identifier before implementation starts.
2. Priority must be assigned before a story moves to `In Progress`.
3. Story status should be updated in this document whenever scope or implementation state changes.
4. Owners can be people, squads, or functional roles, but every story must have one clear accountable owner.
