# Learnings — Website Projects

*Things that surprised us. What bit us, what worked unexpectedly well. Add after every project.*

---

## Supabase

**RLS verification — SQL Editor bypasses RLS.**
Always test access control using the REST API with the anon key in a private browser window, not the Supabase SQL Editor. The editor runs as service_role and will make everything appear to work even when RLS would block real users.

**Netlify token expiry.**
The `NETLIFY_AUTH_TOKEN` expires. When a deploy fails with an auth error, regenerate the token at app.netlify.com/user/applications. Name it something recognizable (e.g. `post205-claude`). Update `.env` immediately.

**Service role key in PATCH vs PUT (Supabase Admin API).**
When updating a user via the Supabase Admin API (`/auth/v1/admin/users/{uid}`), PATCH returns 405. Use PUT instead.

---

## DNS and Netlify

**Cloudflare proxy (orange cloud) breaks Netlify SSL provisioning.**
When pointing a domain to Netlify via Cloudflare, set DNS records to DNS-only (grey cloud), not proxied. Netlify needs to verify the domain directly to provision its Let's Encrypt SSL certificate. Switch to proxied only after SSL is confirmed.

**GitHub push does not auto-deploy.**
Netlify CLI deploy is required every time. Push to GitHub only for version control. Deploy separately via: `npx netlify deploy --prod --dir=. --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID`

**Branch dropdown empty on new Netlify site.**
If you connect a GitHub repo to Netlify before the repo has any commits, the branch dropdown is empty and uneditable. Fix: push at least one commit to create the `main` branch first, then return to Netlify to complete the setup.

---

## Privacy and Compliance (RA 10173)

**Vendor names in privacy policies are a liability.**
Don't name Supabase, Resend, or any infrastructure vendor in the privacy policy. Use generic classes: "cloud database provider," "email delivery service." Vendor relationships are not public.

**Section 16(b) requires scope and method of processing.**
RA 10173 mandates explaining how data is processed, not just what is collected. Include: collected by email and proposal forms, reviewed manually, nothing processed automatically.

---

## Copy and Design

**AI slop structural patterns — the ones that aren't obvious.**
Beyond banned words, watch for: three-item negative lists ("no X, no Y, no Z"), cause-effect chains ("because of X, we Y"), dramatic pivot sentences ("Something changed."), and mid-sentence question breaks ("The solution?"). These are structural tells, not just word-level ones.

**System fonts need weight 800 on headings — not 700.**
At weight 700, system-ui looks soft. Weight 800 gives the impact that web fonts like Syne provided. This is intentional — don't soften it.

---

*Add new learnings here as they happen. One project's hard lesson is another project's avoided mistake.*
