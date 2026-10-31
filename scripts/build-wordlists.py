#!/usr/bin/env python3
"""
Builds the two word lists the Nối chuỗi game uses (apps/lexica/public):
  words-en.txt      every single-word English lemma in WordNet (does this word exist?)
  words-common.txt  the 10,000 most common English words (what the computer plays)
Run: python3 scripts/build-wordlists.py
WordNet is in node_modules (wordnet-db); the common list is google-10000-english (MIT).
"""
import glob, re, urllib.request, os
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
dict_dir = glob.glob(os.path.join(root, 'node_modules/.pnpm/wordnet-db@*/node_modules/wordnet-db/dict'))[0]
words = set()
for kind in ('noun', 'verb', 'adj', 'adv'):
    for line in open(os.path.join(dict_dir, f'index.{kind}'), encoding='utf8'):
        if line.startswith('  '): continue
        w = line.split(' ', 1)[0]
        if re.fullmatch(r'[a-z]{2,15}', w): words.add(w)
out = os.path.join(root, 'apps/lexica/public')
open(os.path.join(out, 'words-en.txt'), 'w').write('\n'.join(sorted(words)) + '\n')
url = 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt'
common = [w.strip() for w in urllib.request.urlopen(url, timeout=30).read().decode().split() if re.fullmatch(r'[a-z]{3,10}', w.strip())]
open(os.path.join(out, 'words-common.txt'), 'w').write('\n'.join(common) + '\n')
print(len(words), 'words,', len(common), 'common')
