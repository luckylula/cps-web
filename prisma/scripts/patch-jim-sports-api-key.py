#!/usr/bin/env python3
"""Actualiza ClientAuth Jim Sports y respeta límite 1 req/s."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OLD_KEY = "61b4bac3-4afb-401e-b40a-f242271acd83"
NEW_KEY = "13658d28-28f7-493b-bb16-16307fe31398"

FILES = [
    ROOT / "files claude" / "Jim_Sports_v4_FINAL.json",
    ROOT / "files claude" / "Jim_Sports_v4_SIMPLE.json",
    ROOT / "files claude" / "Jim_Sports_v4_ENCODING_FIXED.json",
    ROOT / "files claude" / "Jim_Sports_v4_ENCODING_FIXED_v2.json",
    ROOT / "files claude" / "Sync_Jim_Sports_CSV_v3_CON_PRECIOS.json",
]

for path in FILES:
    if not path.exists():
        print("SKIP (no existe):", path.name)
        continue
    text = path.read_text(encoding="utf-8")
    if OLD_KEY not in text:
        if NEW_KEY in text:
            print("OK (ya actualizado):", path.name)
        else:
            print("WARN (sin key antigua ni nueva):", path.name)
        continue
    text = text.replace(OLD_KEY, NEW_KEY)
    text = text.replace('"batchInterval": 100', '"batchInterval": 1100')
    path.write_text(text, encoding="utf-8")
    print("Patched:", path.name)

print("Done. ClientAuth -> key real Jim Sports; batchInterval 100 -> 1100 ms")
