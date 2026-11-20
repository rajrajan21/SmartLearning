from tn import *
import tn_chapters as _t
def S(cls,i,story,paras,terms,qa,false,summ,quiz):
    ch=_t.CLASSES[cls]['social-science'][1][i][0]
    TN(cls,"social-science",ch,story,paras,terms,(qa[0],qa[1]),(false[0],false[1]),summ,quiz)
