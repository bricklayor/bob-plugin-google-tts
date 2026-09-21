#!/usr/bin/env python3
import hashlib
import json
import os
import sys
import zipfile
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT_DIR / "src"
INFO_FILE = SRC_DIR / "info.json"
APPCAST_FILE = ROOT_DIR / "appcast.json"
OUTPUT_PLUGIN = ROOT_DIR / "google-tts.bobplugin"


def calculate_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def build_plugin():
    with open(INFO_FILE, "r", encoding="utf-8") as f:
        info = json.load(f)

    version = info["version"]
    identifier = info["identifier"]

    # Package src/ into google-tts.bobplugin (zip format)
    if OUTPUT_PLUGIN.exists():
        OUTPUT_PLUGIN.unlink()

    with zipfile.ZipFile(OUTPUT_PLUGIN, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_name in ["info.json", "main.js", "icon.png"]:
            file_path = SRC_DIR / file_name
            if file_path.exists():
                zf.write(file_path, arcname=file_name)
            else:
                print(f"Warning: {file_name} not found in src/")

    sha256_hash = calculate_sha256(OUTPUT_PLUGIN)
    print(f"Built plugin: {OUTPUT_PLUGIN.name} (v{version})")
    print(f"SHA256: {sha256_hash}")

    desc = sys.argv[1] if len(sys.argv) > 1 else "首个版本发布：基于 Google Cloud TTS API 的 Chirp 3 高清拟真语音 Bob 插件。"

    version_item = {
        "version": version,
        "desc": desc,
        "sha256": sha256_hash,
        "url": f"https://github.com/bricklayor/bob-plugin-google-tts/releases/download/v{version}/google-tts.bobplugin",
        "minBobVersion": info.get("minBobVersion", "1.8.0")
    }

    if APPCAST_FILE.exists():
        with open(APPCAST_FILE, "r", encoding="utf-8") as f:
            appcast = json.load(f)
    else:
        appcast = {"versions": []}

    # Filter out existing entries with the same version if re-building
    appcast["versions"] = [v for v in appcast.get("versions", []) if v["version"] != version]
    appcast["versions"].insert(0, version_item)

    with open(APPCAST_FILE, "w", encoding="utf-8") as f:
        json.dump(appcast, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Updated {APPCAST_FILE.name}")


if __name__ == "__main__":
    build_plugin()
