import sys,os; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators'); os.chdir('/tmp/ss-build')
import kit2, textlesson
R={("number-play","magic-squares-and-number-tricks"),("data-handling-and-presentation","mean-median-and-mode"),("data-handling-and-presentation","mean-and-pictographs-bar-graphs"),("perimeter-and-area","area-of-squares-and-rectangles-with-tiles"),("fractions","equivalent-fractions-and-comparing-parts"),("playing-with-constructions","drawing-circles-and-copying-lengths"),("symmetry","mirror-lines-and-turning-symmetry"),("the-other-side-of-zero","integers-on-a-number-line-and-operations"),("diversity-in-the-living-world","parts-of-a-plant"),("mindful-eating-a-path-to-a-healthy-body","food-hygiene-and-deficiency-diseases"),("measurement-of-length-and-motion","speed-and-distance-in-daily-life"),("living-creatures-exploring-their-characteristics","adaptations-of-animals"),("living-creatures-exploring-their-characteristics","food-habits-of-animals"),("beyond-earth","sun-earth-and-moon"),("beyond-earth","phases-of-the-moon")}
oT=kit2.T; ob=textlesson.build
def T(S,ch,slug,*a,**k):
    if S.get('cls')==6 and (ch,slug) in R: oT(S,ch,slug,*a,**k)
def build(spec):
    if spec.get('cls')==6 and (spec.get('ch'),spec.get('topic')) in R: ob(spec)
kit2.T=T; textlesson.build=build
for f in ['gen6_m2','gen6_m3','gen6_m3b','gen6_s2','gen_sci_b6','gen_sci_b3','gen_sci_b7','gen_sci_b1','gen_sci_b5']:
    try: exec(open('/tmp/ss-build/tools/lesson-generators/'+f+'.py').read(),{'__name__':'x'})
    except Exception as e: print(f,'ERR',repr(e)[:150])
