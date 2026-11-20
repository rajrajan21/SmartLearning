import json,sys
p=sys.argv[1]
d=json.load(open(p,encoding='utf8'))
ch=[x for x in d['classes'] if x['classLevel']==5][0]
chap=[c for s in ch['subjects'] if s['slug']=='physical-education' for c in s['chapters'] if c['slug']=='local-and-traditional-games'][0]
for slug,name,obj in [('team-and-field-games','Team and field games (OG 1, 6, 7, 11)','Learn the rules of Nadan Panthu Kali, Damru Relay, Aahwan Kabaddi and Chikka-Chikka'),
 ('circle-games','Circle games (OG 2, 3, 10, 12)','Learn the rules of Attakalam, Jodi Baki, Daicholu and Gocho Paari'),
 ('chase-and-sense-games','Chase and sense games (OG 4, 5, 8, 9)','Learn the rules of Nakal Kho, Mai Bhi Maindhak, Bhukha Sher and Ghar Pehchano')]:
    if not any(t['slug']==slug for t in chap['topics']):
        chap['topics'].append({'slug':slug,'name':{'en':name},'objectives':[{'text':{'en':obj}}]}); print('added',slug)
json.dump(d,open(p,'w',encoding='utf8'),indent=2,ensure_ascii=False)
