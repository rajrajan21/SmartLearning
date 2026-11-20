import json
from lib import *
def patch(c,t,story_prefix,add_sents,add_questions=None):
    p=lesson_path('evs',c,t); d=json.load(open(p)); bl=d['lesson']['blocks']
    for b in bl:
        if b['type']=='story' and story_prefix: b['text']['en']=story_prefix+" "+b['text']['en']
        if b['type']=='explanation': b['text']['en']+="\n"+"\n".join(x for x,_ in add_sents)
        if b['type']=='teacher_narration':
            n=len(b['sentences'])
            for i,(x,w) in enumerate(add_sents,1):
                b['sentences'].append({"id":f"t{n+i}","text":T(x),"board":[{"op":"write","text":w}] if w else []})
    json.dump(d,open(p,'w'),indent=2,ensure_ascii=False)
patch('some-unique-places','special-places-of-india',
 "Shanti's parents were busy planning the summer holiday. Shanti asked, 'Could we go to more places instead of staying in one?' Appa and Amma smiled and said they had big plans - a trip to a few different places, starting from the southernmost tip of India. Shanti thought it was Kanyakumari, but it is Indira Point in the Andaman and Nicobar Islands.",
 [("The trip begins at the southernmost tip of India, Indira Point, part of the long chain of islands called the Andaman and Nicobar Islands.","Indira Point"),
  ("An island is land surrounded by water on all sides. There are over a thousand islands in the seas around India that are part of the country.","island"),
  ("Shanti's family began in Sri Vijaya Puram, the capital of the Andaman and Nicobar Islands, and Rani, their local guide, took them through the forest.","Sri Vijaya Puram"),
  ("Many trees there are found only on these islands. Big roots grow out of the bottom of the tree and spread out wide to support it. You can see this with a paper roll: it stands better with paper triangles stuck around its base, just as roots support the tree.","tree roots"),
  ("Birds like the Andaman wood pigeon and the Andaman hornbill are found only on these islands, which makes the forests special and important to protect.","unique birds"),
  ("Before the ferry ride to a nearby island, everyone must wear a life jacket even if they can swim, because it keeps you afloat if you fall into the water.","life jacket")])
patch('earth-our-shared-home','caring-for-our-planet',None,
 [("The logo of the Ministry of Environment, Forest and Climate Change shows the balance between nature and human life. It reminds us that humans and nature are connected and must live in harmony, and caring for the environment means caring for ourselves too.","MoEFCC logo"),
  ("Vasudhaiva Kutumbakam teaches that the whole world is one family. We can live like one big family even when we are different, by respecting, sharing and caring for each other.","Vasudhaiva Kutumbakam"),
  ("Reflect: pick one idea and write a short story of how it travelled from one place to another long ago. Write one way you can care for the Earth. Think of an item that can travel from India to other parts of the world.","reflect"),
  ("Seasons' Journal: at the end of the book there is a journal to make four entries in the year, once every term, observing the same place. Record five themes: plant life, birds and animals, air, heat and light, water and water bodies, and human activities.","Seasons' Journal"),
  ("Simple notes, drawings or something you found can be pasted. The terms are April-June, July-September, October-December and January-March.","four entries")])
