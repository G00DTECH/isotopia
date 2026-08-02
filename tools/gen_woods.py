#!/usr/bin/env python3
"""Generate the North Woods & Meadow tilemap (woods_map.json) from modern_exterior.

A natural area you reach by following the trail north out of town (see the Door
in TestScene at the top of the map). Built entirely from existing modern_exterior
tiles: grass + wildflower meadow, walkable tall-grass patches, tree groves that
frame the edges, scattered bushes (blocking) and grass tufts (decorative). A
cobblestone trail runs up the middle from the south exit back to town.

Collision (ge_collide) is added per-GID to tree trunks and bushes; tall grass and
tufts stay walkable so you can wander through the meadow. Trees enclose the map so
the only way out is the south exit back to town.

Run:  python3 tools/gen_woods.py   (writes src/assets/tilemap/woods_map.json)
"""
import json, os, random

SHEET_COLS = 141
def gid(col, row): return row * SHEET_COLS + col + 1

W, H = 40, 24
GRASS  = gid(8, 2)     # solid grass
GRASSF = gid(8, 4)     # grass with wildflowers
PATH   = gid(17, 1)    # cobblestone trail
BUSH   = gid(14, 5)    # single round bush (blocks)
TALL1  = gid(18, 13)   # walkable tall-grass patch (flowering)
TALL2  = gid(19, 13)   # walkable tall-grass patch (dense)
TUFTS  = [gid(16, 13), gid(20, 13), gid(22, 13), gid(18, 11)]  # decorative, walkable
TREE   = dict(sc=16, sr=3, w=2, h=3)   # 2x3 tree, trunk on bottom row

floor = [GRASS] * (W * H)
walls = [0] * (W * H)
collide = set()
random.seed(7)

def put(layer, tx, ty, g):
    if 0 <= tx < W and 0 <= ty < H:
        layer[ty * W + tx] = g

def blocked_wall(tx, ty):
    if 0 <= tx < W and 0 <= ty < H:
        return walls[ty * W + tx] != 0
    return True

# --- south exit corridor back to town: a clear cobblestone trail up the middle
EXIT_COL = 20
for ty in range(6, H):
    put(floor, EXIT_COL, ty, PATH)
# a couple of gentle bends so the trail feels like a path, not a ruler line
for (tx, ty) in [(20, 12), (21, 12), (22, 12), (22, 11), (22, 10), (21, 10), (20, 10)]:
    put(floor, tx, ty, PATH)

def plant_tree(ox, oy):
    for dy in range(TREE['h']):
        for dx in range(TREE['w']):
            g = gid(TREE['sc'] + dx, TREE['sr'] + dy)
            put(walls, ox + dx, oy + dy, g)
            if dy == TREE['h'] - 1:      # trunk row blocks
                collide.add(g)

# --- tree border: enclose the woods on all sides except the south exit gap
def tree_ok(ox, oy):
    # keep trees off the trail and off the south exit gap
    if any(walls[(oy + dy) * W + (ox + dx)] != 0
           for dy in range(TREE['h']) for dx in range(TREE['w'])
           if 0 <= ox + dx < W and 0 <= oy + dy < H):
        return False
    if ox <= EXIT_COL + 1 and ox + TREE['w'] - 1 >= EXIT_COL - 1 and oy + TREE['h'] - 1 >= H - 4:
        return False   # don't wall off the exit
    return True

# top edge (dense), left & right columns
border = []
for ox in range(0, W, 2):
    border.append((ox, 0))
for oy in range(0, H - 3, 3):
    border.append((0, oy)); border.append((W - 2, oy))
# bottom edge, leaving a gap around the exit corridor
for ox in range(0, W, 2):
    if not (EXIT_COL - 2 <= ox <= EXIT_COL + 1):
        border.append((ox, H - 3))
for (ox, oy) in border:
    if tree_ok(ox, oy):
        plant_tree(ox, oy)

# --- interior groves: clumps of trees that leave meadow clearings + the trail
GROVES = [(4, 4), (7, 3), (11, 5), (30, 4), (33, 6), (27, 3),
          (5, 15), (9, 17), (32, 16), (35, 14), (14, 18), (3, 10), (36, 10)]
for (ox, oy) in GROVES:
    if tree_ok(ox, oy):
        plant_tree(ox, oy)

# --- wildflower meadow: swap some grass for the flowering variant in soft blobs
for (cx, cy, r) in [(15, 9, 5), (25, 11, 5), (18, 15, 4), (30, 12, 3)]:
    for ty in range(cy - r, cy + r + 1):
        for tx in range(cx - r, cx + r + 1):
            if 0 <= tx < W and 0 <= ty < H and (tx - cx) ** 2 + (ty - cy) ** 2 <= r * r:
                if floor[ty * W + tx] == GRASS and random.random() < 0.55:
                    put(floor, tx, ty, GRASSF)

# --- walkable tall-grass patches (Pokemon-style): wander through them
for (x0, y0, w, h) in [(12, 7, 5, 3), (23, 9, 5, 3), (16, 13, 4, 3), (28, 14, 4, 2)]:
    for ty in range(y0, y0 + h):
        for tx in range(x0, x0 + w):
            if not blocked_wall(tx, ty) and floor[ty * W + tx] != PATH:
                put(walls, tx, ty, random.choice([TALL1, TALL2]))

# --- scattered decoration: bushes (block) + grass tufts (walkable), off the trail
for _ in range(70):
    tx, ty = random.randint(1, W - 2), random.randint(2, H - 2)
    if walls[ty * W + tx] != 0 or floor[ty * W + tx] == PATH:
        continue
    if abs(tx - EXIT_COL) <= 1:      # keep the trail clear
        continue
    if random.random() < 0.35:
        put(walls, tx, ty, BUSH); collide.add(BUSH)
    else:
        put(walls, tx, ty, random.choice(TUFTS))

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
out = os.path.join(here, '..', 'src', 'assets', 'tilemap', 'woods_map.json')
with open(out, 'w') as f:
    json.dump(tilemap, f)
print("wrote", os.path.relpath(out), "| collide gids:", len(collide))
