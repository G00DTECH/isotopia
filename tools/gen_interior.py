#!/usr/bin/env python3
"""Generate the shared interior collision tilemap (interior_room.json).

The Luna Town interior art is a single 1024x1024 background image per room, all
with the same isometric layout: an open white floor in the lower-centre and
furniture/walls around it. So one 16x16 collision grid works for every room --
only the background image differs (see ImageRoomScene). Walkable cells are empty
(0); every other cell holds the transparent `blank16` tile flagged ge_collide,
so the dog is kept on the visible floor while nothing is drawn over the art.

Run:  python3 tools/gen_interior.py
"""
import json, os

N = 16                       # 16x16 grid over the 1024px room (64px per cell)
WALK_COLS = range(3, 12)     # inclusive 3..11
WALK_ROWS = range(10, 14)    # inclusive 10..13

def walkable(c, r):
    return c in WALK_COLS and r in WALK_ROWS

walls = [0 if walkable(i % N, i // N) else 1 for i in range(N * N)]

tilemap = {
    "compressionlevel": -1, "infinite": False, "orientation": "orthogonal",
    "renderorder": "right-down", "tiledversion": "1.9.0", "type": "map",
    "version": "1.9", "width": N, "height": N, "tilewidth": 16, "tileheight": 16,
    "nextlayerid": 2, "nextobjectid": 1,
    "layers": [{
        "data": walls, "height": N, "width": N, "id": 1, "name": "walls",
        "opacity": 1, "type": "tilelayer", "visible": True, "x": 0, "y": 0,
    }],
    "tilesets": [{
        "columns": 1, "firstgid": 1, "image": "../assets/tiles/blank16.png",
        "imagewidth": 16, "imageheight": 16, "margin": 0, "spacing": 0,
        "name": "blank16", "tilecount": 1, "tilewidth": 16, "tileheight": 16,
        "tiles": [{"id": 0, "properties": [
            {"name": "ge_collide", "type": "bool", "value": True}]}],
    }],
}

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, '..', 'src', 'assets', 'tilemap', 'interior_room.json')
with open(out, 'w') as f:
    json.dump(tilemap, f)
print("wrote", os.path.relpath(out),
      "- walkable cols", WALK_COLS.start, "-", WALK_COLS.stop - 1,
      "rows", WALK_ROWS.start, "-", WALK_ROWS.stop - 1)
