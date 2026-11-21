/**
 * Blend N7 (issue #165), experimental and off by default: on English pages,
 * plain phrases become the academic word the learner is studying ("get rid
 * of" → eliminate). Same matcher as the Vietnamese rules (it works on any
 * letters); `vi` holds the English phrases here.
 *
 * Rules favour precision over coverage: a plain phrase is listed only when
 * the academic word means the same in the sentence, and phrases with other
 * meanings carry `onlyBefore` / `onlyAfter` / `notAfter` conditions. Verbs and
 * plurals are matched in each form and replaced by the same form ("got rid of"
 * → eliminated). Every rule skips "a"/"an" clashes (`article`).
 *
 * Measured on real English text, see docs/LEXICA_DIAL_EN.md.
 */
import type { DialRule } from './match';

type Guards = Pick<DialRule, 'notBefore' | 'notAfter' | 'onlyAfter' | 'onlyBefore' | 'notAtStart'>;

/** One word or phrase, single form. */
const one = (cardId: string, en: string, vi: string[], g: Guards = {}): DialRule => ({ cardId, en, vi, article: true, ...g });

/** Regular forms of an academic verb: "generate|generates|generated|generating". */
function regular(base: string): string {
    const e = base.endsWith('e');
    const y = /[^aeiou]y$/.test(base);
    return [base, y ? base.slice(0, -1) + 'ies' : base + (/(s|sh|ch|x)$/.test(base) ? 'es' : 's'), e ? base + 'd' : y ? base.slice(0, -1) + 'ied' : base + 'ed', e ? base.slice(0, -1) + 'ing' : base + 'ing'].join('|');
}

/**
 * A verb in four forms (base | -s | past | -ing). `plain` gives the plain
 * phrase in the same four slots, "get rid of|gets rid of|got rid of/gotten rid of|getting rid of"
 * ("/" separates variants of one slot, an empty slot is skipped).
 */
function verb(cardId: string, academic: string, plain: string | string[], g: Guards | Guards[] = {}): DialRule[] {
    const forms = academic.includes('|') ? academic.split('|') : regular(academic).split('|');
    const slots: string[][] = [[], [], [], []];
    for (const p of Array.isArray(plain) ? plain : [plain]) p.split('|').forEach((s, i) => s && slots[i].push(...s.split('/')));
    const guards = Array.isArray(g) ? g : [g, g, g, g];
    return forms.flatMap((en, i) => (slots[i].length ? [one(cardId, en, slots[i], guards[i] ?? {})] : []));
}

/** A noun in singular and plural: "impact|impacts" for "effect|effects". */
function noun(cardId: string, academic: string, plain: string, g: Guards = {}): DialRule[] {
    const [a1, a2] = academic.split('|');
    const [p1, p2] = plain.split('|');
    return [one(cardId, a1, [p1], g), ...(a2 && p2 ? [one(cardId, a2, [p2], g)] : [])];
}

export const DIAL_RULES_EN: DialRule[] = [
    // ---- adjectives and adverbs ----
    one('v001', 'abundant', ['plentiful']),
    one('v312', 'sufficient', ['enough'], { onlyBefore: ['money','time','food','evidence','votes','information','support','funds','resources','water','energy','people','space','room','staff','capital','cash','power','supplies','data','experience','income','protection','sleep','storage','memory','seats','players','troops','workers','jobs','supply','knowledge','reason','reasons','proof','publicity','snow','volunteers','votes','signatures','cover','fuel','oil','capacity','labour','labor','manpower','funding','coverage','security','trust','ammunition','weapons','doctors','nurses','beds','vaccine','vaccines','doses','supporters','members','money'] }),
    one('v329', 'inadequate', ['insufficient']),
    one('v114', 'fundamental', ['basic'], { onlyBefore: ['principles', 'principle', 'rights', 'right', 'concepts', 'concept', 'needs', 'need', 'question', 'questions', 'problem', 'problems', 'change', 'changes', 'differences', 'difference', 'nature', 'issue', 'issues', 'flaw', 'truth', 'idea', 'ideas', 'requirement', 'requirements', 'assumptions', 'assumption', 'building blocks', 'values', 'beliefs', 'freedoms', 'human'] }),
    one('v474', 'accurate', ['precise', 'exact'], { onlyBefore: ['measurement', 'measurements', 'data', 'figures', 'figure', 'number', 'numbers', 'count', 'estimate', 'information', 'description', 'record', 'records', 'calculation', 'calculations', 'results', 'prediction', 'predictions', 'forecast', 'picture', 'account', 'location', 'details', 'amount', 'cost', 'wording', 'copy'] }),
    one('v100', 'comprehensive', ['thorough'], { onlyBefore: ['investigation', 'review', 'analysis', 'examination', 'search', 'study', 'research', 'overhaul', 'understanding', 'inspection', 'assessment', 'report', 'evaluation', 'check', 'audit', 'knowledge', 'testing', 'survey'] }),
    one('v005', 'inevitable', ['unavoidable']),
    one('v007', 'ambiguous', ['unclear'], { onlyBefore: ['meaning', 'wording', 'language', 'statement', 'terms', 'phrase', 'answer', 'message', 'rules', 'instructions', 'terminology', 'definition', 'text', 'law', 'clause'] }),
    one('v011', 'meticulous', ['very careful', 'extremely careful'], { onlyBefore: ['consideration','planning','attention','preparation','selection','work','study','examination','research','inspection','analysis','review','observation','calculation','documentation','craftsmanship','record','records','detail','testing','design','handling','thought'] }),
    one('v130', 'prevalent', ['widespread'], { onlyBefore: ['belief','beliefs','attitude','attitudes','view','views','use','practice','practices','disease','diseases','problem','problems','myth','myths','perception','perceptions','condition','conditions','trend','trends','opinion','opinions','feeling','feelings','assumption','assumptions','culture','habit','habits','fear','sentiment','corruption','poverty','misconception','misconceptions','stereotype','stereotypes','infection','infections','abuse','violence','discrimination','unemployment','illiteracy','obesity','mentality','phenomenon'] }),
    one('v130', 'prevalent', ['widespread'], { onlyAfter: ['is','are','was','were','remains','remain','become','became','very','increasingly','still','also','quite','fairly','relatively','more','less','extremely','so','too','not'] }),
    one('v073', 'massive', ['huge', 'enormous']),
    one('v063', 'cautious', ['careful'], { onlyAfter: ['be', 'been', 'being', 'is', 'are', 'was', 'were', 'remain', 'remains', 'remained', 'become', 'became', 'too', 'more', 'extra'] }),
    one('v086', 'diverse', ['varied'], { onlyBefore: ['range', 'group', 'population', 'community', 'communities', 'backgrounds', 'selection', 'menu', 'landscape', 'collection', 'ecosystem', 'cast', 'team', 'workforce', 'audience', 'views', 'opinions', 'interests', 'cultures', 'habitats', 'species', 'career', 'portfolio', 'diet', 'array', 'mix', 'crowd'] }),
    one('v092', 'ambivalent', ['in two minds'], { onlyBefore: ['about', 'over'] }),
    one('v101', 'contentious', ['controversial'], { onlyBefore: ['issue','issues','decision','decisions','law','laws','topic','subject','debate','proposal','policy','policies','plan','bill','move','measure','claim','claims','remarks','comments','question','matter','reform','reforms','election','practice','practices','ruling','verdict','case','statement','theory','tactic','tactics','project','legislation','amendment','trial','idea','ideas','proposals','plans'] }),
    one('v107', 'detrimental', ['harmful'], { onlyBefore: ['effect', 'effects', 'impact', 'impacts', 'consequences', 'influence', 'to', 'for'] }),
    one('v116', 'implicit', ['unspoken'], { onlyBefore: ['rules', 'assumption', 'assumptions', 'understanding', 'agreement', 'bias', 'message', 'expectations', 'threat', 'criticism', 'trust', 'knowledge'] }),
    one('v117', 'indispensable', ['essential', 'vital'], { onlyBefore: ['to', 'for', 'role', 'part', 'tool', 'tools', 'component', 'ingredient'] }),
    one('v132', 'profound', ['deep'], { onlyBefore: ['impact', 'effect', 'effects', 'influence', 'understanding', 'knowledge', 'sense', 'respect', 'sadness', 'change', 'changes', 'insight', 'meaning', 'impression', 'difference', 'love', 'concern', 'connection', 'appreciation', 'sorrow', 'disappointment', 'sympathy', 'shock', 'gratitude', 'differences', 'regret', 'thought'] }),
    one('v139', 'trivial', ['unimportant']),
    one('v140', 'unprecedented', ['without precedent']),
    one('v134', 'skeptical', ['doubtful'], { onlyBefore: ['about', 'of'] }),
    one('v135', 'spontaneous', ['unplanned'], { onlyBefore: ['visit', 'trip', 'decision', 'moment', 'gathering', 'outburst', 'reaction', 'act', 'acts', 'event', 'party', 'celebration', 'conversation', 'demonstration', 'protest'] }),
    one('v076', 'persistent', ['constant'], { onlyBefore: ['pain', 'problems', 'problem', 'threat', 'criticism', 'questions', 'efforts', 'rumors', 'rumours', 'cough', 'fear', 'demand', 'pressure', 'complaints', 'demands', 'requests', 'symptoms', 'headaches'] }),
    one('v078', 'significant', ['considerable']),
    one('v143', 'acrimonious', ['bitter'], { onlyBefore: ['dispute', 'divorce', 'split', 'row', 'debate', 'argument', 'battle', 'exchange', 'fight', 'feud', 'relationship', 'campaign', 'end', 'breakup', 'custody', 'rivalry'] }),
    one('v145', 'affluent', ['wealthy']),
    one('v147', 'altruistic', ['selfless']),
    one('v152', 'antiquated', ['outdated']),
    one('v153', 'apprehensive', ['uneasy'], { onlyBefore: ['about','of','at'] }),
    one('v158', 'callous', ['heartless']),
    one('v165', 'condescending', ['patronizing', 'patronising']),
    one('v166', 'convoluted', ['overly complicated', 'needlessly complicated']),
    one('v167', 'credulous', ['gullible']),
    one('v175', 'draconian', ['harsh'], { onlyBefore: ['laws', 'law', 'measures', 'penalties', 'punishment', 'punishments', 'rules', 'sentences', 'restrictions', 'regime', 'policies', 'policy', 'sanctions'] }),
    one('v176', 'duplicitous', ['two faced', 'deceitful'], { notAfter: ['off'] }),
    one('v182', 'extraneous', ['irrelevant'], { onlyBefore: ['details','detail','information','factors','factor','variables','material','noise','data','words','elements','content','text','comments','considerations'] }),
    one('v185', 'fervent', ['passionate'], { onlyBefore: ['supporter', 'supporters', 'believer', 'believers', 'advocate', 'advocates', 'fan', 'fans', 'opponent', 'opponents', 'plea', 'belief', 'hope', 'wish', 'desire', 'prayer', 'admirer', 'devotee', 'follower', 'followers', 'campaigner'] }),
    one('v186', 'flagrant', ['blatant']),
    one('v187', 'fleeting', ['short lived']),
    one('v188', 'forthright', ['frank'], { onlyBefore: ['discussion', 'conversation', 'answer', 'opinion', 'assessment', 'manner', 'admission', 'talk', 'account', 'exchange', 'response', 'comments', 'views', 'statement', 'talks'] }),
    one('v189', 'frugal', ['thrifty', 'careful with money']),
    one('v190', 'futile', ['pointless']),
    one('v191', 'gratuitous', ['unnecessary'], { onlyBefore: ['violence', 'cruelty', 'insult', 'insults', 'sex', 'attack', 'attacks', 'detail', 'details'] }),
    one('v196', 'inadvertent', ['unintentional']),
    one('v199', 'inexorable', ['unstoppable'], { onlyBefore: ['rise', 'march', 'decline', 'growth', 'spread', 'advance', 'progress', 'pressure', 'momentum', 'tide', 'trend'] }),
    one('v202', 'irrevocable', ['irreversible'], { onlyBefore: ['decision', 'decisions', 'commitment', 'commitments', 'choice', 'step', 'vow', 'trust', 'consent'] }),
    one('v203', 'lamentable', ['regrettable']),
    one('v204', 'lethargic', ['sluggish', 'listless'], { onlyBefore: ['economy','growth','market','markets','pace','response','recovery','demand','sales','performance','start','trading','activity'] }),
    one('v213', 'nonchalant', ['unconcerned']),
    one('v218', 'ostentatious', ['showy', 'flashy']),
    one('v224', 'polarizing', ['divisive']),
    one('v225', 'pompous', ['self important']),
    one('v227', 'precarious', ['unstable', 'shaky'], { onlyBefore: ['situation', 'position', 'balance', 'existence', 'ground', 'footing', 'economy', 'peace', 'ceasefire', 'truce', 'state'] }),
    one('v245', 'assiduous', ['hard working', 'hardworking']),
    one('v250', 'bellicose', ['warlike']),
    one('v259', 'cloying', ['sickly sweet']),
    one('v260', 'cogent', ['convincing'], { onlyBefore: ['argument', 'arguments', 'case', 'reasoning', 'explanation', 'evidence', 'reason', 'reasons', 'analysis', 'point', 'points', 'rationale', 'answer'] }),
    one('v264', 'craven', ['cowardly']),
    one('v278', 'loquacious', ['talkative']),
    one('v281', 'maladroit', ['clumsy']),
    one('v296', 'onerous', ['burdensome']),
    one('v298', 'parsimonious', ['stingy']),
    one('v319', 'challenging', ['difficult', 'tough'], { onlyBefore: ['task', 'tasks', 'job', 'problem', 'problems', 'situation', 'conditions', 'time', 'times', 'questions', 'project', 'year', 'decision', 'decisions', 'environment', 'test', 'competition', 'climb', 'journey', 'week', 'market'] }),
    one('v321', 'beneficial', ['helpful'], { onlyBefore: ['effect', 'effects', 'for', 'to', 'impact', 'results', 'changes', 'change', 'bacteria', 'influence'] }),
    one('v344', 'brief', ['short'], { onlyBefore: ['statement', 'statements', 'meeting', 'visit', 'stay', 'speech', 'message', 'note', 'summary', 'description', 'period', 'moment', 'pause', 'conversation', 'introduction', 'history', 'overview', 'explanation', 'answer', 'talk', 'delay', 'break', 'trip', 'appearance', 'career', 'time', 'chat', 'email', 'report', 'review'] }),
    one('v348', 'deliberate', ['intentional']),
    one('v351', 'immediate', ['instant'], { onlyBefore: ['response', 'reaction', 'effect', 'effects', 'access', 'relief', 'impact', 'success', 'results', 'answer', 'feedback', 'action', 'attention', 'threat', 'danger'] }),
    one('v352', 'knowledgeable', ['well informed']),
    one('v356', 'reasonable', ['sensible'], { onlyBefore: ['approach', 'decision', 'price', 'prices', 'solution', 'explanation', 'compromise', 'person', 'choice', 'plan', 'amount', 'offer', 'suggestion', 'request', 'level', 'expectations', 'doubt'] }),
    one('v361', 'appropriate', ['suitable']),
    one('v369', 'jealous', ['envious']),
    one('v332', 'optimistic', ['hopeful'], { onlyAfter: ['be','been','being','is','are','was','were','remain','remains','remained','feel','feels','felt','very','quite','more','less','cautiously','guardedly','still','also','so','not','seem','seems','seemed','sound','sounds','looks','look'] }),
    one('v376', 'urgent', ['pressing'], { onlyBefore: ['need', 'needs', 'issue', 'issues', 'problem', 'problems', 'concern', 'concerns', 'matter', 'matters', 'question', 'questions', 'demand'] }),
    one('v383', 'grateful', ['thankful']),
    one('v400', 'eager', ['keen'], { onlyBefore: ['to'] }),
    one('v403', 'hardly', ['barely'], { onlyAfter: ['can','could','cannot','is','are','was','were','be','been','being','would','will','may','might','must','have','has','had','not','even','so','just'], notAfter: ['an','a','one','two','three','four','five','ten','half','the','dawn','enough','audible','visible','legal','alive','conscious','able','twenty','thirty','hours','minutes','days','weeks','seconds','months','years'] }),
    one('v413', 'unique', ['one of a kind']),
    one('v417', 'critical', ['crucial']),
    one('v418', 'delighted', ['very pleased', 'really pleased']),
    one('v419', 'frustrated', ['fed up']),
    one('v425', 'nervous', ['on edge']),
    one('v431', 'trustworthy', ['reliable'], { onlyBefore: ['source', 'sources', 'person', 'partner', 'friend', 'information', 'witness', 'member', 'employee', 'ally', 'people'] }),
    one('v513', 'unexpected', ['surprising'], { onlyAfter: ['is','are','was','were','be','been','being','not','very','so','quite','rather','more','less','most','really','particularly','especially','somewhat','perhaps','hardly','too'] }),
    one('v513', 'unexpected', ['surprising'], { onlyBefore: ['result','results','news','development','developments','turn','twist','discovery','finding','findings','outcome','announcement','move','decision','success','victory','defeat','win','loss','fact','facts','revelation','change','increase','rise','drop','decline','end','ending','response','reaction'] }),
    one('v009', 'tedious', ['boring']),
    one('v123', 'monotonous', ['dull and repetitive']),

    one('v341', 'worthwhile', ['worth it']),
    one('v215', 'oblivious to', ['unaware of']),
    one('v177', 'elusive', ['hard to pin down', 'hard to catch']),
    one('v180', 'exorbitant', ['extremely high', 'far too high', 'way too high', 'unreasonably high'], { onlyBefore: ['prices', 'price', 'fees', 'fee', 'costs', 'cost', 'rent', 'rates', 'interest', 'charges', 'tuition', 'rents'] }),

    one('v078', 'significant', ['major'], { onlyBefore: ['changes','change','impact','role','factor','factors','shift','increase','decline','improvement','progress','step','advance','breakthrough','difference','contribution','challenge','obstacle','concern','concerns','issue','issues','problem','problems','risk','risks','threat','reform','reforms','investment','influence','effect','effects','source','cause','reason','part','decision','decisions','development','developments','impact'] }),
    one('v078', 'significant', ['important'], { onlyBefore: ['role','part','issue','issues','decision','decisions','step','steps','factor','factors','change','changes','difference','point','points','question','questions','contribution','impact','milestone','event','events','source','figure','figures','player','players','test','victory','win','news'] }),
    one('v087', 'evident', ['clear'], { onlyAfter: ['is','was','become','became','remains','remained','seems','seemed','not','also','increasingly','so','quite'], onlyBefore: ['that','whether','how','why','what'] }),
    one('v112', 'formidable', ['strong'], { onlyBefore: ['opponent','opposition','competitor','rival','challenge','foe','obstacle','opponents','competition'] }),
    one('v017', 'candid', ['honest'], { onlyBefore: ['opinion','assessment','answer','conversation','discussion','feedback','account','appraisal','evaluation','talk','view','views','review'] }),
    one('v418', 'delighted', ['very happy', 'really happy'], { onlyAfter: ['be','is','are','was','were','am','been','feel','feels','felt','seems','seemed','looked','looks'], onlyBefore: ['with','about','to','that','for','at'] }),

    one('v061', 'anxious', ['worried'], { onlyAfter: ['is','are','was','were','be','been','am','feel','feels','felt','very','so','quite','really','increasingly','extremely','deeply','also','still','not','become','became','getting','grew','seems','seemed','more','less'], onlyBefore: ['about','that','because','for','by'] }),
    one('v067', 'genuine', ['real'], { onlyBefore: ['interest','concern','concerns','effort','efforts','progress','desire','reason','reasons','opportunity','chance','threat','danger','problem','problems','difference','change','benefit','benefits','risk','risks','fear','fears','feeling','feelings','affection','love','emotion','emotions','passion','commitment','regret','surprise','need','challenge'] }),
    one('v099', 'chronic', ['long term'], { onlyBefore: ['illness','illnesses','condition','conditions','disease','diseases','pain','problem','problems','shortage','unemployment','poverty','fatigue'] }),
    one('v129', 'perpetual', ['endless'], { onlyBefore: ['cycle','state','motion','war','conflict','struggle','debate','delay','delays','search','series','loop'] }),
    one('v141', 'vulnerable', ['defenseless', 'defenceless']),
    one('v154', 'arduous', ['grueling', 'gruelling'], { onlyBefore: ['journey','task','process','schedule','climb','battle','campaign','trek','work','training','race','trip','day','hours','season','negotiations','talks'] }),
    one('v161', 'clandestine', ['secret'], { onlyBefore: ['meeting','meetings','operation','operations','talks','negotiations','deal','deals','plan','plans','mission','agreement','relationship','affair','network','program','programme','recording','payments','trip','visit','facility','prison','prisons','police','society'] }),
    one('v183', 'fallacious', ['false'], { onlyBefore: ['argument','arguments','logic','reasoning','premise','assumption','belief'] }),
    one('v201', 'intransigent', ['uncompromising']),
    one('v212', 'nefarious', ['evil', 'sinister'], { onlyBefore: ['plot','plan','scheme','purposes','deeds','activities','plans','purpose','intentions','motives','ends'] }),
    one('v216', 'ominous', ['threatening'], { onlyBefore: ['sign','signs','clouds','warning','silence','feeling','message','tone','shadow','presence','news'] }),
    one('v357', 'ultimate goal', ['final goal', 'end goal']),

    // ---- nouns ----
    ...noun('v069', 'impact|impacts', 'effect|effects', { onlyAfter: ['positive', 'negative', 'major', 'significant', 'big', 'huge', 'serious', 'lasting', 'direct', 'overall', 'profound', 'harmful', 'beneficial', 'dramatic', 'adverse'], notAfter: ['of'] }),
    ...noun('v172', 'discrepancy|discrepancies', 'mismatch|mismatches', { onlyBefore: ['between', 'in'] }),
    ...noun('v263', 'consternation', 'dismay'),
    ...noun('v249', 'avarice', 'greed'),
    ...noun('v243', 'artifice', 'trickery'),
    ...noun('v301', 'perspective|perspectives', 'point of view|points of view'),
    ...noun('v301', 'perspective|perspectives', 'viewpoint|viewpoints'),
    ...noun('v317', 'significance', 'importance'),
    ...noun('v309', 'estimate|estimates', 'rough guess|rough guesses'),
    ...noun('v309', 'estimate|estimates', 'educated guess|educated guesses'),
    ...noun('v262', 'conflagration|conflagrations', 'huge fire|huge fires'),
    ...noun('v262', 'conflagration|conflagrations', 'massive fire|massive fires'),
    ...noun('v262', 'conflagration|conflagrations', 'big fire|big fires'),

    ...noun('v121', 'a modicum of', 'a small amount of', { onlyBefore: ['respect','success','luck','comfort','dignity','hope','credit','privacy','sanity','normalcy','control','decency','honesty','sympathy','trust','sense','common sense','justice','peace','relief','humor','humour','restraint','courtesy','politeness','fairness','balance','order','stability','independence','freedom','security','satisfaction','credibility','safety','talent','intelligence','effort','knowledge','skill','success'] }),
    ...noun('v121', 'a modicum of', 'a tiny bit of', { onlyBefore: ['respect','success','luck','comfort','dignity','hope','credit','privacy','sanity','normalcy','control','decency','honesty','sympathy','trust','sense','common sense','justice','peace','relief','humor','humour','restraint','courtesy','politeness','fairness','balance','order','stability','independence','freedom','security','satisfaction','credibility','safety','talent','intelligence','effort','knowledge','skill','success'] }),
    ...noun('v121', 'a modicum of', 'a little bit of', { onlyBefore: ['respect','success','luck','comfort','dignity','hope','credit','privacy','sanity','normalcy','control','decency','honesty','sympathy','trust','sense','common sense','justice','peace','relief','humor','humour','restraint','courtesy','politeness','fairness','balance','order','stability','independence','freedom','security','satisfaction','credibility','safety','talent','intelligence','effort','knowledge','skill','success'] }),
    ...noun('v121', 'a modicum of', 'a bit of', { onlyBefore: ['respect','success','luck','comfort','dignity','hope','credit','privacy','sanity','normalcy','control','decency','honesty','sympathy','trust','sense','common sense','justice','peace','relief','humor','humour','restraint','courtesy','politeness','fairness','balance','order','stability','independence','freedom','security','satisfaction','credibility','safety','talent','intelligence','effort','knowledge','skill','success'] }),
    ...noun('v269', 'a dearth of', 'a lack of'),
    ...noun('v269', 'a dearth of', 'a shortage of'),
    ...noun('v426', 'an opportunity to', 'a chance to'),
    ...noun('v426', 'the opportunity to', 'the chance to'),
    ...noun('v193', 'hubris', 'arrogance'),

    // ---- verbs (every form is replaced by the same form) ----
    ...verb('v303', 'collaborate', 'work together|works together|worked together|working together'),
    ...verb('v325', 'eliminate', ['get rid of|gets rid of|got rid of/gotten rid of|getting rid of', 'do away with|does away with|did away with|doing away with']),
    ...verb('v328', 'implement', ['put into practice|puts into practice|put into practice|putting into practice'], [{}, {}, { onlyAfter: ['was', 'were', 'been', 'be', 'is', 'are', 'successfully'] }, {}]),
    ...verb('v328', 'implement', 'carry out|carries out|carried out|carrying out', { onlyBefore: ['the plan', 'a plan', 'the plans', 'the policy', 'the policies', 'reforms', 'the reforms', 'changes', 'the changes', 'the strategy', 'a strategy', 'the measures', 'measures', 'the recommendations', 'the recommendation', 'the programme', 'the program', 'a program', 'the decision', 'the proposal'] }),
    ...verb('v527', 'maintain', 'keep up|keeps up|kept up|keeping up', { onlyBefore: ['the pressure','the good work','the pace','the momentum','the standard','the standards','a high','the level','the effort','the flow','the fight','the work','the rhythm','contact','communication','the facade','the illusion','a steady','a good','the practice','the tradition','the façade'] }),

    ...verb('v491', 'utilize', 'make use of|makes use of|made use of|making use of'),
    ...verb('v146', 'alleviate', 'relieve|relieves||relieving', { onlyBefore: ['pain', 'stress', 'pressure', 'symptoms', 'congestion', 'burden', 'tension', 'anxiety', 'suffering', 'poverty', 'the pain', 'the pressure', 'the burden', 'the symptoms', 'the stress', 'the suffering', 'the shortage', 'shortages', 'discomfort'] }),
    ...verb('v306', 'obtain', 'get hold of|gets hold of|got hold of|getting hold of'),
    ...verb('v088', 'focus on|focuses on|focused on|focusing on', 'concentrate on|concentrates on|concentrated on|concentrating on'),
    ...verb('v032', 'elucidate', 'explain|explains|explained|', [{ onlyAfter: ['to','can','could','will','would','may','might','must','should','cannot','not','help','helps','helped','try','tried','trying','attempt','attempts','attempted'], onlyBefore: ['why','how','what','the','this','these','those','his','her','their','its','our'] }, { onlyAfter: ['that','which','it','this'], onlyBefore: ['why','how','what','the','this','these','those','his','her','their','its','our'] }, { onlyAfter: ['has','have','had','not','been','was','were','be','is','are','being','having','still','yet','never','already','just','also'], onlyBefore: ['why','how','what','the','this','these','those','his','her','their','its','our'] }, {}]),
    ...verb('v018', 'contemplate', 'think about|||', [{ notBefore: ['you','what','do','does','did'], onlyBefore: ['the','a','an','his','her','their','its','my','our','your','what','how','whether','why','these','this','those','taking','doing','trying','leaving','making','buying','running','moving','changing','joining','retiring','quitting','going','starting'] }, {}, {}, {}]),
    ...verb('v018', 'contemplate', '||thought about|thinking about', [{}, {}, { onlyAfter: ['have','has','had','ever','never','often','really','seriously','long','just','already','always'] }, { onlyAfter: ['been','be','is','are','was','were','am','being','also','still','now','just','even','really','seriously','already','keep','kept'], onlyBefore: ['the','a','an','his','her','their','its','my','our','your','what','how','whether','why','taking','doing','trying','leaving','making','buying','running','moving','changing','joining','retiring','quitting','going','starting','it','that','this'] }]),
    ...verb('v023', 'mitigate', ['reduce|reduces|reduced|reducing', 'lessen|lessens|lessened|lessening'], { onlyBefore: ['the risk','risks','the impact','the effects','the effect','the damage','the harm','the threat','the severity','the consequences','the pain','the likelihood','the chances','the danger','the burden','the exposure','the vulnerability','the risks','the threats'] }),
    ...verb('v046', 'ameliorate', 'improve|improves|improved|', { onlyBefore: ['the situation','conditions','the lives','living conditions','the quality','relations','the lot','the plight','health','the lives of','the conditions'] }),
    ...verb('v080', 'utilize', '||used|', [{}, {}, { onlyAfter: ['is','are','was','were','be','been','being'], notAfter: ['to', 'as'] }, {}]),
    ...verb('v306', 'obtain', 'get|gets|got/gotten|getting', { onlyBefore: ['a loan','a permit','a license','a licence','approval','permission','access','information','funding','support','a visa','a patent','a degree','a refund','a copy','a grant','a warrant','a court order','evidence','a mortgage','citizenship','clearance'] }),
    ...verb('v320', 'acquire', 'gain|gains|gained|gaining', { onlyBefore: ['skills','new skills','knowledge','experience','control','a majority','a stake','new knowledge','new experience','expertise','the skills'] }),
    ...verb('v089', 'generate', 'create|creates|created|creating', { onlyBefore: ['revenue', 'income', 'jobs', 'profit', 'profits', 'ideas', 'sales', 'interest', 'employment', 'wealth', 'growth', 'momentum', 'buzz', 'publicity', 'excitement', 'demand', 'leads', 'traffic', 'funds'] }),
    ...verb('v089', 'generate', 'produce|produces|produced|producing', { onlyBefore: ['electricity', 'power', 'energy', 'heat', 'revenue', 'income', 'profit', 'profits', 'results', 'data', 'reports', 'jobs', 'sales'] }),
    ...verb('v090', 'highlight', 'point out|points out|pointed out|pointing out'),
    ...verb('v128', 'perceive as|perceives as|perceived as|perceiving as', ['view as||viewed as|viewing as', 'regard as||regarded as|regarding as']),
    ...verb('v168', 'curtail', 'cut back on|cuts back on|cut back on|cutting back on', [{}, {}, { onlyAfter: ['has', 'have', 'had', 'having'] }, {}]),
    ...verb('v315', 'convince', 'persuade|persuades|persuaded|persuading'),
    ...verb('v320', 'acquire', 'buy|buys|bought|buying', { onlyBefore: ['company', 'companies', 'business', 'firm', 'startup', 'rival', 'stake', 'shares', 'assets', 'rights', 'land', 'property', 'brand', 'chain', 'unit', 'division', 'bank', 'studio'] }),
    ...verb('v320', 'acquire', 'pick up|picks up|picked up|picking up', { onlyBefore: ['new skills', 'new skill', 'skills', 'new knowledge', 'new language', 'new habits', 'new habit', 'new techniques', 'a language'] }),
    ...verb('v343', 'abandon', 'give up on|gives up on|gave up on|giving up on', { onlyBefore: ['the','a','an','his','her','their','its','my','our','your','hope','dreams','them','him','you','me','us','it','this','that','these','those'] }),
    ...verb('v346', 'decline', 'turn down|turns down|turned down|turning down', { onlyBefore: ['the offer', 'an offer', 'offers', 'the invitation', 'an invitation', 'a request', 'the request', 'the proposal', 'a proposal', 'the job', 'the deal', 'his offer', 'her offer', 'their offer'] }),
    ...verb('v347', 'accommodate', 'make room for|makes room for|made room for|making room for'),
    ...verb('v327', 'hinder', ['get in the way of|gets in the way of|got in the way of|getting in the way of', 'stand in the way of|stands in the way of|stood in the way of|standing in the way of']),
    ...verb('v079', 'tolerate', 'put up with|puts up with||putting up with', [{ onlyAfter: ['to', 'can', 'could', 'will', 'would', 'must', 'should', 'may', 'might', 'cannot', 'not'] }, {}, {}, {}]),
    ...verb('v385', 'ignore', ['pay no attention to|pays no attention to|paid no attention to|paying no attention to', 'turn a blind eye to|turns a blind eye to|turned a blind eye to|turning a blind eye to']),
    ...verb('v387', 'manage', 'handle|||', [{ onlyAfter: ['to', 'can', 'could', 'will', 'would', 'must', 'should', 'may', 'might', 'cannot', 'not', 'how'], onlyBefore: ['it', 'this', 'that', 'the situation', 'the problem', 'the crisis', 'the pressure', 'the work', 'the case', 'the issue', 'situations', 'pressure', 'the matter', 'these', 'such'] }, {}, {}, {}]),
    ...verb('v396', 'admit', 'own up to|owns up to|owned up to|owning up to'),
    ...verb('v402', 'gather', 'collect|collects|collected|collecting', { onlyBefore: ['information', 'data', 'evidence', 'facts', 'intelligence', 'signatures', 'feedback', 'opinions', 'samples', 'statistics', 'views'] }),
    ...verb('v407', 'mention', 'bring up|brings up|brought up|bringing up', { onlyBefore: ['the issue', 'the matter', 'the subject', 'the topic', 'the idea', 'the question', 'the possibility', 'it', 'that', 'the fact', 'the name', 'a possibility'] }),
    ...verb('v144', 'admonish', ['tell off|tells off|told off|telling off', 'scold|scolds|scolded|scolding']),
    ...verb('v159', 'capitulate', 'give in|gives in|gave in|giving in', { onlyBefore: ['to'] }),
    ...verb('v160', 'circumvent', 'get around|gets around|got around|getting around', { onlyBefore: ['the rules', 'the rule', 'the law', 'the ban', 'the restrictions', 'the problem', 'sanctions', 'the system', 'the requirement', 'regulations', 'a ban', 'the limit', 'the limits', 'the sanctions', 'the issue', 'the obstacle'] }),
    ...verb('v164', 'concede defeat|concedes defeat|conceded defeat|conceding defeat', 'admit defeat|admits defeat|admitted defeat|admitting defeat'),
    ...verb('v178', 'emulate', 'follow the example of|follows the example of|followed the example of|following the example of'),
].filter((r) => r.vi.some((v) => v));
