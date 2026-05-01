# Vienna United Fanshop — Proposal Build Notes

**Project:** Vienna United Fanshop  
**Client:** Peachy (Andrea's sister), shop manager at Vienna United Basketball  
**Author:** Post205 / Toffer  
**Date:** April 2026

---

## The Problem

Vienna United runs their shop on WordPress. Fans order by ticking checkboxes on a form page, payment goes through a Stripe iframe bolted to the bottom, and every submission lands in someone's inbox to be processed by hand. There's no cart, no order history, no receipts, no admin panel. Updating a product price requires editing WordPress directly.

We scraped the live site (`viennaunited.eu/vienna-united-shop`) in April 2026 to document exactly what we found. The screenshot is saved in `brand_assets/` and used in the proposal.

The goal was to build a real replacement: a German-language storefront for fans and an English admin panel for Peachy, since she manages the shop in English.

---

## Two-Proposal Architecture

We built two separate HTML files from the start, not one document that tries to serve two audiences.

**`proposal/index.html`** — Peachy's proposal (Toffer → Peachy)  
This is the internal document. It shows her:
- The full market rate (€1,800 setup + €120/month) with EUR, USD, and PHP conversions so she has context on what this build is worth
- Toffer's rate to her separately, framed as "What I need" — the setup fee is TBD and €75/month is the minimum ask, not an agreed number
- The multi-club opportunity: she's not just buying one shop, she's buying a platform she can sell to other clubs
- The business math for what she should charge Vienna United: €130/month = €1,560/year against a shop projecting €15,000–25,000 in annual transactions
- The registration steps she needs to complete before build can start

A yellow banner at the top marks it private: "This proposal is for you — not for Vienna United. The investment numbers in here are between us."

**`proposal/vienna-united.html`** — VU club proposal (Peachy → VU group)  
This is what Peachy shows the club. It:
- Has no multi-club framing — that's irrelevant to the club
- Has no Peachy's cost structure — VU doesn't need to know what she pays
- Uses pricing placeholders (`€— setup + €—/mo`) because Peachy decides what she charges VU — we're not deciding that for her
- Has a footer with TODO placeholders for Peachy's name, company, and contact details

This separation means each document can be sent directly without redacting anything.

---

## Research Process

Before writing a word, we scraped three things:

**The live shop** (`viennaunited.eu/vienna-united-shop`) — full screenshot, product list with prices, and a first-hand look at exactly what's broken. Five specific findings are documented in the proposal: no cart, manual order processing, no customer receipts, no admin panel, Stripe bolted directly to a form.

**Vienna United club data** — 711 active players, largest basketball program in Austria. Teams from Mini (U9) through adult Seniors and Damen. New player turnover ~20% per season ≈ 142 new players who need a jersey set (€134 each) = ~€19k from new gear alone. This anchors the €15,000–25,000 annual projection.

**Austrian payment market data** — sourced from noda.live citing Statista Q4 2025:
- Cards: 38% of e-commerce (Mastercard dominates, debit preferred)
- PayPal: 73% of Austrians have used it — most widely adopted
- EPS: Austria's domestic bank-redirect, significant trust signal
- Klarna: 38% — covers both pay-later (BNPL) and instant bank transfer (Sofort/"Pay Now")

This research directly drove the payment method selection and was factchecked carefully — see the Audit section below.

---

## Merchant Account Requirements (Verified)

This was a specific area we audited because the original draft had errors.

**PayPal Business:** No Gewerbe (trade licence) required. Peachy signs up as a sole proprietor at paypal.com/at with personal ID (passport) and an Austrian bank account. The account is independent of any business registration.

**Stripe:** Requires a business registration number for KYC verification. In Austria, that's the Gewerbe. Peachy registers through WKO or the USP portal (`usp.gv.at`) — not `gisa.gv.at`, which is only the trade register lookup database.

Once Stripe is verified:
- Cards (Visa/Mastercard) — active immediately
- EPS — native Stripe support for Austrian merchants, no separate application
- Klarna — available through Stripe, no separate Klarna merchant contract

These are two completely separate setups. The proposal reflects this by splitting them into two distinct steps, each with their own requirements.

---

## Design Decisions

**Stack:** Plain HTML, inline CSS. No build tools, no framework. The file is self-contained and can be opened in any browser, emailed, hosted anywhere, or printed.

**Visual identity:** Pulled directly from Vienna United's live branding — black primary (`#0a0a0a`), yellow/lime accent (`#e8ff00`), white text. The logo files are in `proposal/assets/`.

**Mockups:** Both the storefront and admin panel are built as HTML mockups inside the proposal — no images, no design software exports. The storefront mockup shows German-language UI (Warenkorb, Fanartikel, In den Warenkorb) because that's what fans actually see. The admin mockup shows English because that's what Peachy sees.

The admin mockup in the Peachy proposal shows "Fanbase [Admin]" with a club selector and "Logged in: Peachy" — reflecting that she owns the platform and can manage multiple clubs. The VU proposal version shows "Vienna United [Admin]" and "Logged in: Admin" — the club sees their own branded panel, not the platform layer.

**Payment pills in the storefront mockup:** Visa, MC, PayPal, EPS (red text for the Austrian brand), Klarna (dark navy with pink text matching Klarna's palette).

**Step connectors in Next Steps:** CSS pseudo-element (`::after`) draws a vertical line between numbered circles, creating a connected timeline without any images.

**Color-coded step ownership:** Yellow = your side, blue = our side, green = both sides.

**Responsive:** The header, platform feature cards, pricing block, and footer all reflow at 640px. Tested mobile breakpoints.

**Print media query:** Padding reduces on print so the document fits cleanly on A4 or letter without cutting off.

---

## Copywriting Approach

The brief was: write like Toffer talking to family about a project. Not a pitch. Not a sales document.

This showed up in several specific decisions:

- The banner on Peachy's proposal doesn't say "this is confidential" — it says "The investment numbers in here are between us." Direct and personal.
- The investment section framing is "What I need" not "Your rate" — because nothing has been agreed yet, and that label makes the uncertainty explicit without making it awkward.
- The blue callout about what to charge VU presents the math plainly: €1,560 a year against €15,000–25,000 in transactions. We don't call it a percentage because percentages obscure whether the math is favorable. Absolute figures are clearer.
- Section headers are declarative, not questions or teasers: "What we're replacing and what we're building." "We looked at the current shop." "Three things before we start."

---

## Audit Log

During review, we caught and corrected six factual errors in the first draft:

| Error | Fix |
|---|---|
| "All four run through Stripe" | PayPal is a separate integration. Fixed to: "Cards, EPS, and Klarna run through Stripe. PayPal is a separate integration." |
| "0.6% of their annual shop revenue" | Wrong by 10x. €130 × 12 = €1,560. Against €15–25k = 6–10%, not 0.6%. Fixed to show the actual euro figure. |
| "The investment numbers are what we agreed between us" | Nothing has been agreed. Fixed to: "The investment numbers in here are between us." |
| "38% who prefer pay-later" | Klarna covers both BNPL and instant bank transfer (Sofort). Fixed to: "38% of Austrian shoppers for both pay-later and instant bank transfer." |
| PayPal step said Gewerbe documentation covers Stripe | These are completely separate applications with different requirements. Split into two distinct steps. |
| Gewerbe registration URL was gisa.gv.at | GISA is a lookup database only. Actual registration is through WKO or USP at usp.gv.at. |

---

## What's Pending

- `proposal/vienna-united.html` pricing placeholders — Peachy fills in setup + monthly once she decides what she's charging VU
- VU proposal footer — Peachy's name, company name, and email
- Setup fee discussion between Toffer and Peachy — €75/month is Toffer's minimum ask, setup fee not yet discussed
- CLAUDE.md at project root
- Supabase schema design
- The actual platform build — waiting on Peachy completing PayPal and Gewerbe/Stripe registrations

---

## File Structure

```
proposal/
  index.html          ← Peachy's proposal (platform-owner view)
  vienna-united.html  ← VU club proposal (client view, pricing TBD)
  assets/
    logo-white.png
    logo-black.png
    screenshot-shop.png
  build-notes.md      ← this file

brand_assets/         ← Full asset set scraped from viennaunited.eu
.firecrawl/           ← Raw scrape output (markdown + screenshots)
temp/                 ← Reference docs and brief
```

Both HTML files share the same `assets/` folder. When hosting, upload both files and the `assets/` folder together.
