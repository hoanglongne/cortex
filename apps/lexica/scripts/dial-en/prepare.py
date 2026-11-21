# Blend N7 (#165): turns three public English corpora into one JSON file for run.mjs.
# The texts are NOT kept in the repo (licences); fetch them from Hugging Face into /tmp/x/en first:
#   wiki.parquet   Salesforce/wikitext   wikitext-103-raw-v1/validation-00000-of-00001.parquet
#   agnews.parquet fancyzhx/ag_news      data/test-00000-of-00001.parquet
#   cnn.parquet    abisee/cnn_dailymail  3.0.0/validation-00000-of-00001.parquet
# Usage: python3 prepare.py   (needs pyarrow)  ->  /tmp/x/en/corpus.json
import pyarrow.parquet as pq, json, re
def clean(t): return re.sub(r'\s+',' ',t).strip()
out={}
# AG News: short news items (title + description)
rows=pq.read_table('/tmp/x/en/agnews.parquet').to_pylist()
out['agnews']=[clean(r['text']) for r in rows]
# CNN/DailyMail: full news articles
rows=pq.read_table('/tmp/x/en/cnn.parquet',columns=['article']).to_pylist()
out['cnn']=[clean(re.sub(r'^.*?\(CNN\)\s*(--)?','',r['article'][:6000])) for r in rows]
# Wikitext-103: encyclopedic paragraphs
rows=pq.read_table('/tmp/x/en/wiki.parquet').to_pylist()
paras=[clean(r['text']) for r in rows if len(r['text'])>400 and not r['text'].lstrip().startswith('=')]
out['wiki']=paras
for k,v in out.items(): print(k,len(v),sum(len(x.split()) for x in v))
json.dump(out,open('/tmp/x/en/corpus.json','w'))
