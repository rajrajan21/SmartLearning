#!/bin/bash
# usage: pack.sh N ; reads chapters from tools/c67/deep/done.txt lines "class subj slug"
cd "$HOME/mnt/d/Smart Learning Website"; : > /tmp/deepfiles.txt
while read c s g; do
  echo "content/lessons/cbse-$c-$s-$g-whole-chapter.json" >> /tmp/deepfiles.txt
  echo "content/questions/cbse-$c-$s-$g-whole-chapter.json" >> /tmp/deepfiles.txt
done < tools/c67/deep/done.txt
ls apps/web/public/assets/lessons/c7-maths-*.svg apps/web/public/assets/lessons/c6-maths-*.svg apps/web/public/assets/lessons/c[67]-science-*.svg 2>/dev/null >> /tmp/deepfiles.txt
ls tools/c67/deep/*.py tools/c67/deep/*.sh tools/c67/deep/done.txt >> /tmp/deepfiles.txt
tar czf _to_delete/sync-cbse67-deep-$1.tgz -T /tmp/deepfiles.txt && wc -l /tmp/deepfiles.txt
