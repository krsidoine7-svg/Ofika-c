"""Rendu de la vidéo : 630 images (21 s × 30 i/s) envoyées à ffmpeg, puis mixage audio.
L'image 0 est remplacée par l'affiche (POSTER_T) pour servir de miniature partout."""
import subprocess, pathlib, time
from playwright.sync_api import sync_playwright

FPS, DUR, POSTER_T = 30, 21.0, 9.3
work = pathlib.Path(__file__).resolve().parent
out_dir = work.parent
silent = work / "video_silent.mp4"

ff = subprocess.Popen([
    "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", str(silent)], stdin=subprocess.PIPE)

t0 = time.time()
with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")
    page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
    page.goto((work / "index.html").as_uri())
    page.evaluate("document.fonts.ready")
    page.wait_for_function("Array.from(document.images).every(i => i.complete)")
    page.wait_for_timeout(600)

    # Affiche
    page.evaluate(f"render({POSTER_T})")
    page.screenshot(path=str(out_dir / "brag.jpg"), type="jpeg", quality=92)

    total = int(FPS * DUR)
    for i in range(total):
        t = POSTER_T if i == 0 else i / FPS
        page.evaluate(f"render({t})")
        ff.stdin.write(page.screenshot(type="png"))
        if i % 90 == 0:
            print(f"image {i}/{total}  ({time.time() - t0:.0f}s)", flush=True)
    browser.close()

ff.stdin.close()
ff.wait()

# Mixage : vidéo + musique, volume normalisé pour les réseaux sociaux (-14 LUFS)
subprocess.run([
    "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
    "-i", str(silent), "-i", str(work / "music.wav"),
    "-map", "0:v", "-map", "1:a", "-c:v", "copy",
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
    "-shortest", "-movflags", "+faststart", str(out_dir / "brag.mp4")], check=True)
print(f"terminé en {time.time() - t0:.0f}s ->", out_dir / "brag.mp4")
