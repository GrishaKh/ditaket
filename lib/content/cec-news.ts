import type { Locale } from '@/lib/i18n/routing';

export type CecNewsItem = {
  id: number; // CEC item id, e.g. 2018
  sourceUrl: string; // https://www.elections.am/News/Item/2018
  date: string; // ISO 'YYYY-MM-DD'
  image?: string; // '/news/2018.jpg' (local) | undefined → fallback panel
  featured?: boolean; // exactly one item → hero
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
};

// Newest-first. Curated high-signal news of the 2026 RA parliamentary
// election cycle (June 7, 2026), summarised from elections.am. Routine
// courtesy visits and single-commission vacancy notices are omitted.
export const CEC_NEWS: CecNewsItem[] = [
  {
    id: 2018,
    sourceUrl: 'https://www.elections.am/News/Item/2018',
    date: '2026-06-08',
    image: '/news/2018.jpg',
    featured: true,
    title: {
      am: 'ԿԸՀ-ն վավերացրել է քվեարկության նախնական արդյունքների արձանագրությունը',
      en: 'CEC ratifies the protocol of preliminary voting results',
      ru: 'ЦИК утвердила протокол предварительных результатов голосования',
    },
    summary: {
      am: 'Հունիսի 8-ի արտահերթ նիստում ԿԸՀ-ն վավերացրել է հունիսի 7-ի Ազգային ժողովի ընտրությունների նախնական արդյունքների արձանագրությունը. քվեարկությանը մասնակցել է 1 477 736 ընտրող՝ ցուցակներում ընդգրկված 2 503 981-ից։',
      en: 'At its June 8 extraordinary session the CEC ratified the protocol of the preliminary results of the June 7 National Assembly election; 1,477,736 of the 2,503,981 registered voters took part.',
      ru: 'На внеочередном заседании 8 июня ЦИК утвердила протокол предварительных результатов выборов в Национальное собрание 7 июня; в голосовании приняли участие 1 477 736 из 2 503 981 включённых в списки избирателей.',
    },
  },
  {
    id: 2017,
    sourceUrl: 'https://www.elections.am/News/Item/2017',
    date: '2026-06-08',
    image: '/news/2017.jpg',
    title: {
      am: 'Կենտրոնական ընտրական հանձնաժողովն իրազեկում է',
      en: 'The Central Electoral Commission issues a notice',
      ru: 'Центральная избирательная комиссия информирует',
    },
    summary: {
      am: 'ԿԸՀ-ն հայտնել է քվեարկության արդյունքների վերահաշվարկի և անվավեր ճանաչելու դիմումներ ներկայացնելու ժամկետները (հունիսի 8-ին՝ 12:00–18:00, կամ հունիսի 9-ին՝ 9:00–11:00) և թե ով կարող է դրանք ներկայացնել։',
      en: 'The CEC announced the deadlines for filing applications to recount or invalidate polling-station results (June 8, 12:00–18:00, or June 9, 9:00–11:00) and who may submit them.',
      ru: 'ЦИК сообщила сроки подачи заявлений о пересчёте или признании недействительными результатов на участках (8 июня, 12:00–18:00, либо 9 июня, 9:00–11:00) и кто вправе их подавать.',
    },
  },
  {
    id: 2016,
    sourceUrl: 'https://www.elections.am/News/Item/2016',
    date: '2026-06-07',
    image: '/news/2016.jpg',
    title: {
      am: 'Հայաստանում խորհրդարանական ընտրություններ են',
      en: 'Parliamentary elections are under way in Armenia',
      ru: 'В Армении проходят парламентские выборы',
    },
    summary: {
      am: 'Հունիսի 7-ին բացվել են բոլոր 2005 ընտրատեղամասերը (9-ը՝ ՔԿՀ-ում). ընտրողների էլեկտրոնային գրանցման համար օգտագործվում է 4000 սարք, 1758 տեղամասում տեղադրված են ուղիղ հեռարձակման տեսախցիկներ, իսկ 612 տեղամաս հասանելի է հենաշարժական խնդիր ունեցողների համար։',
      en: 'On June 7 all 2,005 polling stations opened (9 of them in penitentiaries); 4,000 devices are used for electronic voter check-in, 1,758 stations have live-streaming cameras, and 612 stations are accessible to voters with mobility impairments.',
      ru: '7 июня открылись все 2005 избирательных участков (9 — в местах лишения свободы); для электронной регистрации избирателей используются 4000 устройств, на 1758 участках установлены камеры прямой трансляции, а 612 участков доступны для избирателей с ограниченной мобильностью.',
    },
  },
  {
    id: 2015,
    sourceUrl: 'https://www.elections.am/News/Item/2015',
    date: '2026-06-06',
    image: '/news/2015.jpg',
    title: {
      am: 'ԿԸՀ-ն հորդորում է քվեարկության գնալիս թվեր կրող հագուստ չկրել',
      en: 'CEC urges voters not to wear clothing bearing numbers',
      ru: 'ЦИК призывает не надевать на голосование одежду с номерами',
    },
    summary: {
      am: 'ԿԸՀ-ն հիշեցրել է, որ քվեարկության օրը մինչև 20:00-ն նախընտրական քարոզչությունն արգելված է, և հորդորել չկրել այնպիսի հագուստ, որի վրա առկա թիվը կարող է զուգորդվել ընտրություններին մասնակցող քաղաքական ուժի հետ։',
      en: 'The CEC reminded that campaigning is banned until 20:00 on election day and urged people not to wear clothing whose numbers could be associated with a contesting political force.',
      ru: 'ЦИК напомнила, что в день голосования до 20:00 предвыборная агитация запрещена, и призвала не надевать одежду с номерами, которые можно соотнести с участвующей в выборах политической силой.',
    },
  },
  {
    id: 2012,
    sourceUrl: 'https://www.elections.am/News/Item/2012',
    date: '2026-06-04',
    image: '/news/2012.jpg',
    title: {
      am: 'ՏԸՀ անդամներին արգելվում է նախընտրական քարոզչության կազմակերպումն ու իրականացումը',
      en: 'Electoral-commission members are barred from organising or conducting campaigning',
      ru: 'Членам избирательных комиссий запрещено вести предвыборную агитацию',
    },
    summary: {
      am: 'ԿԸՀ-ն հիշեցրել է, որ ընտրական հանձնաժողովների անդամները, թեև կարող են կուսակցական լինել, իրավունք չունեն կազմակերպել կամ իրականացնել նախընտրական քարոզչություն, այդ թվում՝ սոցիալական ցանցերում, և պետք է հեռացնեն քարոզչական հրապարակումները։',
      en: 'The CEC reminded that members of electoral commissions, though they may belong to a party, may not organise or conduct campaigning — including on social media — and must remove campaign posts.',
      ru: 'ЦИК напомнила, что члены избирательных комиссий, даже будучи партийными, не вправе организовывать или вести агитацию, в том числе в соцсетях, и должны удалить агитационные публикации.',
    },
  },
  {
    id: 2010,
    sourceUrl: 'https://www.elections.am/News/Item/2010',
    date: '2026-05-29',
    image: '/news/2010.jpg',
    title: {
      am: 'Քվեաթերթիկների տպագրությանը հետևել ցանկացողները պետք է տեղեկացնեն ԿԸՀ-ին',
      en: 'Those wishing to observe ballot printing must notify the CEC',
      ru: 'Желающие наблюдать за печатью бюллетеней должны уведомить ЦИК',
    },
    summary: {
      am: 'Հունիսի 7-ի ընտրությունների քվեաթերթիկների տպագրությունը մեկնարկել է մայիսի 30-ին «Տիգրան Մեծ» հրատարակչությունում. տպագրությանն ու տեղափոխմանը հետևել ցանկացողները պետք է նախապես դիմեն ԿԸՀ՝ մուտքի թույլտվության համար։',
      en: 'Printing of the June 7 ballots began on May 30 at the "Tigran Mets" publishing house; anyone wishing to observe the printing and transport must apply to the CEC in advance for access.',
      ru: 'Печать бюллетеней для выборов 7 июня началась 30 мая в издательстве «Тигран Мец»; желающие наблюдать за печатью и перевозкой должны заранее обратиться в ЦИК за допуском.',
    },
  },
  {
    id: 2009,
    sourceUrl: 'https://www.elections.am/News/Item/2009',
    date: '2026-05-28',
    image: '/news/2009.jpg',
    title: {
      am: 'ԿԸՀ-ն սահմանել է քվեաթերթիկների նմուշները',
      en: 'CEC approves the ballot samples',
      ru: 'ЦИК утвердила образцы бюллетеней',
    },
    summary: {
      am: 'Մայիսի 28-ի արտահերթ նիստում ԿԸՀ-ն հաստատել է հունիսի 7-ի ընտրություններին մասնակցող 18 կուսակցությունների և դաշինքների քվեաթերթիկների նմուշները և սահմանել քրեակատարողական հիմնարկներում քվեարկության սկիզբը։',
      en: 'At its May 28 extraordinary session the CEC approved the ballot samples of the 18 parties and alliances contesting the June 7 election and set the start times for voting in penitentiaries.',
      ru: 'На внеочередном заседании 28 мая ЦИК утвердила образцы бюллетеней 18 партий и блоков, участвующих в выборах 7 июня, и установила время начала голосования в пенитенциарных учреждениях.',
    },
  },
  {
    id: 2008,
    sourceUrl: 'https://www.elections.am/News/Item/2008',
    date: '2026-05-26',
    image: '/news/2008.jpg',
    title: {
      am: 'ԿԸՀ-ն ուժը կորցրած է ճանաչել ԱԼՅԱՆՍ կուսակցության ընտրական ցուցակի գրանցումը',
      en: 'CEC invalidates the registration of the ALYANS party electoral list',
      ru: 'ЦИК аннулировала регистрацию избирательного списка партии «АЛЬЯНС»',
    },
    summary: {
      am: 'ԱԼՅԱՆՍ առաջադիմական ցենտրիստական կուսակցության ինքնաբացարկից հետո ԿԸՀ-ն ուժը կորցրած է ճանաչել նրա ընտրական ցուցակի գրանցումը. արդյունքում հունիսի 7-ին թիվ 13 քվեաթերթիկ չի լինի։',
      en: 'After the ALYANS Progressive Centrist Party withdrew, the CEC invalidated the registration of its electoral list; as a result there will be no ballot No. 13 on June 7.',
      ru: 'После самоотвода Прогрессивной центристской партии «АЛЬЯНС» ЦИК аннулировала регистрацию её избирательного списка; в результате 7 июня бюллетеня № 13 не будет.',
    },
  },
  {
    id: 2004,
    sourceUrl: 'https://www.elections.am/News/Item/2004',
    date: '2026-05-19',
    image: '/news/2004.jpg',
    title: {
      am: 'ԿԸՀ-ն ուժը կորցրած է ճանաչել պատգամավորի 18 թեկնածուի գրանցումը',
      en: 'CEC invalidates the registration of 18 parliamentary candidates',
      ru: 'ЦИК аннулировала регистрацию 18 кандидатов в депутаты',
    },
    summary: {
      am: 'Մայիսի 19-ի նիստում ԿԸՀ-ն ինքնաբացարկի դիմումների հիման վրա ուժը կորցրած է ճանաչել մի շարք կուսակցությունների ընտրական ցուցակներում ընդգրկված 18 թեկնածուի գրանցումը։',
      en: 'At its May 19 session the CEC, acting on withdrawal requests, invalidated the registration of 18 candidates from the electoral lists of several parties.',
      ru: 'На заседании 19 мая ЦИК на основании заявлений о самоотводе аннулировала регистрацию 18 кандидатов из избирательных списков нескольких партий.',
    },
  },
  {
    id: 2003,
    sourceUrl: 'https://www.elections.am/News/Item/2003',
    date: '2026-05-19',
    image: '/news/2003.jpg',
    title: {
      am: '2 483 520 ընտրող. Միգրացիայի և քաղաքացիության ծառայությունը հրապարակել է ընտրողների թիվը',
      en: '2,483,520 voters: the Migration and Citizenship Service publishes the voter count',
      ru: '2 483 520 избирателей: Служба миграции и гражданства опубликовала число избирателей',
    },
    summary: {
      am: 'Քվեարկության օրվանից 20 օր առաջ՝ մայիսի 18-ին, ՆԳՆ Միգրացիայի և քաղաքացիության ծառայությունը հրապարակել է ընտրողների ռեգիստրում ընդգրկված ընտրողների ընդհանուր թիվը՝ 2 483 520։',
      en: 'Twenty days before election day, on May 18, the Migration and Citizenship Service published the total number of voters in the register: 2,483,520.',
      ru: 'За 20 дней до дня голосования, 18 мая, Служба миграции и гражданства МВД опубликовала общее число избирателей в реестре — 2 483 520.',
    },
  },
  {
    id: 2001,
    sourceUrl: 'https://www.elections.am/News/Item/2001',
    date: '2026-05-16',
    image: '/news/2001.jpg',
    title: {
      am: '2005 ՏԸՀ-ները հրավիրել են իրենց առաջին նիստերը',
      en: 'The 2,005 precinct electoral commissions hold their first sessions',
      ru: '2005 участковых избирательных комиссий провели первые заседания',
    },
    summary: {
      am: 'Մայիսի 16-ին՝ կազմավորումից երեք օր անց, գումարվել են բոլոր 2005 տեղամասային ընտրական հանձնաժողովների առաջին նիստերը, որտեղ անդամները ստորագրել են իրենց իրավունքների ու պարտականությունների ծանուցումը։',
      en: 'On May 16, three days after they were formed, all 2,005 precinct electoral commissions held their first sessions, at which members signed the statement of their rights and duties.',
      ru: '16 мая, через три дня после формирования, все 2005 участковых избирательных комиссий провели первые заседания, на которых члены подписали ознакомление со своими правами и обязанностями.',
    },
  },
  {
    id: 1995,
    sourceUrl: 'https://www.elections.am/News/Item/1995',
    date: '2026-05-08',
    image: '/news/1995.jpg',
    title: {
      am: 'ԿԸՀ նախագահ Վահագն Հովակիմյանը մամուլի ասուլիս է տվել',
      en: 'CEC Chairman Vahagn Hovakimyan holds a press conference',
      ru: 'Председатель ЦИК Ваагн Овакимян провёл пресс-конференцию',
    },
    summary: {
      am: 'Մայիսի 7-ին ԿԸՀ նախագահ Վահագն Հովակիմյանը մամուլի ասուլիսում ներկայացրել է նախընտրական քարոզչության հիմնական կանոնները։',
      en: 'On May 7 CEC Chairman Vahagn Hovakimyan presented the main rules of pre-election campaigning at a press conference.',
      ru: '7 мая председатель ЦИК Ваагн Овакимян на пресс-конференции представил основные правила предвыборной агитации.',
    },
  },
  {
    id: 1994,
    sourceUrl: 'https://www.elections.am/News/Item/1994',
    date: '2026-05-08',
    image: '/news/1994.jpg',
    title: {
      am: 'Ընտրական իրավունք ունի 2 482 872 ՀՀ քաղաքացի',
      en: '2,482,872 citizens of Armenia hold voting rights',
      ru: 'Право голоса имеют 2 482 872 гражданина Армении',
    },
    summary: {
      am: 'Քվեարկության օրվանից 30 օր առաջ ՆԳՆ Միգրացիայի և քաղաքացիության ծառայությունը հրապարակել է ընտրական իրավունք ունեցող քաղաքացիների թիվը՝ 2 482 872։',
      en: 'Thirty days before election day, the Migration and Citizenship Service published the number of citizens holding voting rights: 2,482,872.',
      ru: 'За 30 дней до дня голосования Служба миграции и гражданства опубликовала число граждан с правом голоса — 2 482 872.',
    },
  },
  {
    id: 1992,
    sourceUrl: 'https://www.elections.am/News/Item/1992',
    date: '2026-05-06',
    image: '/news/1992.jpg',
    title: {
      am: 'ԿԸՀ-ն փոխանցել է դիվանագետների և զինծառայողների էլեկտրոնային քվեարկության ծրարները',
      en: 'CEC hands over electronic-voting envelopes for diplomats and service members',
      ru: 'ЦИК передала конверты электронного голосования для дипломатов и военнослужащих',
    },
    summary: {
      am: 'Մայիսի 6-ի արտահերթ նիստում ԿԸՀ-ն փոխանցել է արտերկրում դիվանագիտական ծառայության մեջ գտնվողների և երկարատև գործուղման կամ ուսման մեջ գտնվող զինծառայողների էլեկտրոնային քվեարկության ծրարները. այլ անձինք էլեկտրոնային քվեարկություն չեն իրականացնում։',
      en: 'At its May 6 extraordinary session the CEC handed over the electronic-voting envelopes for diplomats serving abroad and service members on long-term assignment or study; no one else votes electronically.',
      ru: 'На внеочередном заседании 6 мая ЦИК передала конверты электронного голосования для дипломатов за рубежом и военнослужащих в длительной командировке или на учёбе; другие лица электронно не голосуют.',
    },
  },
  {
    id: 1987,
    sourceUrl: 'https://www.elections.am/News/Item/1987',
    date: '2026-05-05',
    image: '/news/1987.jpg',
    title: {
      am: 'ԿԸՀ-ն բաշխել է ՏԸՀ նախագահների ու քարտուղարների պաշտոնները խորհրդարանական ուժերի միջև',
      en: 'CEC distributes precinct-commission chair and secretary posts among parliamentary forces',
      ru: 'ЦИК распределила должности председателей и секретарей участковых комиссий между парламентскими силами',
    },
    summary: {
      am: 'Մայիսի 5-ի արտահերթ նիստում ԿԸՀ-ն «Ընտրություններ» ավտոմատացված համակարգով բաշխել է տեղամասային հանձնաժողովների նախագահների ու քարտուղարների պաշտոնները ԱԺ-ում խմբակցություն ունեցող ուժերի միջև՝ «Քաղաքացիական պայմանագիր»՝ 1331-ական, «Հայաստան» դաշինք՝ 543-ական, «Պատիվ ունեմ» դաշինք՝ 131-ական։',
      en: 'At its May 5 extraordinary session the CEC used the "Elections" automated system to distribute the precinct-commission chair and secretary posts among the parliamentary forces: Civil Contract 1,331 each, the Armenia alliance 543 each, and the Honour (Pativ Unem) alliance 131 each.',
      ru: 'На внеочередном заседании 5 мая ЦИК с помощью автоматизированной системы «Выборы» распределила должности председателей и секретарей участковых комиссий между парламентскими силами: «Гражданский договор» — по 1331, блок «Армения» — по 543, блок «Честь имею» — по 131.',
    },
  },
  {
    id: 1985,
    sourceUrl: 'https://www.elections.am/News/Item/1985',
    date: '2026-05-04',
    image: '/news/1985.jpg',
    title: {
      am: 'ԿԸՀ-ն սահմանել է քարոզչության ժամանակ հեռարձակողների եթերաժամ տրամադրելու կարգը',
      en: 'CEC sets the rules for allocating broadcast airtime during the campaign',
      ru: 'ЦИК установила порядок предоставления эфирного времени вещателями во время агитации',
    },
    summary: {
      am: 'Մայիսի 4-ի արտահերթ նիստում ԿԸՀ-ն սահմանել է, թե ինչպես են հանրային և լիցենզավորված հեռարձակողները նախընտրական քարոզչության ընթացքում մասնակից ուժերին եթերաժամ տրամադրում՝ հավասար պայմաններով, օրենքի պահանջներին համապատասխան։',
      en: 'At its May 4 extraordinary session the CEC set the procedure by which public and licensed broadcasters allocate campaign airtime to contesting forces on equal terms, as the law requires.',
      ru: 'На внеочередном заседании 4 мая ЦИК установила порядок, по которому общественные и лицензированные вещатели предоставляют участвующим силам эфирное время во время агитации на равных условиях согласно закону.',
    },
  },
  {
    id: 1984,
    sourceUrl: 'https://www.elections.am/News/Item/1984',
    date: '2026-05-03',
    image: '/news/1984.jpg',
    title: {
      am: 'ԿԸՀ-ն գրանցել է հերթական ԱԺ ընտրությունների մասնակից կուսակցություններին ու դաշինքներին',
      en: 'CEC registers the parties and alliances contesting the parliamentary election',
      ru: 'ЦИК зарегистрировала партии и блоки — участников парламентских выборов',
    },
    summary: {
      am: 'Մայիսի 3-ի արտահերթ նիստում ԿԸՀ-ն գրանցել է հունիսի 7-ի ընտրությունների մասնակից կուսակցությունների և դաշինքների ընտրական ցուցակները. քվեաթերթիկների հերթականությունը որոշվել է վիճակահանությամբ։',
      en: 'At its May 3 extraordinary session the CEC registered the electoral lists of the parties and alliances contesting the June 7 election; the ballot order was determined by lottery.',
      ru: 'На внеочередном заседании 3 мая ЦИК зарегистрировала избирательные списки партий и блоков, участвующих в выборах 7 июня; очерёдность в бюллетене определена жеребьёвкой.',
    },
  },
  {
    id: 1981,
    sourceUrl: 'https://www.elections.am/News/Item/1981',
    date: '2026-04-30',
    image: '/news/1981.jpg',
    title: {
      am: 'ԿԸՀ-ն գրանցել է դիտորդական առաքելություն իրականացնող կազմակերպություններ',
      en: 'CEC accredits observer-mission organisations',
      ru: 'ЦИК аккредитовала организации наблюдательной миссии',
    },
    summary: {
      am: 'Ապրիլի 30-ի արտահերթ նիստում ԿԸՀ-ն հավատարմագրել է դիտորդական առաքելություն իրականացնող կազմակերպությունների, այդ թվում՝ «Ազատ քվե» միասնական առաքելության և «Ասպարեզ» ժուռնալիստների ակումբի դիմումները։',
      en: 'At its April 30 extraordinary session the CEC accredited observer-mission organisations, including the applications of the joint "Free Vote" mission and the "Asparez" Journalists Club.',
      ru: 'На внеочередном заседании 30 апреля ЦИК аккредитовала организации наблюдательной миссии, в том числе заявки объединённой миссии «Свободный голос» и Клуба журналистов «Аспарез».',
    },
  },
  {
    id: 1980,
    sourceUrl: 'https://www.elections.am/News/Item/1980',
    date: '2026-04-30',
    image: '/news/1980.jpg',
    title: {
      am: 'ԿԸՀ-ն 48 ժամ է տվել կուսակցություններին՝ փաստաթղթերի անճշտություններն ուղղելու համար',
      en: 'CEC gives parties 48 hours to correct inaccuracies in their documents',
      ru: 'ЦИК дала партиям 48 часов на исправление неточностей в документах',
    },
    summary: {
      am: 'Ապրիլի 30-ի նիստում ԿԸՀ-ն օրենքով սահմանված կարգով 48 ժամ է տվել մի շարք առաջադրված կուսակցությունների՝ թերի ներկայացված փաստաթղթերը մինչև մայիսի 2-ի 18:00-ն շտկելու համար։',
      en: 'At its April 30 session the CEC, as the law provides, gave several nominated parties 48 hours — until 18:00 on May 2 — to correct incompletely submitted documents.',
      ru: 'На заседании 30 апреля ЦИК в установленном законом порядке дала ряду выдвинувшихся партий 48 часов — до 18:00 2 мая — на исправление неполно представленных документов.',
    },
  },
  {
    id: 1979,
    sourceUrl: 'https://www.elections.am/News/Item/1979',
    date: '2026-04-29',
    image: '/news/1979.jpg',
    title: {
      am: 'Ամփոփվել են ընտրությունների մասնագիտական դասընթացների ստուգարքների արդյունքները',
      en: 'Results of the professional training exams for election staff are finalised',
      ru: 'Подведены итоги экзаменов профессиональных курсов для организаторов выборов',
    },
    summary: {
      am: 'ԿԸՀ-ն ամփոփել է մարտ–ապրիլ ամիսներին կազմակերպած՝ ընտրությունների անցկացման մասնագիտական դասընթացների ստուգարքների արդյունքները. որակավորման վկայականները հասանելի են մայիսի 1-ից, իսկ արդյունքները կարելի է բողոքարկել յոթ օրվա ընթացքում։',
      en: 'The CEC finalised the results of the professional exams from its March–April training courses for running elections; qualification certificates are available from May 1, and results can be appealed within seven days.',
      ru: 'ЦИК подвела итоги экзаменов по профессиональным курсам организации выборов, проведённым в марте–апреле; квалификационные свидетельства доступны с 1 мая, а результаты можно обжаловать в течение семи дней.',
    },
  },
  {
    id: 1973,
    sourceUrl: 'https://www.elections.am/News/Item/1973',
    date: '2026-04-23',
    image: '/news/1973.jpg',
    title: {
      am: 'ԱԺ հերթական ընտրություններին մասնակցելու համար առաջադրվել է 19 քաղաքական ուժ',
      en: '19 political forces are nominated to contest the parliamentary election',
      ru: 'На парламентских выборах выдвинулись 19 политических сил',
    },
    summary: {
      am: 'Հունիսի 7-ի ընտրություններին մասնակցելու համար ԿԸՀ առաջադրման հայտ է ներկայացրել 19 քաղաքական ուժ. ընտրական ցուցակների գրանցման վերջնաժամկետը մայիսի 3-ն էր։',
      en: 'Nineteen political forces submitted nomination applications to the CEC to contest the June 7 election; the deadline for registering electoral lists was May 3.',
      ru: 'Для участия в выборах 7 июня в ЦИК подали заявки на выдвижение 19 политических сил; крайний срок регистрации избирательных списков — 3 мая.',
    },
  },
  {
    id: 1953,
    sourceUrl: 'https://www.elections.am/News/Item/1953',
    date: '2026-04-03',
    image: '/news/1953.png',
    title: {
      am: 'ԱԺ ընտրություններին ովքե՞ր ունեն ընտրելու իրավունք',
      en: 'Who has the right to vote in the parliamentary election?',
      ru: 'Кто имеет право голосовать на парламентских выборах?',
    },
    summary: {
      am: 'ԿԸՀ-ն և ՆԳՆ Միգրացիայի և քաղաքացիության ծառայությունը մեկնարկել են համատեղ իրազեկման արշավ՝ բացատրելով, թե ով ունի ընտրելու իրավունք և ինչպես վարվել, եթե ընտրողը քվեարկության օրը գտնվում է հաշվառման այլ համայնքում։',
      en: 'The CEC and the Migration and Citizenship Service launched a joint awareness campaign explaining who is eligible to vote and what to do if, on election day, a voter is in a community other than where they are registered.',
      ru: 'ЦИК и Служба миграции и гражданства начали совместную информационную кампанию, разъясняющую, кто имеет право голосовать и как поступить, если в день голосования избиратель находится в другой общине, чем по месту учёта.',
    },
  },
  {
    id: 1947,
    sourceUrl: 'https://www.elections.am/News/Item/1947',
    date: '2026-03-25',
    image: '/news/1947.jpg',
    title: {
      am: 'ԿԸՀ-ն հրավիրել է միջազգային համաժողով',
      en: 'CEC convenes an international conference',
      ru: 'ЦИК провела международную конференцию',
    },
    summary: {
      am: 'Մարտի 25-ին Երևանում ԿԸՀ-ն հրավիրել է միջազգային համաժողով՝ Ընտրական մարմինների համաշխարհային ասոցիացիայի (A-WEB) և այլ ընտրական մարմինների ու միջազգային կազմակերպությունների մասնակցությամբ՝ նվիրված թվային նորարարությանն ու ընտրությունների կառավարման ոլորտում համագործակցությանը։',
      en: 'On March 25 in Yerevan the CEC convened an international conference with the Association of World Election Bodies (A-WEB) and other electoral bodies and international organisations, devoted to digital innovation and cooperation in election management.',
      ru: '25 марта в Ереване ЦИК провела международную конференцию с участием Ассоциации органов по выборам мира (A-WEB) и других избирательных органов и международных организаций, посвящённую цифровым инновациям и сотрудничеству в управлении выборами.',
    },
  },
  {
    id: 1939,
    sourceUrl: 'https://www.elections.am/News/Item/1939',
    date: '2026-03-13',
    image: '/news/1939.jpg',
    title: {
      am: 'Պարզաբանում ընտրողների համար',
      en: 'A clarification for voters',
      ru: 'Разъяснение для избирателей',
    },
    summary: {
      am: 'ԿԸՀ-ն հիշեցրել է, որ Ընտրական օրենսգրքի համաձայն ԱԺ ընտրություններին ընտրելու իրավունք ունեն քվեարկության օրը 18 տարին լրացած ՀՀ քաղաքացիները, և բացատրել, թե ինչպես են ընտրողների ռեգիստրի հիման վրա կազմվում տեղամասային ցուցակները։',
      en: 'The CEC reminded that, under the Electoral Code, citizens of Armenia who turn 18 by election day may vote in the parliamentary election, and explained how precinct voter lists are compiled from the voter register.',
      ru: 'ЦИК напомнила, что по Избирательному кодексу на парламентских выборах вправе голосовать граждане Армении, которым на день голосования исполнилось 18 лет, и разъяснила, как на основе реестра избирателей составляются участковые списки.',
    },
  },
  {
    id: 1937,
    sourceUrl: 'https://www.elections.am/News/Item/1937',
    date: '2026-03-12',
    image: '/news/1937.jpg',
    title: {
      am: 'IRI-ի հարցման արդյունքները ներկայացվել են ԿԸՀ-ում',
      en: 'IRI survey results are presented at the CEC',
      ru: 'Результаты опроса IRI представлены в ЦИК',
    },
    summary: {
      am: 'Մարտի 12-ին ԿԸՀ-ում ներկայացվել են Միջազգային հանրապետական ինստիտուտի (IRI) փետրվարյան հետազոտության արդյունքները. հեռախոսային հարցումն ընդգրկել է 1506 քաղաքացու և ներառել առաջիկա ԱԺ ընտրություններին վերաբերող հարցեր։',
      en: 'On March 12 the results of the February study by the International Republican Institute (IRI) were presented at the CEC; the phone survey covered 1,506 citizens and included questions about the upcoming parliamentary election.',
      ru: '12 марта в ЦИК представили результаты февральского исследования Международного республиканского института (IRI); телефонный опрос охватил 1506 граждан и включал вопросы о предстоящих парламентских выборах.',
    },
  },
  {
    id: 1934,
    sourceUrl: 'https://www.elections.am/News/Item/1934',
    date: '2026-03-11',
    image: '/news/1934.jpg',
    title: {
      am: 'ԿԸՀ-ն անդրադարձել է բարեգործական գործունեության սահմանափակումներին',
      en: 'CEC addresses the limits on charitable activity',
      ru: 'ЦИК рассмотрела ограничения на благотворительную деятельность',
    },
    summary: {
      am: 'Մարտի 11-ի նիստում ԿԸՀ-ն, ի պատասխան մի շարք դիմումների, անդրադարձել է ընտրական ժամանակահատվածում բարեգործության սահմանափակումներին. Ընտրական օրենսգրքի համաձայն դրանք գործում են ընտրությունների նշանակումից մինչև արդյունքների ամփոփումն ընկած ժամանակում։',
      en: 'At its March 11 session, responding to several inquiries, the CEC addressed the restrictions on charitable activity during the electoral period; under the Electoral Code they apply from the calling of elections until the results are finalised.',
      ru: 'На заседании 11 марта ЦИК в ответ на ряд обращений рассмотрела ограничения на благотворительную деятельность в избирательный период; по Избирательному кодексу они действуют с момента назначения выборов до подведения итогов.',
    },
  },
  {
    id: 1933,
    sourceUrl: 'https://www.elections.am/News/Item/1933',
    date: '2026-03-11',
    image: '/news/1933.jpg',
    title: {
      am: 'ԿԸՀ նախագահը ներկայացրել է Ընտրական օրենսգրքի՝ ուժի մեջ մտած փոփոխությունները',
      en: 'CEC Chairman presents the Electoral Code amendments now in force',
      ru: 'Председатель ЦИК представил вступившие в силу изменения Избирательного кодекса',
    },
    summary: {
      am: 'Մարտի 11-ին ԿԸՀ նախագահ Վահագն Հովակիմյանը ներկայացրել է ընտրություններում նոր կիրառվող դրույթները՝ կուսակցությունների 4% և դաշինքների 8–10% անցողիկ շեմ, 7,5 մլն դրամ (կուսակցություն) և 15 մլն դրամ (դաշինք) ընտրական գրավ, ինչպես նաև կոալիցիա կազմավորելու սկզբունքները։',
      en: 'On March 11 CEC Chairman Vahagn Hovakimyan presented the provisions newly applied at this election: a 4% threshold for parties and 8–10% for alliances, an electoral deposit of 7.5 million drams for parties and 15 million for alliances, and the rules for forming a coalition.',
      ru: '11 марта председатель ЦИК Ваагн Овакимян представил новые применяемые на этих выборах нормы: проходной барьер 4% для партий и 8–10% для блоков, избирательный залог 7,5 млн драмов для партий и 15 млн для блоков, а также принципы формирования коалиции.',
    },
  },
  {
    id: 1927,
    sourceUrl: 'https://www.elections.am/News/Item/1927',
    date: '2026-02-24',
    image: '/news/1927.jpg',
    title: {
      am: 'ԿԸՀ-ն սահմանել է կուսակցությունների ու դաշինքների գրանցման փաստաթղթերի օրինակելի ձևերը',
      en: 'CEC approves the model documents for registering parties and alliances',
      ru: 'ЦИК утвердила образцы документов для регистрации партий и блоков',
    },
    summary: {
      am: 'Փետրվարի 24-ի արտահերթ նիստում ԿԸՀ-ն սահմանել է ԱԺ ընտրություններին մասնակցող կուսակցությունների ու դաշինքների ընտրական ցուցակների գրանցման փաստաթղթերի օրինակելի ձևերը. ցուցակի առաջին 30 թեկնածուն պետք է հաստատվի համագումարի որոշմամբ։',
      en: 'At its February 24 extraordinary session the CEC approved the model document forms required to register the electoral lists of parties and alliances; the first 30 candidates on a list must be confirmed by a party congress decision.',
      ru: 'На внеочередном заседании 24 февраля ЦИК утвердила образцы документов для регистрации избирательных списков партий и блоков; первые 30 кандидатов списка должны быть утверждены решением съезда.',
    },
  },
  {
    id: 1926,
    sourceUrl: 'https://www.elections.am/News/Item/1926',
    date: '2026-02-23',
    image: '/news/1926.jpg',
    title: {
      am: 'Ընտրողները կարող են ժամանակավորապես փոխել իրենց ընտրական տեղամասը',
      en: 'Voters may temporarily change their polling station',
      ru: 'Избиратели могут временно сменить свой избирательный участок',
    },
    summary: {
      am: 'ԱԺ ընտրություններին ընդառաջ ընտրողները կարող են մինչև մայիսի 26-ի 14:00-ն ՆԳՆ Միգրացիայի և քաղաքացիության ծառայության միջոցով ժամանակավորապես անցնել ըստ գտնվելու վայրի տեղամասի ցուցակ՝ էլեկտրոնային կամ թղթային դիմումով։',
      en: 'Ahead of the parliamentary election, voters may — until 14:00 on May 26 — apply through the Migration and Citizenship Service, electronically or on paper, to be temporarily moved to the voter list of their current location.',
      ru: 'В преддверии парламентских выборов избиратели могут до 14:00 26 мая через Службу миграции и гражданства — электронно или на бумаге — временно перейти в список участка по месту нахождения.',
    },
  },
  {
    id: 1924,
    sourceUrl: 'https://www.elections.am/News/Item/1924',
    date: '2026-02-09',
    image: '/news/1924.jpg',
    title: {
      am: 'ԿԸՀ-ն հաստատել է ընտրությունների հիմնական գործողությունների ժամանակացույցը',
      en: 'CEC approves the timetable of the main election actions',
      ru: 'ЦИК утвердила график основных мероприятий выборов',
    },
    summary: {
      am: 'Փետրվարի 9-ի արտահերթ նիստում ԿԸՀ-ն հաստատել է հունիսի 7-ին նշանակված ԱԺ ընտրությունների նախապատրաստման ժամանակացույցը. կուսակցությունները փաստաթղթերը ներկայացնում են ապրիլի 13–23-ին, իսկ գրանցումը՝ դրանից հետո։',
      en: 'At its February 9 extraordinary session the CEC approved the timetable for preparing the June 7 parliamentary election; parties submit documents on April 13–23, with registration to follow.',
      ru: 'На внеочередном заседании 9 февраля ЦИК утвердила график подготовки назначенных на 7 июня парламентских выборов; партии подают документы 13–23 апреля, после чего следует регистрация.',
    },
  },
  {
    id: 1918,
    sourceUrl: 'https://www.elections.am/News/Item/1918',
    date: '2026-01-19',
    image: '/news/1918.jpg',
    title: {
      am: 'ԿԸՀ-ն փոփոխել է դիտորդների հավատարմագրման կարգը',
      en: 'CEC revises the procedure for accrediting observers',
      ru: 'ЦИК изменила порядок аккредитации наблюдателей',
    },
    summary: {
      am: 'Հունվարի 19-ի արտահերթ նիստում ԿԸՀ-ն հաստատել է դիտորդների և այցելուների հավատարմագրման նոր կարգ, այդ թվում՝ միջազգային դիտորդների համար անհրաժեշտ փաստաթղթերի և տվյալների առցանց ներկայացման կարգը։',
      en: 'At its January 19 extraordinary session the CEC adopted a new procedure for accrediting observers and visitors, including the required documents and an online system for submitting data, including for international observers.',
      ru: 'На внеочередном заседании 19 января ЦИК утвердила новый порядок аккредитации наблюдателей и гостей, включая необходимые документы и онлайн-систему подачи данных, в том числе для международных наблюдателей.',
    },
  },
  {
    id: 1916,
    sourceUrl: 'https://www.elections.am/News/Item/1916',
    date: '2026-01-14',
    image: '/news/1916.jpg',
    title: {
      am: 'Մեկնարկել է «Մատչելի ընտրություններ» աշխատաժողովը',
      en: 'The "Accessible Elections" workshop is launched',
      ru: 'Дан старт семинару «Доступные выборы»',
    },
    summary: {
      am: 'Հունվարի 14-ին ԿԸՀ-ն ՄԱԶԾ ARTEMIS ծրագրի շրջանակում մեկնարկել է «Մատչելի ընտրություններ» աշխատաժողովը. նախագահ Վահագն Հովակիմյանը նշել է, որ ընտրական գործընթացների մատչելիությունը ԿԸՀ առաջնահերթություններից է։',
      en: 'On January 14 the CEC launched the "Accessible Elections" workshop under the UNDP ARTEMIS programme; Chairman Vahagn Hovakimyan said that the accessibility of electoral processes is a priority for the CEC.',
      ru: '14 января ЦИК в рамках программы ПРООН ARTEMIS дала старт семинару «Доступные выборы»; председатель Ваагн Овакимян отметил, что доступность избирательных процессов — приоритет для ЦИК.',
    },
  },
];
