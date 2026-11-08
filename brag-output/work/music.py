"""Bande-son Ofika : 21 s, 120 BPM, Do – Sol – La m – Fa. Musique et effets sur la même grille."""
import numpy as np
from scipy.signal import butter, sosfilt
import wave, pathlib

SR = 48000
DUR = 21.0
BPM = 120
BEAT = 60 / BPM            # 0,5 s
N = int(SR * DUR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(11)

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)

L = np.zeros(N); R = np.zeros(N)
def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * gain * l
    R[i:i + len(sig)] += sig * gain * r

def env(n, a, d, s=0.0, r=0.0, hold=None):
    """Enveloppe ADSR simple (durées en secondes)."""
    tt = np.arange(n) / SR
    e = np.where(tt < a, tt / max(a, 1e-4), 1.0)
    e = np.where(tt >= a, s + (1 - s) * np.exp(-(tt - a) / max(d, 1e-4)), e)
    if hold is not None:
        rel = tt > hold
        e[rel] *= np.exp(-(tt[rel] - hold) / max(r, 1e-4))
    return e

# Accords (une mesure = 2 s) : C G Am F C G Am F … fin sur Do
CHORDS = {'C': [48, 52, 55, 60, 64], 'G': [43, 50, 55, 59, 62], 'Am': [45, 52, 57, 60, 64], 'F': [41, 48, 53, 57, 60]}
ROOT = {'C': 36, 'G': 31, 'Am': 33, 'F': 29}
prog = ['C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'C']   # 10 mesures = 20 s (+1 s de résonance)

# ---------- Pad (toute la durée) ----------
pad = np.zeros(N)
for b, ch in enumerate(prog):
    start, length = b * 2.0, 2.0 + (1.2 if b == len(prog) - 1 else 0.25)
    n = int(length * SR); tt = np.arange(n) / SR
    voice = np.zeros(n)
    for m in CHORDS[ch][1:]:
        for det in (-0.08, 0.0, 0.08):
            f = midi(m + det)
            voice += 2 * (tt * f - np.floor(0.5 + tt * f))   # dent de scie
    voice = lp(voice, 1800) * env(n, 0.25, 9.0, 1.0, 0.35, hold=length - 0.3)
    i = int(start * SR); pad[i:i + n] += voice[: N - i]
pad = lp(pad, 2400) / 14

# ---------- Arpège pluck ----------
def pluck(f, dur=0.45, bright=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * tt) + 0.35 * bright * np.sin(4 * np.pi * f * tt) + 0.12 * bright * np.sin(6 * np.pi * f * tt)
    return s * np.exp(-tt / (dur / 4)) * np.minimum(1, tt / 0.003)

for b, ch in enumerate(prog[:9]):
    notes = [CHORDS[ch][2] + 12, CHORDS[ch][3] + 12, CHORDS[ch][4] + 12, CHORDS[ch][3] + 12]
    for k in range(8):                              # croches
        tk = b * 2.0 + k * 0.25
        if tk >= 17.5: break
        g = 0.10 if tk < 3.0 else 0.075
        add(pluck(midi(notes[k % 4]), 0.4, 0.8 if tk < 3 else 1.0), tk, g, pan=(-0.35 if k % 2 else 0.35))

# ---------- Batterie (à partir de 3,0 s, jusqu'à 19,0 s) ----------
def kick():
    n = int(0.42 * SR); tt = np.arange(n) / SR
    f = 46 + 90 * np.exp(-tt / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(1.6 * np.sin(ph) * np.exp(-tt / 0.16))
def clap():
    n = int(0.25 * SR); tt = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 900, 3800) * np.exp(-tt / 0.07)
    return x / np.max(np.abs(x))
def hat(open_=False):
    n = int((0.16 if open_ else 0.05) * SR); tt = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 7500) * np.exp(-tt / (0.05 if open_ else 0.014))
    return x / np.max(np.abs(x))

K, C, H, HO = kick(), clap(), hat(), hat(True)
duck = np.ones(N)                                 # « sidechain » : la basse et le pad s'effacent sous le kick
DRUM_END = 19.0
beat_t = np.arange(0, DUR, BEAT)
for tb in beat_t:
    if 3.0 <= tb < DRUM_END:
        add(K, tb, 0.85)
        i = int(tb * SR); n = int(0.22 * SR)
        duck[i:i + n] = np.minimum(duck[i:i + n], 1 - 0.55 * np.exp(-np.arange(min(n, N - i)) / SR / 0.07))
        if round(tb / BEAT) % 2 == 1: add(C, tb, 0.30, pan=0.05)
        add(H, tb + 0.25, 0.10, pan=0.3)
        if round(tb / BEAT) % 4 == 3: add(HO, tb + 0.25, 0.06, pan=-0.3)
# petits roulements de caisse claire avant les grosses coupes
for tc in (10.0, 17.5):
    for k in range(4):
        add(C, tc - 0.5 + k * 0.125, 0.10 + 0.04 * k, pan=-0.1)

# ---------- Basse (croches, à partir de 3,0 s) ----------
bass = np.zeros(N)
for b, ch in enumerate(prog):
    for k in range(8):
        tk = b * 2.0 + k * 0.25
        if tk < 3.0 or tk >= DRUM_END: continue
        n = int(0.24 * SR); tt = np.arange(n) / SR
        f = midi(ROOT[ch] + (12 if k % 4 == 2 else 0))
        s = np.tanh(1.8 * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt))) * env(n, 0.004, 0.09, 0.35, 0.03, hold=0.2)
        i = int(tk * SR); bass[i:i + n] += s[: N - i]
bass = lp(bass, 700) * 0.30

# Accord final de Do grave qui résonne (19,0 → 21,0)
n = int(2.0 * SR); tt = np.arange(n) / SR
final = sum(np.sin(2 * np.pi * midi(m) * tt) for m in (36, 48, 55, 64)) * np.exp(-tt / 0.9)
add(lp(final, 900) * 0.12, 19.0)
add(K, 19.0, 0.7)

L += (pad + bass) * duck; R += (pad + bass) * duck

# ---------- Effets sonores (même tonalité, mixés sous la musique) ----------
def whoosh(dur=0.45):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = rng.standard_normal(n)
    e = (tt / dur) ** 2.2 * np.exp(-np.maximum(0, tt - dur * 0.92) / 0.02)
    lo = bp(x, 400, 2200) * e; hi = bp(x, 2000, 7000) * e * (tt / dur)
    y = lo + 0.6 * hi
    return y / np.max(np.abs(y))
def swish(dur=0.35, lo=600, hi=5000, rev=False):
    """Souffle court : monte puis s'éteint (rev=True : attaque forte puis décroissance)."""
    n = int(dur * SR); tt = np.arange(n) / SR
    x = bp(rng.standard_normal(n), lo, hi)
    e = np.sin(np.pi * tt / dur) ** 2 if not rev else np.exp(-tt / (dur / 3.5)) * np.minimum(1, tt / 0.01)
    y = x * e
    return y / np.max(np.abs(y))
def thump(f0=110, dur=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = 42 + f0 * np.exp(-tt / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.14)

# Whips de caméra : montée qui accélère jusqu'à la coupe, puis retombée après la coupe
for tc in (3.0, 10.0, 14.5, 17.5):
    add(whoosh(0.32), tc - 0.32, 0.17, pan=-0.25)
    add(swish(0.55, 500, 4200, rev=True), tc, 0.10, pan=0.25)
# Travelling doux (S2 → S3, 6,0 s)
add(swish(0.65, 300, 2500), 6.0, 0.08, pan=-0.3)
# Carte qui glisse + téléphone qui monte (3,05 s)
add(swish(0.45, 800, 6000, rev=True), 3.05, 0.07, pan=-0.6)
add(swish(0.5, 300, 1800, rev=True), 3.1, 0.06, pan=0.2)
# Coups de zoom : impact sourd au contact NFC (4,5 s) et au tap (8,0 s)
add(thump(120), 4.5, 0.32); add(thump(100, 0.4), 8.0, 0.22)
add(swish(0.25, 1200, 6000), 7.75, 0.05)
# Carrousel : arrivée rapide qui freine (10,15 s) puis ré-accélération vers la sortie (13,7 s)
add(swish(0.9, 500, 5000, rev=True), 10.1, 0.08, pan=0.4)
add(whoosh(0.75), 13.75, 0.10, pan=-0.4)
# Carte et QR code qui entrent (14,75 / 14,85 s)
add(swish(0.4, 700, 5500, rev=True), 14.75, 0.06, pan=-0.6)
add(swish(0.4, 700, 5500, rev=True), 14.85, 0.06, pan=0.6)
# Montée avant le logo (16,5 → 17,5 s)
n_r = int(1.0 * SR); tt_r = np.arange(n_r) / SR
riser = bp(rng.standard_normal(n_r), 400, 6000) * (tt_r / 1.0) ** 3
add(riser / np.max(np.abs(riser)), 16.5, 0.07)

def chime(notes, gap=0.07):
    out = np.zeros(int((0.9 + gap * len(notes)) * SR))
    for j, m in enumerate(notes):
        p = pluck(midi(m), 0.8, 0.5); i = int(j * gap * SR); out[i:i + len(p)] += p
    return out
def tap():
    n = int(0.06 * SR); tt = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 1500, 5000) * np.exp(-tt / 0.008) + 0.6 * np.sin(2 * np.pi * 180 * tt) * np.exp(-tt / 0.02)
    return x / np.max(np.abs(x))

# 1,7 s : carte froissée (craquements feutrés)
for k in range(9):
    tk = 1.70 + k * 0.05 + rng.uniform(0, 0.02)
    n = int(0.03 * SR); c = bp(rng.standard_normal(n), 1800, 6000) * np.exp(-np.arange(n) / SR / 0.006)
    add(c, tk, 0.05, pan=-0.4)
# 4,5 s : contact NFC → tap + carillon Do majeur
add(tap(), 4.5, 0.16); add(chime([76, 79, 84]), 4.5, 0.11, pan=0.25)
# 8,0 s : doigt sur « Ajouter aux contacts » ; 8,125 s : confirmation
add(tap(), 8.0, 0.14); add(chime([79, 84, 88], 0.06), 8.125, 0.11, pan=0.25)
# 10,25 s → : arrivée des 8 écrans (croches)
scale = [72, 74, 76, 79, 81, 84, 86, 88]
for i in range(8):
    add(pluck(midi(scale[i]), 0.3, 0.6), 10.25 + i * 0.25, 0.05, pan=-0.5 + i / 7)
# 15,25 s : ondes NFC (trois petites notes douces)
for k, m in enumerate((84, 88, 91)):
    add(pluck(midi(m), 0.5, 0.3), 15.25 + k * 0.25, 0.035, pan=-0.4)
# 17,5 s : impact du logo (sub + souffle)
n = int(1.4 * SR); tt = np.arange(n) / SR
boom = np.sin(2 * np.pi * (40 + 30 * np.exp(-tt / 0.08)) * tt) * np.exp(-tt / 0.5)
add(boom, 17.5, 0.35)
add(lp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.45), 17.5, 0.04)

# ---------- Mixage final ----------
fade = np.ones(N); fi = int(0.06 * SR); fade[:fi] = np.linspace(0, 1, fi)
fo = int(0.6 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
mixL, mixR = L * fade, R * fade
peak = max(np.max(np.abs(mixL)), np.max(np.abs(mixR)))
mixL, mixR = np.tanh(1.15 * mixL / peak) , np.tanh(1.15 * mixR / peak)
g = 0.89 / max(np.max(np.abs(mixL)), np.max(np.abs(mixR)))
stereo = np.stack([mixL * g, mixR * g], axis=1)

out = pathlib.Path(__file__).resolve().parent / "music.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print("ok", out, f"{DUR}s")
