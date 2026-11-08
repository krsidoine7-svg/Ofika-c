"""Captures de contrôle : une image par instant passé en argument (secondes)."""
import sys, pathlib
from playwright.sync_api import sync_playwright

work = pathlib.Path(__file__).resolve().parent
out = work / "stills"
out.mkdir(exist_ok=True)
times = [float(x) for x in sys.argv[1:]] or [1.2, 2.5, 4.6, 5.5, 7.0, 8.3, 9.5, 11.5, 13.3, 16.0, 19.5]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")  # Google Chrome déjà installé
    page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
    page.goto((work / "index.html").as_uri())
    page.evaluate("document.fonts.ready")
    page.wait_for_function("Array.from(document.images).every(i => i.complete)")
    page.wait_for_timeout(500)
    for t in times:
        page.evaluate(f"render({t})")
        page.screenshot(path=str(out / f"t{t:05.2f}.png"))
        print("ok", t)
    browser.close()
