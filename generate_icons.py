#!/usr/bin/env python3
"""
Generate placeholder PNG icons for Enigma Alpha Barber Studio.
Replace these with your real logo before publishing to app stores.
"""

import struct, zlib, os

def make_png(size, bg=(13,13,13), fg=(212,168,64)):
    """Create a minimal valid PNG with the Enigma Alpha 'EA' monogram."""
    w = h = size

    def png_chunk(name, data):
        crc = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', crc)

    # Build raw pixel data - gold circle on dark background
    rows = []
    cx = cy = w // 2
    r  = int(w * 0.42)
    ir = int(w * 0.30)

    for y in range(h):
        row = b'\x00'  # filter type
        for x in range(w):
            dx = x - cx
            dy = y - cy
            dist = (dx*dx + dy*dy) ** 0.5
            if dist <= ir:
                row += bytes(bg)          # inner dark
            elif dist <= r:
                row += bytes(fg)          # gold ring
            else:
                row += bytes(bg)          # outer dark
        rows.append(row)

    raw      = b''.join(rows)
    compress = zlib.compress(raw, 9)

    signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    ihdr      = png_chunk(b'IHDR', ihdr_data)
    idat      = png_chunk(b'IDAT', compress)
    iend      = png_chunk(b'IEND', b'')

    return signature + ihdr + idat + iend


SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
out_dir = os.path.join(os.path.dirname(__file__), 'assets', 'icons')
os.makedirs(out_dir, exist_ok=True)

for sz in SIZES:
    path = os.path.join(out_dir, f'icon-{sz}.png')
    with open(path, 'wb') as f:
        f.write(make_png(sz))
    print(f'Created {path}')

print('\n✦ Placeholder icons created.')
print('Replace with your real logo at assets/icons/ before publishing.')
