from lib import svg
def box(x,y,w,h,c,lines,fs=13):
    t=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{c}" stroke="#333"/>'
    for i,l in enumerate(lines): t+=f'<text x="{x+w/2}" y="{y+22+i*(fs+5)}" text-anchor="middle" font-size="{fs}"'+(' font-weight="bold"' if i==0 else '')+f'>{l}</text>'
    return t
def arrow(x1,y1,x2,y2,label='',lx=None,ly=None):
    t=f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#333" stroke-width="2" marker-end="url(#ah)"/>'
    if label: t+=f'<text x="{lx if lx is not None else (x1+x2)/2}" y="{ly if ly is not None else (y1+y2)/2-6}" text-anchor="middle" font-size="12">{label}</text>'
    return t
DEF='<defs><marker id="ah" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0,0 10,4 0,8" fill="#333"/></marker></defs>'
def title(w,s): return f'<text x="{w/2}" y="24" text-anchor="middle" font-weight="bold">{s}</text>'
