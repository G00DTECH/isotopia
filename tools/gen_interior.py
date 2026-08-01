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

# Walkable column range (inclusive) per row, tracing the isometric white-floor
# diamond that every Luna Town room shares. Verified against treats/library/home
# so the dog stays on the visible floor and off furniture and walls.
WALK = {9: (6, 9), 10: (4, 11), 11: (3, 12), 12: (3, 12), 13: (4, 11), 14: (6, 9)}

def walkable(c, r):
    return r in WALK and WALK[r][0] <= c <= WALK[r][1]

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
      "-", sum(c1 - c0 + 1 for c0, c1 in WALK.values()), "walkable floor tiles")
