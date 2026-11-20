from lib import *
M=mcq;F=tf;S=short;N=num
R="T, A, P.E., A, M, P.E., L, L, P.E., A, T, M, A, P.E., P.E., T, P.E., M, L, P.E., P.E., A, M, A, L, P.E., M, T, A, T, M, M, P.E., A, L, M, L, P.E., A, T, L, M, M, T, L".split(', ')
assert len(R)==45
from collections import Counter
c=Counter(R); m,l,t,p,a=c['M'],c['L'],c['T'],c['P.E.'],c['A']; assert m+l+t+p+a==45
names=[('Mathematics',m,'#e67e22'),('Languages',l,'#2980b9'),('The World Around Us',t,'#27ae60'),('Physical Education',p,'#c0392b'),('Arts',a,'#8e44ad')]
b='<text x="10" y="22" font-weight="bold">Favourite subject of 45 children</text>'
for i,(n,v,col) in enumerate(names):
    y=40+i*34; b+=f'<text x="10" y="{y+18}">{n}</text><rect x="190" y="{y}" width="{v*20}" height="24" fill="{col}"/><text x="{196+v*20}" y="{y+18}">{v}</text>'
svgfile('c4-maths-fav-subject-bar.svg',460,220,b)
top=max(names,key=lambda x:x[1]); low=min(names,key=lambda x:x[1]); print(c,top[0],low[0])
chapter(4,'maths','data-handling','Data Handling',
 ('Which subject do we like most?','Rohan and Anjali want to find out which subject their class likes the most. They make a question, ask 45 children, record every answer and then make sense of the answers. This is called handling data.'),
 [('Asking a good question',['To find the most liked subject, the question must ask for one choice, such as Which subject do you like the most?','A question like Which subjects do you like? lets a child tick many subjects, so we cannot tell which is liked most.','The words of a question matter, and we choose them carefully.']),
  ('Recording the responses',['Anjali and Rohan wrote M for Mathematics, L for Languages, T for The World Around Us, A for Arts and P.E. for Physical Education.','They recorded the 45 responses one by one in a list. This list is called raw data.',f'Counting the letters gives Mathematics {m}, Languages {l}, The World Around Us {t}, Physical Education {p} and Arts {a}, and these add up to 45, the number of children in the grade.']),
  ('Tables and pictures',[f'A table with the subject and the number of children is easier to read than a long list. The most liked subject is {top[0]} with {top[1]} children, and the least liked is {low[0]} with {low[1]}.','A bar picture shows the same facts with bars: the longer the bar, the more children chose that subject.','The same idea works for the colourful golas: record which colour each child eats, count, and the colour with the most votes is the most eaten.','We always check that the numbers in the table add up to the number of children asked.'])],
 [('The list has 45 responses. How do we count how many children like Languages?',[('Go through the list and count every L.','Count one subject at a time.'),(f'There are {l} L\'s, so {l} children like Languages.','Write the count in the table.')]),
  ('How do we check that the table is correct?',[('Add all the numbers in the table.',f'{m} + {l} + {t} + {p} + {a}.'),('The total is 45, the same as the number of children asked, so the counts are right.','If it does not match, count again.')])],
 ('Explain how to collect, record and show data about favourite subjects.',['Ask one clear question','Record answers, count, make a table','Show with bars and read the most and least'],['Any question will do']),
 ['Ask a clear question to collect data.','Count responses and write them in a table.','A bar picture shows the most and the least.'],
 [N('1',1,'How many children like Mathematics the most?',m,'Count the M\'s in the 45 responses.',[(m+1,'Check by counting again')]),
  N('2',1,'How many children were asked in all?',45,'The list has 45 responses, one for each child in the grade.',[(5,'That is the number of subjects')]),
  F('3',1,'The question Which subjects do you like? is best for finding the most liked subject.',False,'It lets a child pick many subjects, so we cannot see which is liked most.'),
  M('4',2,'Which subject is liked by the most children?',top[0],[(n,f'{n} has fewer children') for n,v,_ in names if n!=top[0]][:2],f'{top[0]} has {top[1]} votes, the highest.'),
  M('5',2,'Which subject is liked by the fewest children?',low[0],[(n,f'{n} has more children') for n,v,_ in names if n!=low[0]][:2],f'{low[0]} has {low[1]} votes, the lowest.'),
  N('6',2,'How many children like Physical Education the most?',p,'Count the P.E. entries in the list.',[(p+1,'Check by counting again')]),
  F('7',3,'The counts in the table must add up to the number of children asked.',True,f'{m} + {l} + {t} + {p} + {a} = 45.'),
  S('8',3,'What do we call the list of recorded answers before it is counted? (hint: raw ...)',['data','raw data'],'The recorded answers are data, and we organise them in a table.')],
 svgs=[('c4-maths-fav-subject-bar','Bar chart of favourite subjects','Longer bar means more children')])
