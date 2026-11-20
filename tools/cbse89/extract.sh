#!/bin/bash
cd "$(dirname "$0")"
B=../../content/books/pdf
for z in $B/class-8/hecu1dd $B/class-8/hees1dd $B/class-8/hees2dd $B/class-8/hegp1dd $B/class-8/hegp2dd $B/class-8/hepr1dd $B/class-9/iebe1dd $B/class-9/iemh1dd $B/class-9/iemh2dd $B/class-9/iesc1dd $B/class-9/iest1dd $B/class-9/iest2dd $B/class-9/ihga1dd; do
  n=$(basename $z); [ -f _text/.done-$n ] && continue
  rm -rf _pdf/$n; mkdir -p _pdf/$n; unzip -oq $z.zip -d _pdf/$n
  for f in $(find _pdf/$n -name '*.pdf'); do pdftotext -layout "$f" _text/$(basename $f .pdf).txt; done
  touch _text/.done-$n; echo done $n >> extract.log
done
echo ALLDONE >> extract.log
