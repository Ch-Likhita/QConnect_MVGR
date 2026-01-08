# Email Verification Implementation Plan

## Tasks
- [x] Create `/verify/email-confirm/page.tsx`
- [x] Update `/verify/student-email/page.tsx` (remove redirect after email send)
- [x] Add "Edit Profile" button to `/profile/[id]/page.tsx`
- [x] Create `/profile/edit/page.tsx` reusing form from `/profile/complete`
- [x] Remove `functions.config()` from Firebase Functions and hardcode Netlify URL

## Followup steps
- [ ] Redeploy Firebase Functions: `firebase deploy --only functions`
- [ ] Test email verification flow end-to-end
- [ ] Test profile editing functionality
