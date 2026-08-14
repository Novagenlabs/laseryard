#!/usr/bin/env python3
"""
Build a self-contained Laser Yard invoice from template.html.

template.html carries a __FACES__ placeholder where the @font-face block goes.
The font binaries are not bundled, so this pulls them from npm and inlines
them as base64 woff2. Fontsource ships no variable build, hence one @font-face
per static weight rather than a font-weight range.

Usage:
    python3 build-invoice.py            # writes invoice.html using the sample values
    python3 build-invoice.py --faces    # writes faces.css only

Then:
    chromium --headless --no-sandbox --print-to-pdf=out.pdf \
             --no-pdf-header-footer invoice.html
"""

import base64
import glob
import os
import subprocess
import sys
import tarfile
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))

MANROPE_WEIGHTS = [400, 500, 600, 700, 800]
PLAYFAIR = [("800", "normal"), ("500", "italic")]


def fetch_fonts(workdir):
    """npm pack the two fontsource packages and unpack them."""
    subprocess.run(
        ["npm", "pack", "@fontsource/manrope", "@fontsource/playfair-display"],
        cwd=workdir, check=True, capture_output=True,
    )
    for tgz in glob.glob(os.path.join(workdir, "*.tgz")):
        with tarfile.open(tgz) as t:
            t.extractall(os.path.join(workdir, os.path.basename(tgz)[:-4]))
    def files_dir(prefix):
        hits = glob.glob(os.path.join(workdir, prefix + "*", "package", "files"))
        if not hits:
            raise SystemExit("could not find unpacked files for " + prefix)
        return hits[0]
    return files_dir("fontsource-manrope"), files_dir("fontsource-playfair-display")


def b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def build_faces(manrope_dir, playfair_dir):
    faces = []
    for w in MANROPE_WEIGHTS:
        p = os.path.join(manrope_dir, "manrope-latin-%d-normal.woff2" % w)
        faces.append(
            "  @font-face { font-family:'Manrope'; "
            "src:url(data:font/woff2;base64,%s) format('woff2'); "
            "font-weight:%d; font-style:normal; }" % (b64(p), w)
        )
    for weight, style in PLAYFAIR:
        p = os.path.join(
            playfair_dir, "playfair-display-latin-%s-%s.woff2" % (weight, style)
        )
        faces.append(
            "  @font-face { font-family:'Playfair Display'; "
            "src:url(data:font/woff2;base64,%s) format('woff2'); "
            "font-weight:%s; font-style:%s; }" % (b64(p), weight, style)
        )
    return "\n".join(faces)


# Sample invoice values. Replace with the real order before rendering.
VALUES = {
    "{{INVOICE_NO}}":    "LY-2026-11043",
    "{{ISSUE_DATE}}":    "1 September 2026",
    "{{PAYMENT_DATE}}":  "1 September 2026",
    "{{CUSTOMER_NAME}}": "Customer Name",
    "{{CUSTOMER_LINES}}": "customer@example.com<br>Street<br>City, Region 00000<br>Country",
    "{{ITEM_ROWS}}": (
        '<tr><td><div class="item-name">Premium Metal Business Cards, 0.4mm</div>'
        '<div class="item-desc">Laser engraved premium metal cards, 0.4mm gauge, '
        'shipping included.</div></td>'
        '<td class="num">30</td><td class="num"><strong>$250.00</strong></td></tr>'
    ),
    # Whop orders: the customer-paid difference goes here. See README.
    "{{EXTRA_ROWS}}": (
        '<div class="row"><span class="tk">Tax and processing</span>'
        '<span class="tv">$22.19</span></div>'
    ),
    "{{SUBTOTAL}}":     "$250.00",
    "{{TOTAL}}":        "$272.19",
    "{{AMOUNT_PAID}}":  "$272.19",
    "{{BALANCE}}":      "$0.00",
    "{{PAYMENT_NOTE}}": "Paid in full by card. No further action required.",
}


def main():
    faces_only = "--faces" in sys.argv
    with tempfile.TemporaryDirectory() as workdir:
        manrope_dir, playfair_dir = fetch_fonts(workdir)
        faces = build_faces(manrope_dir, playfair_dir)

    if faces_only:
        out = os.path.join(HERE, "faces.css")
        with open(out, "w") as f:
            f.write(faces)
        print("wrote", out)
        return

    with open(os.path.join(HERE, "template.html")) as f:
        html = f.read()
    html = html.replace("__FACES__", faces)
    for token, value in VALUES.items():
        html = html.replace(token, value)

    left = [line for line in html.split("\n") if "{{" in line]
    if left:
        raise SystemExit("unfilled tokens remain:\n" + "\n".join(left))

    out = os.path.join(HERE, "invoice.html")
    with open(out, "w") as f:
        f.write(html)
    print("wrote", out, "(%d bytes)" % len(html))


if __name__ == "__main__":
    main()
