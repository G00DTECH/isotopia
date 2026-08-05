#!/usr/bin/env python3
"""Generate the walkable City tilemap (city_map.json).

The next-map-expansion city you reach across the bridge from the woods lookout.
A light-pavement (sidewalk) city with a grid of darker asphalt roads, a central
cobblestone plaza with a couple of trees, and the nine city buildings laid out in
three rows. Each building is an invisible-but-solid collision footprint (blank16),
bottom-anchored to its base row and sized to the (cropped) art, so the overlay
images drawn in CityScene line up with what blocks the dog. Buildings are
decorative (not enterable), so unlike the town there's no walkable door gap.

Keep PLACEMENTS in sync with CityScene.ts BUILDINGS. Run:
    python3 tools/gen_city.py   (writes src/assets/tilemap/city_map.json)
"""
import json, os
from PIL import Image

SHEET_COLS = 141
def gid(col, row): return row * SHEET_COLS + col + 1

W, H = 44, 52
SIDEWALK = gid(43, 2)                      # light cream pavement (base)
ROAD     = gid(34, 6)                      # dark asphalt (road grid)
PLAZA    = gid(17, 1)                      # grey cobblestone (central plaza)

# 2x3 tree (trunk row blocks) — reused from the woods, for the plaza greenery.
TREE = dict(sc=16, sr=3, w=2, h=3)

BLANK_FIRST = SHEET_COLS * 118 + 1        # firstgid after modern_exterior (141x118)
BLANK_SOLID = BLANK_FIRST + 1             # blank16 tile id 1 = transparent + ge_collide

_HERE = os.path.dirname(os.path.abspath(__file__))
def art_aspect(name):
    im = Image.open(os.path.join(_HERE, '..', 'src', 'assets', 'city', name + '.png'))
    return im.height / im.width

# (id, centre_col, base_row, width_tiles). Three rows of three, tall towers up
# top, the wide power-station anchoring the front row.
PLACEMENTS = [
    ('power-tower',      8, 13, 5.0),
    ('finance-tower',   22, 13, 5.0),
    ('large-tower',     36, 13, 6.0),
    ('large-church',     8, 29, 5.5),
    ('museum',          22, 29, 5.0),
    ('fashion-district',36, 29, 5.0),
    ('radio-tower',      9, 45, 3.5),
    ('power-station',   22, 45, 8.0),
    ('radio-tower-2',   35, 45, 3.5),
]

floor = [SIDEWALK] * (W * H)
walls = [0] * (W * H)
collide = set()

def put(layer, tx, ty, g):
    if 0 <= tx < W and 0 <= ty < H:
        layer[ty * W + tx] = g

# --- asphalt road grid (streets between the building rows/columns) ---
for ty in (14, 15, 30, 31, 47, 48):
    for tx in range(W):
        put(floor, tx, ty, ROAD)
for tx in (0, 1, 14, 15, 28, 29, 42, 43):
    for ty in range(H):
        put(floor, tx, ty, ROAD)

# --- central cobblestone plaza (in the open band between rows 2 and 3) ---
for ty in range(33, 39):
    for tx in range(16, 29):
        put(floor, tx, ty, PLAZA)

# --- buildings: invisible solid footprints, bottom-anchored to the base row ---
for (name, cx, base, wt) in PLACEMENTS:
    coll_w = max(1, round(wt))
    coll_h = max(1, round(wt * art_aspect(name)))
    left = cx - coll_w // 2
    top = base - coll_h + 1
    for ty in range(top, base + 1):
        for tx in range(left, left + coll_w):
            put(walls, tx, ty, BLANK_SOLID)

# --- a couple of park trees flanking the plaza (trunk row blocks) ---
def plant_tree(ox, oy):
    for dy in range(TREE['h']):
        for dx in range(TREE['w']):
            g = gid(TREE['sc'] + dx, TREE['sr'] + dy)
            put(walls, ox + dx, oy + dy, g)
            if dy == TREE['h'] - 1:
                collide.add(g)
plant_tree(17, 35)
plant_tree(25, 35)

tileset_tiles = [
    {"id": g - 1, "properties": [{"name": "ge_collide", "type": "bool", "value": True}]}
    for g in sorted(collide)
]

def tilelayer(name, data, lid):
    return {"data": data, "height": H, "id": lid, "name": name, "opacity": 1,
            "type": "tilelayer", "visible": True, "width": W, "x": 0, "y": 0}

tilemap = {
    "compressionlevel": -1, "infinite": False, "orientation": "orthogonal",
    "renderorder": "right-down", "tiledversion": "1.9.0", "type": "map",
    "version": "1.9", "width": W, "height": H, "tilewidth": 16, "tileheight": 16,
    "nextlayerid": 4, "nextobjectid": 1,
    "layers": [tilelayer("floor", floor, 1), tilelayer("walls", walls, 2)],
    "tilesets": [{
        "columns": SHEET_COLS, "firstgid": 1,
        "image": "../assets/tiles/modern_exterior.png",
        "imagewidth": 2256, "imageheight": 1888,
        "margin": 0, "spacing": 0, "name": "modern_exterior",
        "tilecount": 141 * 118, "tilewidth": 16, "tileheight": 16, "tiles": tileset_tiles,
    }, {
        "columns": 2, "firstgid": BLANK_FIRST,
        "image": "../assets/tiles/blank16.png",
        "imagewidth": 32, "imageheight": 16,
        "margin": 0, "spacing": 0, "name": "blank16",
        "tilecount": 2, "tilewidth": 16, "tileheight": 16,
        "tiles": [{"id": 1, "properties": [{"name": "ge_collide", "type": "bool", "value": True}]}],
    }],
}

out = os.path.join(_HERE, '..', 'src', 'assets', 'tilemap', 'city_map.json')
with open(out, 'w') as f:
    json.dump(tilemap, f)
print("wrote", os.path.relpath(out), f"({W}x{H})")
