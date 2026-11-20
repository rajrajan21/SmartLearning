from lib import *
def numberline(name, lo, hi, step, jumps, title=""):
    """jumps: [(from,to,label)] drawn as arcs above a line from lo..hi with tick every step."""
    W=760;H=170;x0=40;x1=720
    X=lambda v: x0+(x1-x0)*(v-lo)/(hi-lo)
    b=f'<text x="{W//2}" y="22" text-anchor="middle" font-size="18" font-weight="bold">{title}</text>' if title else ''
    b+=f'<line x1="{x0}" y1="110" x2="{x1}" y2="110" stroke="#333" stroke-width="3"/>'
    v=lo
    while v<=hi:
        b+=f'<line x1="{X(v)}" y1="102" x2="{X(v)}" y2="118" stroke="#333" stroke-width="2"/><text x="{X(v)}" y="140" text-anchor="middle">{v}</text>'
        v+=step
    cols=["#e4572e","#2e86ab","#3a9d5d","#a0529f"]
    for i,(a,c,l) in enumerate(jumps):
        xa,xc=X(a),X(c); m=(xa+xc)/2; r=abs(xc-xa)/2; h=min(60,max(24,r*0.8))
        col=cols[i%4]
        b+=f'<path d="M{xa} 108 Q{m} {108-2*h} {xc} 108" fill="none" stroke="{col}" stroke-width="3"/><text x="{m}" y="{108-h-6}" text-anchor="middle" fill="{col}" font-weight="bold">{l}</text>'
        b+=f'<circle cx="{xa}" cy="110" r="5" fill="{col}"/><circle cx="{xc}" cy="110" r="5" fill="{col}"/>'
    svgfile(name,W,H,b)
