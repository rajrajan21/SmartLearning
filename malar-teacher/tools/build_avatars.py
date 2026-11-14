"""Build original teacher avatars (GLB with speech morphs) from MakeHuman CC0 data. No AI involved."""
import gzip, io, json, os, struct, sys
import numpy as np
from PIL import Image

A = '/home/claude/av/assets'
D = '/home/claude/mh/mp/src/mpfb/data'
OUT = '/home/claude/av/out'

def load_obj(path):
    v, vt, faces, groups, g = [], [], [], [], ''
    for ln in open(path):
        p = ln.split()
        if not p: continue
        if p[0] == 'v': v.append([float(x) for x in p[1:4]])
        elif p[0] == 'vt': vt.append([float(x) for x in p[1:3]])
        elif p[0] == 'g': g = p[1]
        elif p[0] == 'f':
            f = []
            for c in p[1:]:
                s = c.split('/')
                f.append((int(s[0]) - 1, int(s[1]) - 1 if len(s) > 1 and s[1] else 0))
            faces.append(f); groups.append(g)
    return np.array(v), (np.array(vt) if vt else np.zeros((1, 2))), faces, groups

def load_target(path, n):
    op = gzip.open if path.endswith('.gz') else open
    d = np.zeros((n, 3))
    with op(path, 'rt') as fh:
        for ln in fh:
            p = ln.split()
            if len(p) == 4 and p[0][0] != '#': d[int(p[0])] = [float(x) for x in p[1:]]
    return d

def load_mhclo(path):
    c = {'verts': [], 'delete': set(), 'scale': {}, 'dir': os.path.dirname(path)}
    mode = None
    for ln in open(path, errors='ignore'):
        p = ln.split()
        if not p or p[0].startswith('#'): continue
        if p[0] == 'verts': mode = 'v'; continue
        if p[0] == 'delete_verts': mode = 'd'; continue
        try: float(p[0]); num = True
        except ValueError: num = False
        if not num:
            if p[0] in ('x_scale', 'y_scale', 'z_scale'): c['scale']['xyz'.index(p[0][0])] = (int(p[1]), int(p[2]), float(p[3]))
            elif p[0] in ('obj_file', 'material'): c[p[0]] = p[1]
            continue
        if mode == 'v': c['verts'].append([float(x) for x in p])
        elif mode == 'd':
            i = 0
            while i < len(p):
                if i + 2 < len(p) and p[i + 1] == '-':
                    c['delete'].update(range(int(p[i]), int(p[i + 2]) + 1)); i += 3
                else: c['delete'].add(int(p[i])); i += 1
    rows = c['verts']
    c['idx'] = np.array([[int(r[0])] * 3 if len(r) < 9 else [int(r[0]), int(r[1]), int(r[2])] for r in rows])
    c['w'] = np.array([[1, 0, 0] if len(r) < 9 else r[3:6] for r in rows], float)
    c['off'] = np.array([[0, 0, 0] if len(r) < 9 else r[6:9] for r in rows], float)
    return c

def fit(c, B):
    P = (B[c['idx']] * c['w'][:, :, None]).sum(1)
    s = np.ones(3)
    for ax, (a, b, den) in c['scale'].items(): s[ax] = abs(B[a, ax] - B[b, ax]) / den
    return P + c['off'] * s

def mhmat_tex(d, name):
    for ln in open(os.path.join(d, name), errors='ignore'):
        p = ln.split()
        if p and p[0] == 'diffuseTexture': return os.path.join(d, p[1])
    return None

def smooth(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)

class Part:  # one renderable mesh
    def __init__(self, name, P, vt, faces, keep=None):
        self.name = name
        pairs, tris, rem = {}, [], []
        for fi, f in enumerate(faces):
            if keep is not None and not keep[fi]: continue
            ids = []
            for k in f:
                if k not in pairs: pairs[k] = len(pairs); rem.append(k)
                ids.append(pairs[k])
            for i in range(1, len(ids) - 1): tris.append([ids[0], ids[i], ids[i + 1]])
        self.src = np.array([k[0] for k in rem]); self.tris = np.array(tris, np.uint32)
        self.uv = np.array([[vt[k[1]][0], 1 - vt[k[1]][1]] for k in rem], np.float32)
        self.morphs = {}
    def crop(self, P, ycut):
        y = P[self.src][:, 1]
        self.tris = self.tris[(y[self.tris] > ycut).all(1)]
        used = np.unique(self.tris); m = -np.ones(len(self.src), int); m[used] = np.arange(len(used))
        self.src, self.uv, self.tris = self.src[used], self.uv[used], m[self.tris].astype(np.uint32)
    def normals(self, P):
        p = P[self.src]; n = np.zeros_like(P)
        fn = np.cross(p[self.tris[:, 1]] - p[self.tris[:, 0]], p[self.tris[:, 2]] - p[self.tris[:, 0]])
        for i in range(3): np.add.at(n, self.src[self.tris[:, i]], fn)
        n = n[self.src]; return (n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-9)).astype(np.float32)

class GLB:
    def __init__(self): self.bin = bytearray(); self.j = dict(asset={'version': '2.0'}, scene=0, scenes=[{'nodes': []}], nodes=[], meshes=[], accessors=[], bufferViews=[], materials=[], textures=[], images=[], samplers=[{'magFilter': 9729, 'minFilter': 9987}])
    def view(self, data, target=None):
        while len(self.bin) % 4: self.bin.append(0)
        v = {'buffer': 0, 'byteOffset': len(self.bin), 'byteLength': len(data)}
        if target: v['target'] = target
        self.bin += data; self.j['bufferViews'].append(v); return len(self.j['bufferViews']) - 1
    def acc(self, arr, typ, target=None, mm=False):
        ct = {np.dtype('float32'): 5126, np.dtype('uint32'): 5125, np.dtype('uint16'): 5123}[arr.dtype]
        a = {'bufferView': self.view(arr.tobytes(), target), 'componentType': ct, 'count': len(arr) if typ != 'SCALAR' else arr.size, 'type': typ}
        if mm: a['min'] = arr.min(0).tolist(); a['max'] = arr.max(0).tolist()
        self.j['accessors'].append(a); return len(self.j['accessors']) - 1
    def material(self, name, img, alpha=None, rough=.6, double=False, color=(1, 1, 1, 1)):
        m = {'name': name, 'pbrMetallicRoughness': {'metallicFactor': 0, 'roughnessFactor': rough, 'baseColorFactor': list(color)}, 'doubleSided': double}
        if img is not None:
            buf = io.BytesIO(); rgba = img.mode == 'RGBA'
            img.save(buf, 'PNG' if rgba else 'JPEG', **({} if rgba else {'quality': 88}))
            self.j['images'].append({'bufferView': self.view(buf.getvalue()), 'mimeType': 'image/png' if rgba else 'image/jpeg'})
            self.j['textures'].append({'source': len(self.j['images']) - 1, 'sampler': 0})
            m['pbrMetallicRoughness']['baseColorTexture'] = {'index': len(self.j['textures']) - 1}
        if alpha: m['alphaMode'] = alpha; m.update({'alphaCutoff': .35} if alpha == 'MASK' else {})
        self.j['materials'].append(m); return len(self.j['materials']) - 1
    def mesh(self, part, pos, nrm, mat, skin=None):
        prim = {'attributes': {'POSITION': self.acc(pos, 'VEC3', 34962, True), 'NORMAL': self.acc(nrm, 'VEC3', 34962), 'TEXCOORD_0': self.acc(part.uv, 'VEC2', 34962)},
                'indices': self.acc(part.tris.reshape(-1), 'SCALAR', 34963), 'material': mat}
        names = list(part.morphs)
        if names: prim['targets'] = [{'POSITION': self.acc(part.morphs[n], 'VEC3', 34962, True)} for n in names]
        m = {'name': part.name, 'primitives': [prim]}
        if names: m['weights'] = [0] * len(names); m['extras'] = {'targetNames': names}
        node = {'name': part.name, 'mesh': len(self.j['meshes'])}
        if skin is not None:
            ji, jw = skin; prim['attributes']['JOINTS_0'] = self.acc(ji, 'VEC4', 34962); prim['attributes']['WEIGHTS_0'] = self.acc(jw, 'VEC4', 34962); node['skin'] = 0
        self.j['meshes'].append(m); self.j['nodes'].append(node)
        self.j['scenes'][0]['nodes'].append(len(self.j['nodes']) - 1)
    def save(self, path):
        while len(self.bin) % 4: self.bin.append(0)
        self.j['buffers'] = [{'byteLength': len(self.bin)}]
        js = json.dumps(self.j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
        with open(path, 'wb') as f:
            f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(self.bin)))
            f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(self.bin), 0x004E4942) + self.bin)

def tex(path, size, tint=None, gray=False, gamma=1, aboost=1, ao_color=None):
    im = Image.open(path); rgba = im.mode in ('RGBA', 'LA', 'P') and 'A' in im.convert('RGBA').getbands() and im.convert('RGBA').getextrema()[3][0] < 250
    im = im.convert('RGBA' if rgba else 'RGB')
    if max(im.size) > size: im = im.resize((size, size), Image.LANCZOS)
    if ao_color is not None: tint, gray = ao_color, True
    if tint is not None or aboost != 1:
        a = np.asarray(im).astype(np.float32); rgb = a[..., :3]
        if gray: rgb = np.repeat(rgb.mean(-1, keepdims=True), 3, -1)
        if gamma != 1: rgb = 255 * (rgb / 255) ** gamma
        a[..., :3] = np.clip(rgb * np.array(tint or (1, 1, 1)), 0, 255)
        if aboost != 1 and a.shape[-1] == 4: a[..., 3] = np.clip(a[..., 3] * aboost, 0, 255)
        im = Image.fromarray(a.astype(np.uint8), im.mode)
    return im

VIS = ['aa', 'E', 'I', 'O', 'U', 'PP', 'SS', 'TH', 'CH', 'FF', 'kk', 'nn', 'RR', 'DD']
FU = {'blink': {'eyeBlinkLeft': 1, 'eyeBlinkRight': 1}, 'browUp': {'browInnerUp': 1, 'browOuterUpLeft': .8, 'browOuterUpRight': .8},
      'smile': {'mouthSmileLeft': .8, 'mouthSmileRight': .8, 'cheekSquintLeft': .4, 'cheekSquintRight': .4}, 'browDown': {'browDownLeft': 1, 'browDownRight': 1}}

def build(cfg):
    bv, bvt, bf, bg = load_obj(f'{D}/3dobjs/base.obj'); n = len(bv)
    g, md = cfg['gender'], f'{D}/targets/macrodetails'
    B = bv.copy()
    for age, wa in (('young', 1 - cfg['old']), ('old', cfg['old'])):
        if wa <= 0: continue
        B += wa * load_target(f'{md}/universal-{g}-{age}-averagemuscle-averageweight.target.gz', n)
        for race, wr in cfg['race'].items(): B += wa * wr * load_target(f'{md}/{race}-{g}-{age}.target.gz', n)
    joints = {}
    for f, grp in zip(bf, bg):
        if grp.startswith('joint-'): joints.setdefault(grp[6:], set()).update(k[0] for k in f)
    J = {k: B[list(v)].mean(0) for k, v in joints.items()}
    T = {f'viseme_{v}': load_target(f'{A}/targets/visemes/viseme_{v}.target', n) for v in VIS}
    for name, mix in FU.items(): T[name] = sum(w * load_target(f'{A}/targets/faceunits/{k}.target', n) for k, w in mix.items())
    neck, head = J['neck'], J['head']
    RG = f'{D}/rigs/standard'; rig = json.load(open(f'{RG}/rig.game_engine.json')); wj = json.load(open(f'{RG}/weights.game_engine.json'))['weights']
    def bpos(sp):
        st = sp.get('strategy')
        if st == 'CUBE' and sp['cube_name'][6:] in J: return J[sp['cube_name'][6:]]
        if st == 'MEAN': return B[sp['vertex_indices']].mean(0)
        if st == 'VERTEX': return B[sp['vertex_index']]
        d = sp['default_position']; return np.array([d[0], d[2], -d[1]]) * 10
    order = []
    def visit(b):
        if b in order: return
        p = rig[b].get('parent')
        if p: visit(p)
        order.append(b)
    for b in rig: visit(b)
    bh = {b: bpos(rig[b]['head']) for b in order}
    W = np.zeros((n, len(order)), np.float32)
    for bi, b in enumerate(order):
        for vi, w in wj.get(b, []): W[vi, bi] = w
    tot = W.sum(1); W[tot < 1e-6, order.index('Root')] = 1; W /= W.sum(1, keepdims=True)
    def skinof(Wm):
        ji = np.argsort(-Wm, 1)[:, :4]; jw = np.take_along_axis(Wm, ji, 1); jw = jw / np.maximum(jw.sum(1, keepdims=True), 1e-9)
        return ji.astype(np.uint16), jw.astype(np.float32)
    def headmorph(P, axis, deg):
        w = smooth((P[:, 1] - neck[1]) / (head[1] - neck[1] + .35))[:, None]; a = np.radians(deg); c, s = np.cos(a), np.sin(a)
        R = {'y': [[c, 0, s], [0, 1, 0], [-s, 0, c]], 'x': [[1, 0, 0], [0, c, -s], [0, s, c]], 'z': [[c, -s, 0], [s, c, 0], [0, 0, 1]]}[axis]
        piv = (neck + head) / 2; return w * ((P - piv) @ np.array(R).T + piv - P)
    def pose(P): return (P - head) * .1
    ycut = (J['pelvis'][1] if 'pelvis' in J else J['spine-2'][1] - 2.5) - .2
    glb = GLB()
    for b in order:
        p = rig[b].get('parent'); glb.j['nodes'].append({'name': b, 'translation': ((bh[b] - (bh[p] if p else head)) * .1).tolist()})
    for bi, b in enumerate(order):
        ch = [order.index(c) for c in order if rig[c].get('parent') == b]
        if ch: glb.j['nodes'][bi]['children'] = ch
    glb.j['scenes'][0]['nodes'] += [bi for bi, b in enumerate(order) if not rig[b].get('parent')]
    ibm = np.tile(np.eye(4, dtype=np.float32), (len(order), 1, 1))
    for bi, b in enumerate(order): ibm[bi, 3, :3] = -(bh[b] - head) * .1
    glb.j['skins'] = [{'joints': list(range(len(order))), 'inverseBindMatrices': glb.acc(ibm.reshape(-1, 16), 'MAT4')}]
    def emit(part, P, deltas, mat, Wm=None):
        part.crop(P, ycut)
        for name, d in deltas.items():
            dd = (d[part.src] * .1).astype(np.float32)
            if np.abs(dd).max() > 2e-5: part.morphs[name] = dd
        for nm, (ax, deg) in {'headYaw': ('y', 12), 'headPitch': ('x', 10), 'headRoll': ('z', 8)}.items():
            dd = (headmorph(P, ax, deg)[part.src] * .1).astype(np.float32)
            if np.abs(dd).max() > 2e-5: part.morphs[nm] = dd
        glb.mesh(part, pose(P)[part.src].astype(np.float32), part.normals(pose(P)), mat, skinof((W if Wm is None else Wm)[part.src]))
    # proxies
    deleted = set(); prox = []
    for kind, rel, opts in cfg['parts']:
        c = load_mhclo(f'{A}/{rel}'); pv, pvt, pf, _ = load_obj(os.path.join(c['dir'], c['obj_file']))
        if kind in ('clothes',): deleted |= c['delete']
        prox.append((kind, c, pvt, pf, opts))
    keep = [grp == 'body' and not any(k[0] in deleted for k in f) for f, grp in zip(bf, bg)]
    skin = tex(f"{A}/{cfg['skin']}", 2048, cfg['tint']).convert('RGB')
    if cfg.get('bindi'):
        bd = T['browUp']; by = B[np.linalg.norm(bd, axis=1) > .6 * np.linalg.norm(bd, axis=1).max()][:, 1].mean()
        best = None
        for f, grp in zip(bf, bg):
            if grp != 'body': continue
            for vi, ti in f:
                p = B[vi]
                if abs(p[0]) < .04 and p[2] > head[2] and (best is None or abs(p[1] - by - .03) < best[0]): best = (abs(p[1] - by - .03), ti)
        from PIL import ImageDraw
        u, v = bvt[best[1]]; cx, cy, r = u * 2048, (1 - v) * 2048, cfg['bindi']
        ImageDraw.Draw(skin).ellipse([cx - r, cy - r, cx + r, cy + r], fill=(150, 20, 40))
    emit(Part('body', B, bvt, bf, keep), B, T, glb.material('skin', skin, rough=.55))
    for kind, c, pvt, pf, o in prox:
        P0 = fit(c, B); dl = {} if kind in ('hair', 'clothes') else {k: fit(c, B + t) - P0 for k, t in T.items()}
        tp = o.get('tex') or mhmat_tex(c['dir'], c['material'])
        if o.get('color'): tp = tp.replace('_diffuse', '_ao')
        img = tex(tp if os.path.isabs(tp) else f'{A}/{tp}', o.get('size', 1024), o.get('tint'), o.get('gray', False), o.get('gamma', 1), o.get('aboost', 1), o.get('color')) if tp else None
        alpha = {'hair': 'MASK', 'eyebrows': 'BLEND', 'eyelashes': 'BLEND', 'eyes': 'MASK'}.get(kind)
        if kind in ('teeth', 'tongue', 'clothes') and img is not None: img = img.convert('RGB')
        mat = glb.material(kind, img, alpha=alpha, rough={'eyes': .15, 'teeth': .3, 'tongue': .4, 'hair': .5}.get(kind, .8), double=kind in ('hair', 'clothes', 'eyelashes', 'eyebrows'))
        Wp = (W[c['idx']] * c['w'][:, :, None].astype(np.float32)).sum(1); Wp /= np.maximum(Wp.sum(1, keepdims=True), 1e-9)
        emit(Part(kind, P0, pvt, pf), P0, dl, mat, Wp)
        if kind == 'clothes' and cfg.get('saree'):
            tmp = Part('t', P0, pvt, pf); vn = np.zeros_like(P0); vn[tmp.src] = tmp.normals(P0)
            Ls = J['l-shoulder']; a = np.array([Ls[0] * .6, Ls[1] + .25]); b = np.array([-Ls[0] * .95, ycut - .5])
            u = (b - a) / np.linalg.norm(b - a); nn = np.array([-u[1], u[0]]); q = P0[:, :2] - a
            l = q @ u; t = (q @ nn) / (.8 + .12 * np.clip(l, 0, 9)); zmid = J['spine-2'][2]
            front = (P0[:, 2] > zmid) & (np.abs(t) < 1.35) & (l > -.7) & (P0[:, 0] < Ls[0] + .15)
            tb = (P0[:, 0] - a[0]) / .78; back = (P0[:, 2] <= zmid) & (np.abs(tb) < 1.35) & (P0[:, 1] < Ls[1] + .6)
            m = front | back; tt = np.where(front, t, tb); ll = np.where(front, l, -(a[1] - P0[:, 1]))
            sp = Part('saree', P0, pvt, pf, [all(m[k[0]] for k in f) for f in pf])
            sp.uv = np.stack([(tt + 1) / 2, ll * .35], 1)[sp.src].astype(np.float32)
            col, gold = cfg['saree']; W = 256; uu = np.linspace(0, 1, W)[None, :, None]; vv = np.linspace(0, 1, W)[:, None, None]
            im = np.array(col)[None, None, :] * (.86 + .14 * np.cos(2 * np.pi * 5 * uu)) * np.ones((W, 1, 1))
            edge = (uu < .1) | (uu > .9) | (np.abs(uu - .145) < .012) | (np.abs(uu - .855) < .012)
            im = np.where(edge, np.array(gold)[None, None, :] * (.8 + .2 * np.cos(2 * np.pi * 24 * vv)), im)
            al = np.ones((W, W, 1)); al[:, :2] = 0; al[:, -2:] = 0
            simg = Image.fromarray((np.clip(np.concatenate([im, al], 2), 0, 1) * 255).astype(np.uint8), 'RGBA')
            mi = glb.material('saree', simg, alpha='MASK', rough=.55, double=True); glb.j['samplers'].append({'magFilter': 9729, 'minFilter': 9987, 'wrapS': 33071, 'wrapT': 10497})
            glb.j['textures'][-1]['sampler'] = len(glb.j['samplers']) - 1
            emit(sp, P0 + vn * .07, {}, mi, Wp)
    path = f"{OUT}/{cfg['id']}.glb"; glb.save(path)
    print(cfg['id'], round(os.path.getsize(path) / 1e6, 2), 'MB', {m['name']: len(m.get('extras', {}).get('targetNames', [])) for m in glb.j['meshes']})

F_COMMON = [('eyes', 'eyes/high-poly/high-poly.mhclo', {'tex': 'eyes/materials/brown_eye.png', 'size': 512, 'tint': (.62, .6, .6)}), ('teeth', 'teeth/teeth_base/teeth_base.mhclo', {'size': 512, 'tint': (.82, .8, .76)}),
            ('tongue', 'tongue/tongue01/tongue01.mhclo', {'size': 256}), ('eyelashes', 'eyelashes/eyelashes01/eyelashes01.mhclo', {'size': 512})]
INDIAN = {'caucasian': .6, 'african': .25, 'asian': .15}
BLACK = (.42, .36, .33)
def T_(id, gender, old, skin, tint, hair, outfit, color=None, hair_tint=BLACK, hair_gamma=1.7, bindi=0, saree=None, suit_tint=None):
    return dict(id=id, gender=gender, old=old, race=INDIAN, skin=skin, tint=tint, bindi=bindi, saree=saree, parts=F_COMMON + [
        ('eyebrows', 'eyebrows/eyebrow001/eyebrow001.mhclo', {'size': 512, 'tint': (.2, .16, .14), 'aboost': 2.2 if gender == 'female' else 3}),
        ('hair', f'hair/{hair}/{hair}.mhclo', {'size': 1024, 'tint': hair_tint, 'gray': True, 'gamma': hair_gamma}),
        ('clothes', f'clothes/{outfit}/{outfit}.mhclo', {'size': 1024, 'color': color, 'tint': suit_tint})])
import glob
def skin(n): return glob.glob(f'{A}/skins/{n}/*.png')[0][len(A) + 1:]
GOLD = (.85, .66, .2)
CAST = [
 T_('malar', 'female', .05, skin('young_asian_female'), (.84, .72, .62), 'long01', 'female_casualsuit02', (.45, .1, .16), bindi=5, saree=((.55, .08, .17), GOLD)),
 T_('kavitha', 'female', .22, skin('middleage_asian_female'), (.78, .64, .53), 'ponytail01', 'female_casualsuit02', (.7, .5, .15), bindi=5, saree=((.1, .2, .5), GOLD)),
 T_('priya', 'female', 0, skin('young_asian_female'), (.9, .78, .68), 'long01', 'female_casualsuit02', (.5, .1, .2), bindi=4, saree=((.06, .4, .3), (.85, .7, .3))),
 T_('arun', 'male', .1, skin('young_asian_male'), (.8, .67, .56), 'short04', 'male_elegantsuit01', suit_tint=(.75, .85, 1.25)),
 T_('karthik', 'male', .2, skin('middleage_asian_male'), (.72, .58, .48), 'short02', 'male_elegantsuit01'),
 T_('rajan', 'male', .38, skin('middleage_asian_male'), (.84, .7, .6), 'short02', 'male_elegantsuit01', hair_tint=(.8, .8, .82), hair_gamma=.6, suit_tint=(1.25, 1.02, .82)),
]
if __name__ == '__main__':
    want = sys.argv[1:]
    for c in CAST:
        if not want or c['id'] in want: build(c)
