import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
S=dict(cls=7,subj="social-science",subj_file="social-science")
def L(ch,slug,en,story,exp,terms,ex,claim,summ,quiz): T(S,ch,slug,en,story,exp,terms,ex,claim,summ,quiz)
L("india-and-her-neighbours","shared-history-with-neighbouring-countries","Links with neighbouring countries","Raju saw that Buddhist temples in Sri Lanka looked like those in India.\n\"Ideas travelled across seas,\" said his teacher.",
 ["India's neighbours include Nepal, Bhutan, Bangladesh, Sri Lanka, Pakistan, China, Myanmar and Afghanistan. India has shared trade, languages and religions with them for centuries.","Buddhism spread from India to Sri Lanka, Nepal, Tibet, China and South-East Asia. Ancient trade routes like the Silk Road linked India to the wider world.","Today countries cooperate on trade, rivers, travel and culture."],
 ["neighbour","Silk Road","Buddhism"],("How did Buddhism reach other lands?",[("Monks and traders travelled.","Travel."),("Ashoka sent messengers.","Messengers."),("It spread across Asia.","Spread.")]),
 ("India has no neighbours.",["India has several neighbours.","They share history."],["Wrong."]),
 ["India has many neighbours.","Ideas and goods travelled."],
 ["m|Buddhism spread to|Sri Lanka|nowhere|only India|Spread.","t|Trade routes linked India to other regions.|T|Yes.","m|A neighbour of India|Nepal|Brazil|Canada|Near.","t|India has no neighbours.|F|Several.","m|The Silk Road was a|trade route|river|mountain|Route.","s|India's southern island neighbour? One word.|Sri Lanka|Sri Lanka.","m|Countries cooperate on|trade|nothing|only war|Trade.","t|Culture travelled across borders.|T|Yes."])
L("banks-and-the-magic-of-finance","deposits-loans-and-simple-interest","Saving, borrowing and interest","Meena put her pocket money in a bank account.\n\"The bank will add interest,\" said her father.",
 ["A bank keeps our savings safe and pays interest on them. It also lends money to people for homes, farms and business and charges interest on loans.","The money we put in is a deposit. Interest is the extra amount paid for using money. If we deposit 1,000 rupees at 5 percent a year we earn 50 rupees in a year.","The Reserve Bank of India regulates banks. We should keep passwords and PINs secret."],
 ["deposit","interest","loan"],("Find the yearly interest on 1,000 rupees at 5 percent.",[("5 percent of 1,000.","Rate."),("1,000 times 5 divided by 100.","Compute."),("50 rupees.","Answer.")]),
 ("banks give interest only on loans.",["Banks pay interest on deposits.","They charge interest on loans."],["One-way."]),
 ["Banks keep savings and give loans.","Interest is the price of money."],
 ["m|Money put in a bank is a|deposit|loan|bill|Save.","t|Banks pay interest on deposits.|T|Yes.","m|Interest on 1,000 at 5 percent for a year|50|5|500|1000x5/100.","t|Banks give interest only on loans.|F|Both.","m|The Reserve Bank of India|regulates banks|sells toys|grows rice|RBI.","s|Extra money paid on a loan is ___ . One word.|interest|Interest.","m|We should keep our PIN|secret|public|on a note|Safe.","t|Banks lend money.|T|Yes."])
