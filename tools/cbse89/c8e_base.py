import os,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
R=os.path.expanduser('~/mnt/d/Smart Learning Website')
import lib89
lib89.ROOT=R; lib89.CAT=R+'/tools/cbse89/catalog_89.json'
from lib89 import *
def LB(cl,ch,tn,*a,**k):
    lib89.CL=cl
    build('english',ch,tn,*a,**k)
