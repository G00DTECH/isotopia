#!/usr/bin/env python3
"""Generate the outdoor Town tilemap (test_map.json) from the modern_exterior sheet.

Buildings are copied wholesale as rectangular GID blocks (same tileset, so
gid = row*COLS + col + 1). Collision (ge_collide) is added per-GID to every
building/tree tile except the door columns, which stay walkable so the Door
objects placed in TestScene can trigger a scene switch.

Run:  python3 tools/gen_town.py   (writes src/assets/tilemap/test_map.json)
"""
import json, os

SHEET_COLS = 141                      # modern_exterior.png is 141 tiles wide
def gid(col, row): return row * SHEET_COLS + col + 1

W, H = 28, 16                         # town size in tiles
GRASS = gid(8, 2)                     # solid grass
PATH  = gid(17, 1)                    # grey cobblestone

# --- building models copied from the sheet: (sheet_col0, sheet_row0, w, h, door_local_col)
BUILDINGS = {
    # town origin col, row are filled per-placement below
    'shop': dict(sc=41, sr=88, w=8, h=8, door=5),   # red MARKET
    'lab':  dict(sc=58, sr=88, w=7, h=8, door=3),   # blue MARKET
    'home': dict(sc=72, sr=88, w=8, h=8, door=4),   # brown MARKET
}
# where each building sits in the town (top-left tile)
PLACEMENTS = [
    ('shop', 1, 1),
    ('lab', 10, 1),
    ('home', 19, 1),
]
# tree model: 2 wide x 3 tall, trunk on bottom row
TREE = dict(sc=16, sr=3, w=2, h=3)
TREE_SPOTS = [(1, 11), (25, 11), (5, 13), (22, 13)]

floor = [GRASS] * (W * H)
walls = [0] * (W * H)
collide = set()          # gids that should block the player

def put(layer, tx, ty, g):
    if 0 <= tx < W and 0 <= ty < H:
        layer[ty * W + tx] = g

# ground: grass everywhere, then a cobblestone plaza / walkway
for (name, ox, oy) in PLACEMENTS:
    b = BUILDINGS[name]
    door_col = ox + b['door']
    for ry in range(9, 11):           # short path stub below each door
        put(floor, door_col, ry, PATH)
for tx in range(6, 24):               # horizontal walkway across the plaza
    put(floor, tx, 11, PATH)

# buildings: stamp GID blocks; collide everything except the door column
for (name, ox, oy) in PLACEMENTS:
    b = BUILDINGS[name]
    for dy in range(b['h']):
        for dx in range(b['w']):
            g = gid(b['sc'] + dx, b['sr'] + dy)
            put(walls, ox + dx, oy + dy, g)
            if dx != b['door']:       # door column stays walkable
                collide.add(g)

# trees: decorative; only the trunk row (bottom) blocks
for (ox, oy) in TREE_SPOTS:
    for dy in range(TREE['h']):
        for dx in range(TREE['w']):
            g = gid(TREE['sc'] + dx, TREE['sr'] + dy)
            put(walls, ox + dx, oy + dy, g)
            if dy == TREE['h'] - 1:
                collide.add(g)

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
        "tilecount": 141 * 118, "tilewidth": 16, "tileheight": 16,
        "tiles": tileset_tiles,
    }],
}

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, '..', 'src', 'assets', 'tilemap', 'test_map.json')
with open(out, 'w') as f:
    json.dump(tilemap, f)

# door tiles for TestScene wiring (town col,row of each door's bottom tile)
doors = {name: (ox + BUILDINGS[name]['door'], oy + BUILDINGS[name]['h'] - 1)
         for (name, ox, oy) in PLACEMENTS}
print("wrote", os.path.relpath(out))
print("collide gids:", len(collide), " door tiles:", doors)
