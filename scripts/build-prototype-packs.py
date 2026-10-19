"""Build the thirty ready-made packs from the original Prototype Chamber assets."""
import json
import sys
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'prototype-chamber'

def build(destination):
    destination = Path(destination)
    destination.mkdir(parents=True, exist_ok=True)
    recipes = json.loads((ROOT / 'scripts/prototype-pack-recipes.json').read_text())
    for recipe in recipes:
        with ZipFile(destination / recipe['name'], 'w', compression=ZIP_DEFLATED, compresslevel=6) as archive:
            for entry in recipe['entries']:
                info = ZipInfo(entry['name'], tuple(entry['date_time']))
                info.compress_type = entry['compress_type']
                info.external_attr = entry['external_attr']
                info.create_system = entry['create_system']
                if 'source' in entry:
                    data = (SOURCE / entry['source']).read_bytes()
                else:
                    data = entry['text'].encode('utf-8')
                archive.writestr(info, data)
    print(f'Built {len(recipes)} Prototype Chamber packs from the original files.')

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else SOURCE / 'downloads')
