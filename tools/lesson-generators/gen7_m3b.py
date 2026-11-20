import sys; sys.path.insert(0,'/tmp/ss-build/tools/lesson-generators')
import os; os.chdir('/tmp/ss-build')
from kit2 import T
M=dict(cls=7,subj="maths",subj_file="maths")
def L(ch,slug,en,story,exp,terms,ex,claim,summ,quiz): T(M,ch,slug,en,story,exp,terms,ex,claim,summ,quiz)
L("expressions-using-letter-numbers","writing-and-substituting-in-expressions","Forming and evaluating expressions","A pen costs 5 rupees. Ravi bought n pens.\n\"I will pay 5n rupees,\" he said.",
 ["A variable is a letter that stands for a number. 5n means 5 times n. n plus 3 means 3 more than n.","To evaluate an expression we put a number in place of the letter. When n is 4, 5n is 20.","Expressions help us write a rule for any number."],
 ["variable","expression","evaluate"],("Evaluate 3n + 2 when n = 4.",[("Replace n with 4.","Substitute."),("3 times 4 is 12.","Multiply."),("12 plus 2 is 14.","Answer.")]),
 ("5n means 5 plus n.",["5n means 5 times n.","Writing letter next to number means multiply."],["Reading it as plus."]),
 ["A letter stands for a number.","Substitute to evaluate."],
 ["m|5n when n = 4|20|9|54|5x4.","t|A variable stands for a number.|T|Yes.","m|3n + 2 when n = 4|14|9|24|Evaluate.","t|5n means 5 plus n.|F|Times.","m|n + 3 when n = 7|10|21|4|Add.","s|2n when n = 6? Write only the number.|12|2x6.","m|Cost of n pens at 5 each|5n|n+5|n-5|Times.","t|Expressions give rules for any number.|T|Yes."])
L("working-with-fractions","products-and-reciprocals-of-fractions","Multiplying and dividing fractions","Mother had 3/4 of a cake and gave half of it to Ravi.\n\"How much did he get?\" asked Anu.",
 ["To multiply fractions multiply the numerators and the denominators. Half of 3/4 is 1/2 times 3/4, which is 3/8.","To divide by a fraction multiply by its reciprocal. 2 divided by 1/4 is 2 times 4, which is 8.","The reciprocal of 3/5 is 5/3."],
 ["reciprocal","numerator","product"],("Find 2/3 of 3/4.",[("Multiply numerators: 2 times 3 is 6.","Top."),("Denominators: 3 times 4 is 12.","Bottom."),("6/12 equals 1/2.","Answer.")]),
 ("to divide by a fraction we divide the numerators.",["We multiply by the reciprocal.","Flip the divisor."],["Wrong rule."]),
 ["Multiply tops and bottoms.","Divide by multiplying the reciprocal."],
 ["m|1/2 x 3/4 =|3/8|4/6|1/4|Multiply.","t|Reciprocal of 3/5 is 5/3.|T|Yes.","m|2 / (1/4) =|8|1/2|6|Flip.","t|To divide by a fraction divide the numerators.|F|Reciprocal.","m|2/3 x 3/4 =|1/2|5/7|6/7|6/12.","s|Reciprocal of 4? Write 1/4.|1/4|Flip.","m|Product means the answer of|multiplication|addition|none|Times.","t|Half of a half is a quarter.|T|Yes."])
L("operations-with-integers","sign-rules-for-products-and-quotients","Multiplying and dividing integers","A diver went down 3 metres every minute for 4 minutes.\n\"That is minus 12 metres,\" said Ravi.",
 ["Multiplying two numbers with different signs gives a negative answer: 3 times minus 4 is minus 12. Multiplying two negatives gives a positive: minus 3 times minus 4 is 12.","Division follows the same sign rule: minus 12 divided by 4 is minus 3 and minus 12 divided by minus 4 is 3.","Zero times any integer is zero."],
 ["positive","negative","product"],("Find (-5) x (-2).",[("Both are negative.","Signs."),("Two negatives make a positive.","Rule."),("5 times 2 is 10.","Answer.")]),
 ("a negative times a negative is negative.",["Two negatives give a positive.","The signs cancel."],["Sign error."]),
 ["Same signs give positive.","Different signs give negative."],
 ["m|3 x (-4) =|-12|12|7|Different signs.","t|(-3) x (-4) = 12.|T|Yes.","m|(-12) / 4 =|-3|3|-8|Negative.","t|A negative times a negative is negative.|F|Positive.","m|(-5) x (-2) =|10|-10|7|Same signs.","s|(-6) / (-3) =? Write only the number.|2|Positive.","m|Zero times any integer is|zero|one|negative|Zero.","t|Division follows the same sign rule.|T|Yes."])