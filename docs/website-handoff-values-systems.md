# Website Handoff — Values + SHERPA Systems
**Target:** post205.com (`index.html`)  
**Status:** Ready to implement  
**Scope:** Two additions — a new Values section and a new Systems section

---

## What we're adding

The current site has:
- Hero
- Case studies
- Promises (Security / Ownership / AI)
- About ("Filipinos don't march. We sway.")
- CTA / Contact
- Footer

We're adding two new sections:

1. **Values** — A full articulation of the 7 principles that drive every product decision. Goes **after the About section**, before the CTA.
2. **Systems** — An introduction to the SHERPA naming convention and what MIA vs PAX means. Goes **after Values**, before the CTA.

The CTA stays last. No nav links needed unless you want to add them.

---

## Tone notes

The ops values page is internal and technical. The website versions need to:
- Drop the internal implementation notes ("here's what this means for Supabase RLS…")
- Lead with the *why*, not the *how*
- Speak to a founder who is evaluating POST205, not a developer building on top of it
- Keep the conviction — these are real principles, not marketing copy

---

## Section 1 — Values

**Placement:** After `.about`, before `.cta`

**Section ID:** `#values`

**Nav link (optional):** Add `<a href="#values" class="nav-link">Values</a>` in the nav before the CTA button.

### CSS to add (inside the `<style>` block)

```css
/* ── VALUES ── */
.values {
  padding: 80px 48px;
  border-top: 1px solid var(--border);
}
.values-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.values h2 {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.1;
  color: var(--text);
  margin-bottom: 16px;
}
.values-intro {
  font-size: 16px;
  color: var(--text-2);
  line-height: 1.7;
  max-width: 600px;
  margin-bottom: 56px;
}
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.value-card {
  background: var(--black);
  padding: 28px 32px;
}
.value-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.value-num {
  font-family: ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-3);
}
.value-protocol {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--accent-text);
}
.value-card h4 {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 10px;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.value-card p {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.7;
}
.value-card .value-tagline {
  display: inline-block;
  margin-top: 14px;
  font-family: ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 3px 7px;
}

@media (max-width: 960px) {
  .values { padding: 56px 24px; }
  .values-grid { grid-template-columns: 1fr; }
}
```

### HTML to insert (after the closing `</section>` of `.about`, before `.cta`)

```html
<!-- ── VALUES ── -->
<section class="values" id="values">
  <div class="values-inner">
    <div class="section-label">The POST205 Protocols</div>
    <h2>Built for how<br>Filipinos actually work.</h2>
    <p class="values-intro">Every product decision, every design choice, every architecture call runs through one filter: does this work for Filipino teams — or only for an American office? Seven protocols. Each one named.</p>

    <div class="values-grid">

      <div class="value-card">
        <div class="value-header"><span class="value-num">01</span><span class="value-protocol">ALON Protocol</span></div>
        <h4>Filipinos Don't March. We Sway.</h4>
        <p>Jira wants a sprint plan two weeks out. SAP wants a sign-off before anything moves. Our systems are flexible by default — responsive to context, never so rigid they break when people do things their own way.</p>
        <span class="value-tagline">alon — wave</span>
      </div>

      <div class="value-card">
        <div class="value-header"><span class="value-num">02</span><span class="value-protocol">KUSA Protocol</span></div>
        <h4>May Kusa — Initiative is Sacred</h4>
        <p><em>May kusa</em> means acting out of genuine ownership, without being told to. Platforms that require permission for every action kill initiative. Ours make it easy to just do the right thing.</p>
        <span class="value-tagline">kusa — self-directed action</span>
      </div>

      <div class="value-card">
        <div class="value-header"><span class="value-num">03</span><span class="value-protocol">BALANGAY Protocol</span></div>
        <h4>Flexible Roles. Organic Teams.</h4>
        <p>The person who handles finance also greets clients. The owner also packs orders. The assistant also pitches. Our systems are built for this reality — roles are fluid, responsibilities overlap, and the platform supports both.</p>
        <span class="value-tagline">balangay — ancient Filipino vessel</span>
      </div>

      <div class="value-card">
        <div class="value-header"><span class="value-num">04</span><span class="value-protocol">ANGKOP Protocol</span></div>
        <h4>Infrastructure Empathy</h4>
        <p>Smart and Globe drop connections mid-upload. Power goes out in the provinces. We design for a Samsung Galaxy A-series on Smart LTE — not a MacBook on fiber in BGC. Actions are recoverable. Progress is never lost.</p>
        <span class="value-tagline">angkop — appropriate, fitting</span>
      </div>

      <div class="value-card">
        <div class="value-header"><span class="value-num">05</span><span class="value-protocol">HIYA Protocol</span></div>
        <h4>Understanding Hiya</h4>
        <p>A Filipino user who doesn't understand something will rarely tell you. They'll quietly stop using it. Interfaces must be immediately legible. Errors are forgiving and human. Onboarding never makes anyone feel like a beginner.</p>
        <span class="value-tagline">hiya — dignity, social shame</span>
      </div>

      <div class="value-card">
        <div class="value-header"><span class="value-num">06</span><span class="value-protocol">USAP Protocol</span></div>
        <h4>Organic Decision-Making</h4>
        <p>Filipino decisions happen in the middle of dinner, over Viber group chats, after a prayer, when the right person finally weighs in. Workflows are non-linear. People can pick up where they left off, change their minds, and iterate without penalty.</p>
        <span class="value-tagline">usap — to talk, to discuss</span>
      </div>

      <div class="value-card" style="grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start;">
        <div>
          <div class="value-header"><span class="value-num">07</span><span class="value-protocol">KAPWA Protocol</span></div>
          <h4>Designed for Everyone in the Room</h4>
          <p>In the same office, on the same team: a PhD sitting next to someone who didn't finish high school. Both working on the same problem. Both using the same system.</p>
          <p style="margin-top: 10px;">The interface should never signal who it was built for. Complexity is available for those who seek it. Simplicity is the default for everyone.</p>
        </div>
        <div style="padding-top: 28px;">
          <p style="font-size: 14px; color: var(--text-2); line-height: 1.7;">The test: can someone with a high school education figure out the core task without help? Can someone with a graduate degree still find the depth they need?</p>
          <p style="font-size: 14px; color: var(--text-2); line-height: 1.7; margin-top: 12px; font-style: italic;">If yes to both — we got it right.</p>
          <span class="value-tagline" style="margin-top: 16px;">kapwa — shared identity, we are one</span>
        </div>
      </div>

    </div>
  </div>
</section>
```

---

## Section 2 — Systems (SHERPA)

**Placement:** After `.values`, before `.cta`

**Section ID:** `#systems`

**Nav link (optional):** Add `<a href="#systems" class="nav-link">Systems</a>` alongside the values link.

This section tells potential clients that POST205 has a named methodology — it signals seriousness without requiring them to understand the architecture. Keep the technical explanation short; let the names do the heavy lifting.

### CSS to add (inside the `<style>` block)

```css
/* ── SYSTEMS ── */
.systems {
  padding: 80px 48px;
  border-top: 1px solid var(--border);
}
.systems-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.systems h2 {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.1;
  color: var(--text);
  margin-bottom: 16px;
}
.systems-intro {
  font-size: 16px;
  color: var(--text-2);
  line-height: 1.7;
  max-width: 560px;
  margin-bottom: 48px;
}
.systems-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 40px;
}
.system-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.system-card-head {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 20px 28px;
}
.system-card-label {
  font-family: ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 8px;
}
.system-card-name {
  font-family: ui-monospace, monospace;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.02em;
}
.system-card-name .system-accent { color: var(--accent); }
.system-card-body {
  padding: 24px 28px;
}
.system-card-body p {
  font-size: 15px;
  color: var(--text-2);
  line-height: 1.75;
}
.system-card-body p + p { margin-top: 10px; }
.system-card-badge {
  display: inline-block;
  margin-top: 16px;
  font-family: ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 3px 7px;
}
.systems-note {
  font-size: 14px;
  color: var(--text-3);
  line-height: 1.7;
  max-width: 700px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

@media (max-width: 960px) {
  .systems { padding: 56px 24px; }
  .systems-grid { grid-template-columns: 1fr; }
}
```

### HTML to insert (after the closing `</section>` of `.values`, before `.cta`)

```html
<!-- ── SYSTEMS ── -->
<section class="systems" id="systems">
  <div class="systems-inner">
    <div class="section-label">The SHERPA convention</div>
    <h2>Names carry<br>architecture.</h2>
    <p class="systems-intro">Every platform in the POST205 stack carries a structured name. Not a product name — a technical identity that encodes what the system is for and how it handles the load your business puts on it.</p>

    <div class="systems-grid">

      <div class="system-card">
        <div class="system-card-head">
          <div class="system-card-label">Booking · Inventory · Back Office</div>
          <div class="system-card-name">SHERPA S/1 <span class="system-accent">MIA</span></div>
        </div>
        <div class="system-card-body">
          <p><strong style="color: var(--text)">Multi-user Instant Access.</strong> The back-office stack: bookings, inventory, staff records, operations. Many people on the same records at the same time — a manager and an assistant updating the same booking, two staff members checking the same inventory count.</p>
          <p>When one person changes something, everyone else sees it immediately. No stale data. No double-bookings. Built for internal teams who need to trust what's on screen.</p>
          <span class="system-card-badge">Private · Internal · Strong consistency</span>
        </div>
      </div>

      <div class="system-card">
        <div class="system-card-head">
          <div class="system-card-label">Marketing · Payments · Real-time</div>
          <div class="system-card-name">SHERPA R/1 <span class="system-accent">PAX</span></div>
        </div>
        <div class="system-card-body">
          <p><strong style="color: var(--text)">Parallel Access eXchange.</strong> The public-facing layer: campaign links, payment pages, event check-ins, customer portals. Many independent events arriving at once from people outside your team — a payment coming in, a ticket scanning, a form submitting.</p>
          <p>Each event is its own stream. Nothing waits on another. Built for the burst volume that comes when your marketing actually works.</p>
          <span class="system-card-badge">Public-facing · External · High throughput</span>
        </div>
      </div>

    </div>

    <p class="systems-note">The same SHERPA backbone powers both. What changes is how users and data coexist under load. Back-office work needs everyone reading the same page at once. Public-facing work needs a switchboard where many independent calls run in parallel, none waiting on another.</p>
  </div>
</section>
```

---

## Optional: Expand the nav

The current nav has only a theme toggle and "Let's talk." If you want to add links:

```html
<!-- Add inside .nav-right, before the theme toggle -->
<a href="#values" class="nav-link">Values</a>
<a href="#systems" class="nav-link">Systems</a>
```

Keep it minimal. The CTA is the priority.

---

## Implementation order

1. Add CSS for Values section → test at desktop + mobile
2. Insert Values HTML after `.about` → verify 7th card spans full width correctly
3. Add CSS for Systems section
4. Insert Systems HTML after `.values` → verify 2-column layout on desktop, stacks on mobile
5. (Optional) Add nav links
6. Check both sections in light theme (`data-theme="light"`)
7. Netlify deploy

---

## Notes on what NOT to change

- The About section ("Filipinos don't march. We sway.") stays as-is — it's the emotional hook. The new Values section goes deeper.
- The SHERPA cards intentionally omit the 4-column convention breakdown (that's internal knowledge). On the website, the names carry the weight.
- Don't add a link to ops.post205.com or mention the internal command center.
