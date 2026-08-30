#!/usr/bin/env python3
"""Verify the /w/lib/ gate end to end in a real browser.

Exercises every path the plan requires: wrong passphrase, empty passphrase,
correct passphrase, reload-after-unlock, and an unknown slug. Captures console
errors and page exceptions throughout — a silent JS throw is the failure mode
that killed an entire deck once before.

    python3 tools/verify-lib-gate.py [base_url]

Default base_url is a local server this script starts itself.
"""
import sys, subprocess, threading, http.server, socketserver, functools, time, os, json, shutil
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASS = "Verify  Dummy PASS"   # deliberately mixed case + double space: exercises normalise()
COHORT = "verifytest"
PORT = 8899

results = []


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(("  PASS  " if ok else "  FAIL  ") + name + (f"  — {detail}" if detail else ""))


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


DUMMY = """<!--SLUG:probe-one-->
<h1 data-blurb="A probe page to prove the gate works." data-group="Probe" data-tier="">Probe one</h1>
<p>If you can read this, the gate opened and the router resolved a slug.</p>
<blockquote>A sourced quotation renders as a blockquote with a teal rule.</blockquote>
<p class="c-ours">This paragraph should render with a dashed border and an OUR READ &middot; NOT SOURCED label.</p>
<p>Unicode check: &#8369;1,241,476 &middot; 66.58% &mdash; &ldquo;curly quotes&rdquo;</p>
<table><tr><th>Shape</th><th>Constraint</th></tr><tr><td>Product</td><td>Cash locked in inventory</td></tr><tr><td>Brokerage</td><td>Deal flow</td></tr></table>
\n<!--PAGE-->\n<!--SLUG:probe-two-->
<h1 data-blurb="A second probe, to prove the hub lists more than one." data-group="Probe" data-tier="ours">Probe two</h1>
<p>Second page. The hub above should show two cards under a PROBE heading.</p>
"""

LIVE_PAYLOAD = os.path.join(ROOT, "w", "lib", f"lib.{COHORT}.enc.json")


DUMMY_SRC = os.path.join(ROOT, "tools", "lib-verify-src")


def build_dummy():
    """Build a throwaway payload from a throwaway source dir.

    Never reads or writes tools/lib-src/, so it cannot disturb the real pages or
    their manifest. Returns the backup bytes of any payload it displaces.
    """
    backup = None
    if os.path.exists(LIVE_PAYLOAD):
        with open(LIVE_PAYLOAD, "rb") as f:
            backup = f.read()
    os.makedirs(DUMMY_SRC, exist_ok=True)
    pages = DUMMY.split("\n<!--PAGE-->\n")
    slugs = []
    for chunk in pages:
        slug = chunk.split("-->")[0].replace("<!--SLUG:", "").strip()
        slugs.append(slug)
        with open(os.path.join(DUMMY_SRC, slug + ".html"), "w") as f:
            f.write(chunk.split("-->", 1)[1].lstrip("\n"))
    with open(os.path.join(DUMMY_SRC, "_manifest.json"), "w") as f:
        json.dump({"pages": slugs}, f)
    subprocess.run(["node", "tools/build-lib.mjs", COHORT, PASS, "tools/lib-verify-src"],
                   cwd=ROOT, capture_output=True, text=True, check=True)
    return backup


def restore(backup):
    """Put the real payload back, remove the dummy, and delete the temp source."""
    shutil.rmtree(DUMMY_SRC, ignore_errors=True)
    if backup is None:
        if os.path.exists(LIVE_PAYLOAD):
            os.remove(LIVE_PAYLOAD)
    else:
        with open(LIVE_PAYLOAD, "wb") as f:
            f.write(backup)


def main():
    base = sys.argv[1] if len(sys.argv) > 1 else None
    httpd = None
    backup = None
    if not base:
        backup = build_dummy()   # only ever touches the local tree, never a deploy
        httpd = serve()
        base = f"http://127.0.0.1:{PORT}"
        time.sleep(0.4)
    url = base.rstrip("/") + f"/w/lib/?c={COHORT}"
    print(f"Testing {url}\n")

    errors = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        ctx = br.new_context(viewport={"width": 390, "height": 844},
                             device_scale_factor=2)  # iPhone-ish; phone is the real surface
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        pg.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}")
              if m.type == "error" else None)

        pg.goto(url, wait_until="networkidle")

        # 1. Gate is up and nothing has leaked into the DOM.
        check("gate is visible on load", pg.is_visible("#gate"))
        body = pg.inner_text("body")
        check("no plaintext before unlock", "Probe one" not in body and "curly quotes" not in body)

        # 2. Empty passphrase is handled, no throw.
        pg.click("#open")
        pg.wait_for_timeout(250)
        check("empty passphrase shows a message",
              "passphrase" in pg.inner_text("#gate-err").lower(),
              pg.inner_text("#gate-err"))

        # 3. Wrong passphrase gives a readable error and the page stays usable.
        pg.fill("#pass", "definitely-not-the-passphrase")
        pg.click("#open")
        pg.wait_for_timeout(1500)  # PBKDF2 250k iterations is deliberately slow
        msg = pg.inner_text("#gate-err")
        check("wrong passphrase shows a readable error", len(msg) > 10, msg)
        check("gate still visible after a wrong try", pg.is_visible("#gate"))

        # 4. Correct passphrase unlocks and the hub renders.
        pg.fill("#pass", PASS)
        pg.click("#open")
        pg.wait_for_selector("#shell:not([hidden])", timeout=15000)
        pg.wait_for_timeout(300)
        check("correct passphrase unlocks", not pg.is_visible("#gate"))
        hub_text = pg.inner_text("#hub")
        check("hub lists both probe pages",
              "Probe one" in hub_text and "Probe two" in hub_text)
        # Title and blurb must be on separate lines. They were spans (inline) and ran
        # together; every assertion passed and the render was wrong. Compare boxes.
        tb = pg.eval_on_selector(".card .card-t", "e=>e.getBoundingClientRect().bottom")
        db = pg.eval_on_selector(".card .card-d", "e=>e.getBoundingClientRect().top")
        check("card blurb sits below the title, not beside it", db >= tb - 1,
              f"title bottom {tb:.0f}, blurb top {db:.0f}")
        # Same class of bug as the cards: an inline-block chip lets the caption
        # prose flow on after it, so the label and the sentence run together.
        pg.goto(url + "#probe-one", wait_until="networkidle"); pg.wait_for_timeout(400)

        # 5. Routing to a real slug.
        pg.goto(url + "#probe-one", wait_until="networkidle")
        pg.wait_for_selector("#page.on", timeout=15000)
        pg.wait_for_timeout(300)
        art = pg.inner_text("#page")
        check("slug route renders the page", "Probe one" in art)
        check("unicode survived to the DOM", "₱1,241,476" in art and "66.58%" in art)
        check("sourced quotation renders", pg.locator("#page blockquote").count() == 1)
        check("ours tier marker rendered", pg.locator("p.c-ours").count() == 1)
        # A sourced quotation and our own reading MUST look different, not just be tagged.
        q = pg.eval_on_selector("#page blockquote", "e=>getComputedStyle(e).borderLeftStyle+'/'+getComputedStyle(e).borderLeftColor")
        o = pg.eval_on_selector("p.c-ours", "e=>getComputedStyle(e).borderTopStyle+'/'+getComputedStyle(e).borderTopColor")
        check("sourced and ours are visually distinct", q != o, f"{q} vs {o}")

        # 6. Reload keeps the unlock (session persistence).
        pg.reload(wait_until="networkidle")
        pg.wait_for_timeout(1800)
        check("still unlocked after reload", not pg.is_visible("#gate"))

        # 7. Unknown slug falls back to the hub instead of blanking.
        pg.goto(url + "#no-such-page", wait_until="networkidle")
        pg.wait_for_timeout(1800)
        check("unknown slug falls back to the hub",
              pg.is_visible("#hub") and len(pg.inner_text("#hub").strip()) > 40)

        # 8. No horizontal overflow on a phone — the table must scroll inside itself.
        pg.goto(url + "#probe-one", wait_until="networkidle")
        pg.wait_for_timeout(1800)
        ow = pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        check("no horizontal page overflow on a phone", ow <= 0, f"overflow {ow}px")

        os.makedirs("/tmp/libshots", exist_ok=True)
        pg.screenshot(path="/tmp/libshots/page-phone.png", full_page=True)
        pg.goto(url, wait_until="networkidle"); pg.wait_for_timeout(1500)
        pg.screenshot(path="/tmp/libshots/hub-phone.png", full_page=True)
        ctx2 = br.new_context(viewport={"width": 1440, "height": 900})
        pg2 = ctx2.new_page(); pg2.goto(url, wait_until="networkidle")
        pg2.fill("#pass", PASS); pg2.click("#open")
        pg2.wait_for_selector("#shell:not([hidden])", timeout=15000); pg2.wait_for_timeout(400)
        pg2.screenshot(path="/tmp/libshots/hub-desktop.png", full_page=True)
        pg2.goto(url + "#probe-one"); pg2.wait_for_timeout(1500)
        pg2.screenshot(path="/tmp/libshots/page-desktop.png", full_page=True)

        check("no console errors or page exceptions", not errors, "; ".join(errors[:3]))
        br.close()

    if httpd:
        httpd.shutdown()
    if not sys.argv[1:]:
        restore(backup)   # never leave a dummy payload in the working tree

    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} passed")
    print("screenshots: /tmp/libshots/")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
