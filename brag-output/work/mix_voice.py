"""Mixe la voix off sur la vidéo : chaque phrase est placée à son moment, la musique s'efface sous la voix.

Usage :
  python mix_voice.py temoin                   -> voix témoin (voix/temoin_1..6.wav)  -> brag-voix-temoin.mp4
  python mix_voice.py finale                   -> vraie voix découpée (voix/finale_1..6.wav) -> brag.mp4
"""
import subprocess, sys, pathlib
from voice_lines import LINES

mode = sys.argv[1] if len(sys.argv) > 1 else "temoin"
work = pathlib.Path(__file__).resolve().parent
out = work.parent / ("brag-voix-temoin.mp4" if mode == "temoin" else "brag.mp4")
prefix = "temoin" if mode == "temoin" else "finale"

inputs, chains, labels = [], [], []
for i, line in enumerate(LINES, 1):
    start = line[0]
    inputs += ["-i", str(work / "voix" / f"{prefix}_{i}.wav")]
    ms = int(start * 1000)
    # voix : coupe des basses, présence, compression douce, puis placement dans le temps
    chains.append(f"[{i + 1}:a]aresample=48000,aformat=channel_layouts=mono,highpass=f=90,"
                  f"equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120,"
                  f"adelay={ms}|{ms},apad[v{i}]")
    labels.append(f"[v{i}]")
n = len(LINES)
graph = ";".join(chains) + ";" + "".join(labels) + f"amix=inputs={n}:normalize=0:duration=longest,volume=1.6,atrim=0:21,asplit=2[voice][key];" \
    "[1:a]aresample=48000[mus];" \
    "[mus][key]sidechaincompress=threshold=0.03:ratio=6:attack=25:release=350:makeup=1[ducked];" \
    "[ducked][voice]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=9[aout]"

cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
       "-i", str(work / "video_silent.mp4"), "-i", str(work / "music.wav"), *inputs,
       "-filter_complex", graph, "-map", "0:v", "-map", "[aout]",
       "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(out)]
subprocess.run(cmd, check=True)
print("ok ->", out)
