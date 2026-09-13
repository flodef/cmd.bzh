#!/usr/bin/env python3
"""
Merge plusieurs exports CSV Umami en un seul fichier, en dédupliquant
les events par event_id. Permet de conserver l'historique au-delà de
la fenêtre de 12 mois d'Umami Cloud.

Usage:
    python3 umami-merge.py <output.csv> <input1.csv> [input2.csv ...]

Exemple:
    # Premier export (ancien)
    python3 umami-merge.py data/merged.csv ~/Downloads/old/website_event.csv

    # Export suivant (nouveau) — merge avec l'existant
    python3 umami-merge.py data/merged.csv data/merged.csv ~/Downloads/new/website_event.csv
"""

import csv
import sys
from pathlib import Path


def merge_csvs(output_path, input_paths):
    seen_ids = set()
    header = None
    all_rows = []
    deduped = 0

    # If output already exists, load its rows first (so re-merging works)
    if Path(output_path).exists():
        with open(output_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            header = reader.fieldnames
            for row in reader:
                eid = row.get('event_id', '')
                if eid and eid in seen_ids:
                    deduped += 1
                    continue
                if eid:
                    seen_ids.add(eid)
                all_rows.append(row)
        print(f'Loaded {len(all_rows)} existing rows from {output_path}')

    # Read all input files (skip if same as output — already loaded)
    for input_path in input_paths:
        if Path(input_path).resolve() == Path(output_path).resolve():
            continue
        if not Path(input_path).exists():
            print(f'Warning: {input_path} not found, skipping')
            continue

        with open(input_path, newline='', encoding='utf-8') as in_f:
            reader = csv.DictReader(in_f)
            if header is None:
                header = reader.fieldnames

            count = 0
            for row in reader:
                eid = row.get('event_id', '')
                if eid and eid in seen_ids:
                    deduped += 1
                    continue
                if eid:
                    seen_ids.add(eid)
                all_rows.append(row)
                count += 1
            print(f'  Added {count} rows from {input_path}')

    # Write merged output
    with open(output_path, 'w', newline='', encoding='utf-8') as out_f:
        writer = csv.DictWriter(out_f, fieldnames=header)
        writer.writeheader()
        for row in all_rows:
            clean_row = {field: row.get(field, '') for field in header}
            writer.writerow(clean_row)

    print(f'\nMerge complete: {output_path}')
    print(f'  Total rows: {len(all_rows)}')
    print(f'  Duplicates skipped: {deduped}')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(f'Usage: {sys.argv[0]} <output.csv> <input1.csv> [input2.csv ...]')
        print(f'\nExample:')
        print(f'  # Initial merge')
        print(f'  python3 {sys.argv[0]} data/merged.csv ~/Downloads/export1/website_event.csv')
        print(f'  # Add new export')
        print(f'  python3 {sys.argv[0]} data/merged.csv data/merged.csv ~/Downloads/export2/website_event.csv')
        sys.exit(1)
    merge_csvs(sys.argv[1], sys.argv[2:])
