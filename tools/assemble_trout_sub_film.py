#!/usr/bin/env python3
"""
Master Trout Sub Anthology Assembler (`tools/assemble_trout_sub_film.py`)

Concatenates:
  00. `/Users/gaia/2700-dark-matter-guardian/turkey-sub/films/portholes-scion-intro.mp4` (48s Setup A Intro)
  01..55. `/Users/gaia/2700-dark-matter-guardian/turkey-sub/films/portholes/p01.mp4` .. `p55.mp4`

into one seamless screening-room feature film:
  `/Users/gaia/2700-dark-matter-guardian/turkey-sub/films/trout-sub-55-portals.mp4`

Stream normalization guarantees:
  - Video: 1280x720, SAR 1:1, 24fps CFR, H.264 High (`yuv420p`, `-video_track_timescale 12288`)
  - Audio: 44100 Hz, 2-channel stereo, AAC LC (`160k`), synthesized clean fallback if any clip lacks audio,
    exact clip-duration alignment so zero A/V drift accumulates across all 56 chapters.
  - Native MP4 `FFMETADATA1` chapter markers for the Activity Intro + all 55 Porthole stations!
"""
import argparse
import concurrent.futures
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

DEFAULT_ROOT = Path("/Users/gaia/2700-dark-matter-guardian/turkey-sub")

# Fallback station titles if 55-portholes.html SEEDS cannot be parsed
PORTAL_FALLBACK_TITLES = {i: f"Porthole #{i:02d}" for i in range(1, 56)}


def load_portal_titles(root: Path) -> dict:
    """Extract exact `#NN · Station — Clue` chapter titles from `55-portholes.html`."""
    titles = dict(PORTAL_FALLBACK_TITLES)
    html_path = root / "55-portholes.html"
    if not html_path.exists():
        return titles
    try:
        txt = html_path.read_text(encoding="utf-8", errors="ignore")
        # Match lines like: ["#01 · Bow", "Giant Size 11 Rubber Boot blocking beam", ...
        pattern = re.compile(r'\[\s*"(#(\d{2})\s*·\s*[^"]+)"\s*,\s*"([^"]+)"')
        for m in pattern.finditer(txt):
            station, num_s, clue = m.group(1), m.group(2), m.group(3)
            idx = int(num_s)
            if 1 <= idx <= 55:
                titles[idx] = f"{station} — {clue}"
    except Exception:
        pass
    return titles


def probe_clip(path: Path) -> dict:
    """Return duration (float seconds) and whether an audio stream is present."""
    cmd = [
        "ffprobe", "-v", "error",
        "-print_format", "json",
        "-show_format", "-show_streams",
        str(path)
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    info = json.loads(res.stdout)
    streams = info.get("streams", [])
    has_video = any(s.get("codec_type") == "video" for s in streams)
    has_audio = any(s.get("codec_type") == "audio" for s in streams)
    if not has_video:
        raise RuntimeError(f"No video stream in {path}")

    dur = float(info.get("format", {}).get("duration", 0.0) or 0.0)
    for s in streams:
        if s.get("codec_type") == "video" and s.get("duration"):
            dur = float(s["duration"])
            break
    if dur <= 0.05:
        raise RuntimeError(f"Invalid duration ({dur}s) in {path}")
    return {"duration": dur, "has_audio": has_audio}


def normalize_one(job: tuple) -> dict:
    """Transcode one clip to uniform 1280x720 24fps H.264 + 44.1kHz stereo AAC."""
    idx, label, src_path, dst_path = job
    meta = probe_clip(src_path)
    dur = meta["duration"]

    vf = (
        "scale=1280:720:force_original_aspect_ratio=decrease,"
        "pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=#132427,"
        "setsar=1,fps=24,format=yuv420p"
    )

    if meta["has_audio"]:
        af = f"aresample=44100:async=1,aformat=sample_rates=44100:channel_layouts=stereo,apad,atrim=0:{dur:.6f}"
        cmd = [
            "ffmpeg", "-y", "-loglevel", "error",
            "-i", str(src_path),
            "-vf", vf,
            "-af", af,
            "-t", f"{dur:.6f}",
            "-c:v", "libx264", "-preset", "fast", "-crf", "24",
            "-profile:v", "high", "-level", "4.0",
            "-pix_fmt", "yuv420p",
            "-video_track_timescale", "12288",
            "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2",
            str(dst_path)
        ]
    else:
        cmd = [
            "ffmpeg", "-y", "-loglevel", "error",
            "-i", str(src_path),
            "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
            "-vf", vf,
            "-t", f"{dur:.6f}",
            "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "libx264", "-preset", "fast", "-crf", "24",
            "-profile:v", "high", "-level", "4.0",
            "-pix_fmt", "yuv420p",
            "-video_track_timescale", "12288",
            "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2",
            str(dst_path)
        ]

    subprocess.run(cmd, check=True)
    norm_meta = probe_clip(dst_path)
    return {
        "idx": idx,
        "label": label,
        "path": dst_path,
        "duration": norm_meta["duration"],
    }


def escape_ffmeta(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace("=", "\\=")
        .replace(";", "\\;")
        .replace("#", "\\#")
        .replace("\n", " ")
    )


def fmt_mmss(sec: float) -> str:
    m = int(sec // 60)
    s = sec - m * 60
    return f"{m:02d}:{s:05.2f}"


def main() -> int:
    parser = argparse.ArgumentParser(description="Assemble Trout Sub Intro + 55 Portals Master Feature Film.")
    parser.add_argument("--root", type=Path, default=DEFAULT_ROOT, help="Path to turkey-sub workspace")
    parser.add_argument("--out", type=Path, default=None, help="Output MP4 path (default: films/trout-sub-55-portals.mp4)")
    parser.add_argument("--workers", type=int, default=6, help="Parallel ffmpeg normalization workers")
    parser.add_argument("--allow-partial", action="store_true", help="Assemble available clips even if some pNN.mp4 are missing")
    args = parser.parse_args()

    root = args.root.resolve()
    intro_mp4 = root / "films" / "portholes-scion-intro.mp4"
    portals_dir = root / "films" / "portholes"
    out_mp4 = (args.out or (root / "films" / "trout-sub-55-portals.mp4")).resolve()
    out_mp4.parent.mkdir(parents=True, exist_ok=True)

    titles = load_portal_titles(root)

    sources = []
    missing = []

    if intro_mp4.exists():
        sources.append((0, "00 · Activity Introduction — Turkey Sub SCION Setup A", intro_mp4))
    else:
        missing.append(str(intro_mp4))

    for i in range(1, 56):
        p_mp4 = portals_dir / f"p{i:02d}.mp4"
        if p_mp4.exists():
            sources.append((i, titles[i], p_mp4))
        else:
            missing.append(str(p_mp4))

    if missing and not args.allow_partial:
        print(f"ERROR: Missing {len(missing)} required film(s):", file=sys.stderr)
        for m in missing[:10]:
            print(f"  - {m}", file=sys.stderr)
        if len(missing) > 10:
            print(f"  ... and {len(missing) - 10} more.", file=sys.stderr)
        return 1

    if not sources:
        print("ERROR: No input clips found to assemble.", file=sys.stderr)
        return 1

    print(f"Normalizing {len(sources)} clips to 1280x720 @ 24fps H.264 + 44.1kHz stereo AAC...")

    with tempfile.TemporaryDirectory(prefix="trout_sub_assemble_") as tmp:
        tmp_dir = Path(tmp)
        jobs = [
            (idx, label, src, tmp_dir / f"seg_{pos:03d}.mp4")
            for pos, (idx, label, src) in enumerate(sources)
        ]

        results_by_pos = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
            fut_map = {pool.submit(normalize_one, job): pos for pos, job in enumerate(jobs)}
            for fut in concurrent.futures.as_completed(fut_map):
                pos = fut_map[fut]
                res = fut.result()
                results_by_pos[pos] = res

        ordered = [results_by_pos[pos] for pos in range(len(jobs))]

        # Write concat list + FFMETADATA1 chapter markers
        concat_txt = tmp_dir / "concat_list.txt"
        meta_txt = tmp_dir / "chapters.ffmeta"

        concat_lines = []
        meta_lines = [
            ";FFMETADATA1",
            "title=Trout Sub · 55 Portholes Double Duck/Rabbit Anthology",
            "artist=Trout Town · PAELEO SCION Studio",
            ""
        ]

        cursor_ms = 0
        print("\nChapter Timestamps:")
        for item in ordered:
            seg_path_escaped = str(item["path"]).replace("'", "'\\''")
            concat_lines.append(f"file '{seg_path_escaped}'")
            dur_ms = max(1, int(round(item["duration"] * 1000.0)))
            start_ms = cursor_ms
            end_ms = cursor_ms + dur_ms
            cursor_ms = end_ms

            meta_lines.extend([
                "[CHAPTER]",
                "TIMEBASE=1/1000",
                f"START={start_ms}",
                f"END={end_ms}",
                f"title={escape_ffmeta(item['label'])}",
                ""
            ])
            print(f"  [{fmt_mmss(start_ms / 1000.0)} -> {fmt_mmss(end_ms / 1000.0)}] {item['label']}")

        concat_txt.write_text("\n".join(concat_lines) + "\n", encoding="utf-8")
        meta_txt.write_text("\n".join(meta_lines) + "\n", encoding="utf-8")

        # Lossless stream-copy concat of normalized uniform segments + chapter metadata + faststart
        tmp_out = tmp_dir / "assembled_master.mp4"
        concat_cmd = [
            "ffmpeg", "-y", "-loglevel", "error",
            "-f", "concat", "-safe", "0", "-i", str(concat_txt),
            "-i", str(meta_txt),
            "-map_metadata", "1",
            "-map_chapters", "1",
            "-c", "copy",
            "-movflags", "+faststart",
            str(tmp_out)
        ]
        subprocess.run(concat_cmd, check=True)
        os.replace(tmp_out, out_mp4)

    final_probe = probe_clip(out_mp4)
    size_mb = out_mp4.stat().st_size / (1024 * 1024)
    print(
        f"\nSUCCESS: Wrote {out_mp4}\n"
        f"  Clips: {len(ordered)} | Duration: {final_probe['duration']:.2f}s "
        f"({fmt_mmss(final_probe['duration'])}) | Size: {size_mb:.2f} MB"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
