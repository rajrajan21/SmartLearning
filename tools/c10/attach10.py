import json
ROOT='/tmp/ss-build/content/lessons/cbse-10-'
M={('maths','polynomials','zeroes-and-graphs'):('c10-parabola-zeroes.svg','Graph of y = x squared - 4 cutting the x-axis at -2 and 2','A quadratic graph is a parabola; its zeroes are the x-coordinates where it meets the x-axis'),
('maths','triangles','similar-figures-and-bpt'):('c10-bpt.svg','Triangle ABC with line DE parallel to BC','Basic Proportionality Theorem'),
('maths','introduction-to-trigonometry','trigonometric-ratios'):('c10-trig-ratios.svg','Right triangle with opposite, adjacent and hypotenuse marked','Trigonometric ratios'),
('maths','circles','tangent-to-a-circle'):('c10-tangent-radius.svg','A circle with a tangent perpendicular to the radius at the point of contact','Tangent and radius'),
('maths','areas-related-to-circles','arc-length-and-sector-area'):('c10-sector.svg','A sector of a circle with angle theta','Area and arc of a sector'),
('science','light-reflection-and-refraction','spherical-mirrors'):('c10-concave-mirror.svg','Concave mirror with principal axis, F, C and two rays','Ray parallel to the axis passes through F'),
('science','the-human-eye-and-the-colourful-world','human-eye-and-defects'):('c10-human-eye.svg','Labelled diagram of the human eye','Parts of the eye'),
('science','electricity','series-parallel-heating-power'):('c10-series-parallel.svg','Resistors in series and in parallel','Series and parallel circuits'),
('science','our-environment','ecosystem-and-food-chains'):('c10-energy-pyramid.svg','Energy pyramid showing 10 percent passing on','10 percent law'),
('science','control-and-coordination','nervous-system'):('c10-reflex-arc.svg','Reflex arc from receptor to effector','Reflex arc'),
('science','acids-bases-and-salts','ph-and-salts'):('c10-ph-scale.svg','pH scale from 0 to 14','pH scale')}
for (s,c,t),(a,alt,cap) in M.items():
    f=f'{ROOT}{s}-{c}-{t}.json'; d=json.load(open(f)); bl=d['lesson']['blocks']
    if any(b['type']=='diagram' for b in bl): continue
    i=[k for k,b in enumerate(bl) if b['type']=='explanation'][0]
    bl.insert(i+1,{"id":"diagram","type":"diagram","provenance":"original","assetKey":a,"altText":{"en":alt},"caption":{"en":cap}})
    json.dump(d,open(f,'w'),indent=2,ensure_ascii=False)
print('ok')
