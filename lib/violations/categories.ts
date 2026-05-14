/**
 * Violation categories — verified against the OFFICIAL Electoral Code of the
 * Republic of Armenia (Constitutional Law, English translation 2018; source:
 * translation-centre.am/pdf/Translat/HH_Codes/Electoral_Code_04052018_en.pdf).
 *
 * Each `ecArticle` cites article number + paragraph number per the Code's own
 * "Article N, part M" format. Verified May 2026.
 *
 * Severity 1..5 (5 = most serious).
 */
export const VIOLATION_CATEGORIES = [
  {
    id: 'multiple_in_booth',
    labelAm: 'Մեկից ավելի մարդ քվեախցիկում',
    labelEn: 'Multiple people in voting booth',
    labelRu: 'Несколько человек в кабине для голосования',
    descriptionAm:
      'Քվեախցիկում միաժամանակ ներկա է մեկից ավելի անձ։ Հոդված 67(9) համաձայն՝ բացառությամբ ընտրողին օգնող մեկ անձի (որը պետք է հանձնաժողովի անդամ, դիտորդ կամ ԶԼՄ ներկայացուցիչ չլինի), քվեախցիկում այլ անձի ներկայությունն արգելվում է։ Հոդված 6-ը երաշխավորում է քվեի գաղտնիությունը։',
    descriptionEn:
      'More than one person inside the voting booth at the same time. Per Article 67(9), the presence of another person in the booth is prohibited except for ONE permitted helper for a voter who cannot mark the ballot independently (the helper must not be a commission member, observer, or media). Article 6 guarantees secrecy of vote.',
    descriptionRu:
      'Более одного человека в кабине одновременно. По статье 67(9) присутствие постороннего в кабине запрещено, кроме одного помощника избирателя, который не может физически заполнить бюллетень (помощник не может быть членом комиссии, наблюдателем или представителем СМИ). Статья 6 гарантирует тайну голосования.',
    ecArticle: 'Art. 6 · Art. 67(9)',
    severity: 4,
    sortOrder: 10,
  },
  {
    id: 'ballot_stuffing',
    labelAm: 'Քվեատուփի «լցոնում»',
    labelEn: 'Ballot stuffing',
    labelRu: 'Вброс бюллетеней',
    descriptionAm:
      'Քվեատուփի մեջ բազմակի ծրարների գցում մեկ շարժմամբ, ինչպես նաև Հոդված 67(7)-ով սահմանված ընթացակարգի շրջանցում (ընտրողը չի մոտեցել ստեղնահարված տալով՝ ինքնասոսնձվող դրոշմը չի դրվել ծրարի վրա)։ Հաշվման ժամանակ պարզվող անհամապատասխանությունները կարգավորվում են Հոդված 68-ով։',
    descriptionEn:
      'Multiple envelopes dropped into the ballot box in a single motion, or any bypass of the strict procedure in Article 67(7) (commission member must affix a self-adhesive stamp through the cut in the ballot envelope before the elector drops it in). Discrepancies surface during the count procedure of Article 68.',
    descriptionRu:
      'Несколько конвертов опускаются в урну за одно движение, либо обход строгой процедуры по статье 67(7) (член комиссии должен поставить самоклеящийся штамп через прорезь конверта перед опусканием). Несоответствия выявляются при подсчёте по статье 68.',
    ecArticle: 'Art. 67(7) · Art. 68',
    severity: 5,
    sortOrder: 20,
  },
  {
    id: 'carousel_voting',
    labelAm: 'Մեկ ուրիշի անունից քվեարկություն',
    labelEn: 'Carousel voting / voting in another person’s name',
    labelRu: 'Голосование вместо другого лица («карусель»)',
    descriptionAm:
      'Քվեարկություն մեկ այլ անձի անունից, օտար փաստաթղթով, կամ նույն մարդու բազմակի քվեարկում տարբեր տեղամասերում։ Հոդված 66(2)-ը հստակ սահմանում է՝ «Ընտրողը մասնակցում է քվեարկությանը անձամբ. վստահված անձի միջոցով քվեարկությունն արգելված է»։ Հոդված 48-ը սահմանում է «մեկ ուրիշի փոխարեն քվեարկության» հետ կապված դիմումների քննման ընթացակարգը։',
    descriptionEn:
      'Voting in someone else’s name, with another person’s document, or the same individual voting at multiple stations. Article 66(2) explicitly states: "An elector shall participate in voting in person; proxy voting shall be prohibited." Article 48 governs the procedure for complaints about "voting instead of another person".',
    descriptionRu:
      'Голосование от имени другого человека, по чужому документу, либо повторное голосование одного лица на разных участках. Статья 66(2) прямо устанавливает: «Избиратель участвует в голосовании лично; голосование через представителя запрещено». Статья 48 регулирует процедуру рассмотрения заявлений о голосовании вместо другого лица.',
    ecArticle: 'Art. 48 · Art. 66(2)',
    severity: 5,
    sortOrder: 25,
  },
  {
    id: 'crowding_50m',
    labelAm: 'Անարտոնված հավաք 50 մ գոտում',
    labelEn: 'Unauthorized gathering within 50m perimeter',
    labelRu: 'Несанкционированное скопление в 50-метровой зоне',
    descriptionAm:
      'Հոդված 22(3) համաձայն՝ քվեարկության օրը տեղամասին հարակից 50 մ շառավղով խմբային հավաքներն ու ավտոմեքենաների կուտակումներն արգելված են։ Քվեարկող քաղաքացիների սովորական հերթը չի համարվում խախտում։ Հոդված 67(13) արգելում է թեկնածուներին գտնվել տեղամասում կամ 50 մ շառավղում (բացառությամբ քվեարկելու)։',
    descriptionEn:
      'Per Article 22(3), assembling in groups within a 50-metre radius of a polling station — and clusters of vehicles near the entrance — are prohibited on voting day. The normal queue of voters is NOT a violation. Article 67(13) prohibits candidates from being inside the station or within the 50m radius (except to vote themselves).',
    descriptionRu:
      'По статье 22(3), скопление групп в радиусе 50 метров от участка и сосредоточение транспорта у входа в день голосования запрещены. Обычная очередь избирателей нарушением не является. Статья 67(13) запрещает кандидатам находиться на участке или в 50-метровой зоне (кроме самого голосования).',
    ecArticle: 'Art. 22(3) · Art. 67(13)',
    severity: 3,
    sortOrder: 30,
  },
  {
    id: 'repeated_assistant',
    labelAm: 'Կրկնվող «օգնող» անձ',
    labelEn: 'Repeated voter-assistance violation',
    labelRu: 'Повторный «помощник» избирателя',
    descriptionAm:
      'Հոդված 67(9)-ը հստակ նշում է. «Անձը իրավունք ունի օգնել միայն մեկ ընտրողի, որը չի կարող ինքնուրույն լրացնել քվեաթերթը»։ Մեկ անձի կողմից մի քանի ընտրողի «օգնելը» քվեախցիկում խախտում է այս կանոնը։ Օգնողի տվյալները պետք է գրանցվեն հանձնաժողովի մատյանում։',
    descriptionEn:
      'Article 67(9) explicitly states: "The person shall have the right to assist only ONE elector who is unable to fill in the ballot paper on his or her own." If the same person enters the booth to "help" multiple voters during the day, this rule is violated. The helper’s identity must be recorded in the precinct registration book.',
    descriptionRu:
      'Статья 67(9) прямо устанавливает: «Помощник имеет право помочь только ОДНОМУ избирателю, неспособному заполнить бюллетень самостоятельно». Если один и тот же человек входит в кабину «помогать» нескольким избирателям в течение дня — это нарушение. Личность помощника фиксируется в регистрационной книге участка.',
    ecArticle: 'Art. 67(9)',
    severity: 4,
    sortOrder: 40,
  },
  {
    id: 'ballot_photograph',
    labelAm: 'Քվեաթերթի լուսանկարում',
    labelEn: 'Ballot photography',
    labelRu: 'Фотографирование бюллетеня',
    descriptionAm:
      'Քվեախցիկում քվեաթերթի լուսանկարում հեռախոսով։ Հոդված 6-ը արգելում է վերահսկողություն ընտրողի կամքի ազատ արտահայտման վրա, իսկ Հոդված 67(11)-ը նշում է. «Ընտրողն իրավունք չունի տեղամասում հայտնել, թե ինչպես է քվեարկել»։ Քվեաթերթի լուսանկարը հաճախ օգտագործվում է ձայների գնման սխեմաներում որպես «ապացույց»։',
    descriptionEn:
      'Photographing a marked ballot inside the booth (typically by phone). Article 6 prohibits any control over the free expression of will of an elector; Article 67(11) states: "The elector shall not have the right to announce in the polling station the way he or she has voted." Ballot photos are a common "proof" device in vote-buying schemes.',
    descriptionRu:
      'Фотографирование заполненного бюллетеня в кабине (обычно на телефон). Статья 6 запрещает любой контроль над свободным выражением воли избирателя; статья 67(11) устанавливает: «Избиратель не имеет права объявлять на участке, как он проголосовал». Фотографии бюллетеней — типичный «доказательственный» инструмент в схемах подкупа.',
    ecArticle: 'Art. 6 · Art. 67(11)',
    severity: 3,
    sortOrder: 50,
  },
  {
    id: 'voter_intimidation',
    labelAm: 'Ընտրողի վախեցում կամ հարկադրանք',
    labelEn: 'Voter intimidation or coercion',
    labelRu: 'Запугивание или принуждение избирателя',
    descriptionAm:
      'Հոդված 4-ը արգելում է ընտրողին ստիպել քվեարկել թեկնածուի (կուսակցության) օգտին կամ դեմ, կամ ստիպել մասնակցել կամ չմասնակցել ընտրությունների։ Հոդված 22-ի վերնագիրը՝ «Ընտրողների կամքի ազատ արտահայտման վրա ազդեցության արգելք»։ Հոդված 6-ը արգելում է ընտրողի կամքի ազատ արտահայտման ցանկացած վերահսկողություն։',
    descriptionEn:
      'Article 4 prohibits forcing an elector to vote for or against a candidate (party), or forcing participation or non-participation. Article 22 is titled "Prohibiting influence on the free expression of will of electors". Article 6 prohibits any control over the free expression of voter will.',
    descriptionRu:
      'Статья 4 запрещает принуждать избирателя голосовать за или против кандидата (партии) и принуждать к участию или неучастию в выборах. Статья 22 называется «Запрещение влияния на свободное волеизъявление избирателей». Статья 6 запрещает любой контроль над свободным выражением воли избирателя.',
    ecArticle: 'Art. 4 · Art. 6 · Art. 22',
    severity: 5,
    sortOrder: 60,
  },
  {
    id: 'observer_obstruction',
    labelAm: 'Դիտորդի կամ ԶԼՄ-ի աշխատանքի խոչընդոտում',
    labelEn: 'Obstruction of observer or media',
    labelRu: 'Препятствование наблюдателю или СМИ',
    descriptionAm:
      'Հոդված 8(11)-ը երաշխավորում է վստահված անձանց, դիտորդների, այցելուների և ԶԼՄ-ի ներկայացուցիչների իրավունքը՝ ներկա լինել հանձնաժողովի նիստերին և քվեարկության ընթացքին, ինչպես նաև լուսանկարել ու տեսանկարահանել քվեի գաղտնիության պահպանմամբ։ Հոդված 8(11.1)-ը պահանջում է ֆիքսված տեսախցիկներ և իրական ժամանակում հեռարձակում բոլոր տեղամասերից։',
    descriptionEn:
      'Article 8(11) guarantees the right of proxies, observers, visitors, and media representatives to be present at commission sittings and during the voting process, and to photograph and videotape without violating ballot secrecy. Article 8(11.1) mandates fixed cameras and real-time webcast from every polling precinct.',
    descriptionRu:
      'Статья 8(11) гарантирует право доверенных лиц, наблюдателей, посетителей и СМИ присутствовать на заседаниях комиссии и в процессе голосования, а также фотографировать и снимать видео, не нарушая тайну голосования. Статья 8(11.1) обязывает устанавливать фиксированные камеры и вести прямую трансляцию со всех участков.',
    ecArticle: 'Art. 8(11) · Art. 8(11.1)',
    severity: 4,
    sortOrder: 70,
  },
  {
    id: 'campaign_on_voting_day',
    labelAm: 'Քարոզչություն քվեարկության օրը',
    labelEn: 'Campaigning on voting day (silence-period violation)',
    labelRu: 'Агитация в день голосования (нарушение «дня тишины»)',
    descriptionAm:
      'Հոդված 19(1)-ը հստակ արգելում է. «Քվեարկության օրը և դրան նախորդող օրը հանրային ելույթներով, հանրային միջոցառումներով, ինչպես նաև տպագիր ԶԼՄ-ով, ռադիոյով և հեռուստաընկերություններով քարոզչությունն արգելվում է»։',
    descriptionEn:
      'Article 19(1) explicitly prohibits: "The campaign — on the voting day and on the day preceding it — through public speeches, public events, as well as through print media, radio companies and television companies (including during satellite broadcasting) carrying out terrestrial on-air broadcasting shall be prohibited."',
    descriptionRu:
      'Статья 19(1) прямо запрещает: «Агитация в день голосования и в предшествующий ему день — через публичные выступления, публичные мероприятия, а также через печатные СМИ, радиокомпании и телекомпании, ведущие наземное эфирное вещание — запрещена».',
    ecArticle: 'Art. 19(1)',
    severity: 2,
    sortOrder: 80,
  },
  {
    id: 'ballot_box_tampering',
    labelAm: 'Քվեատուփի վնասում, բացում կամ կնիքի խախտում',
    labelEn: 'Ballot box tampering or seal violation',
    labelRu: 'Вмешательство в работу урны или повреждение пломбы',
    descriptionAm:
      'Հոդված 65(2)-ի համաձայն՝ քվեարկության օրը՝ ժամը 8:00-ից առաջ, հանձնաժողովի նախագահը ստուգում է, որ քվեատուփը դատարկ է, փակում է այն և կնքում։ Հոդված 68(1)-ի համաձայն՝ ժամը 20:00-ին քվեատուփի անցքը փակվում է։ Կնքված տուփի վնասում, ապօրինի բացում, կամ անհավատարմագրված անձի շփումը քվեատուփի հետ՝ լուրջ խախտում է։',
    descriptionEn:
      'Per Article 65(2), before 8:00 on voting day the precinct chairperson verifies the ballot box is empty, closes it and seals it. Per Article 68(1), at 20:00 the slot of the ballot box is closed. Damaging the sealed box, opening it illegally, or unauthorized contact with the ballot box by a non-credentialed person is a serious violation.',
    descriptionRu:
      'По статье 65(2) до 8:00 в день голосования председатель участковой комиссии проверяет, что урна пуста, закрывает её и пломбирует. По статье 68(1) в 20:00 прорезь урны закрывается. Повреждение опечатанной урны, незаконное вскрытие или несанкционированное обращение с урной — серьёзное нарушение.',
    ecArticle: 'Art. 65(2) · Art. 68(1)',
    severity: 5,
    sortOrder: 90,
  },
  {
    id: 'vote_buying',
    labelAm: 'Ձայների գնում',
    labelEn: 'Vote buying',
    labelRu: 'Подкуп избирателей',
    descriptionAm:
      'Հոդված 19(6)-ը հստակ արգելում է թեկնածուներին և կուսակցություններին (անձամբ կամ ուրիշի միջոցով, անվճար կամ արտոնյալ պայմաններով) ընտրողներին տալ (խոստանալ) գումար, սննդամթերք, արժեթղթեր, ապրանքներ կամ ծառայություններ։ Քրեական պատասխանատվությունը կարգավորվում է Քրեական օրենսգրքով։',
    descriptionEn:
      'Article 19(6) explicitly prohibits candidates and political parties from providing or promising — in person or through someone else, gratuitously or on preferential conditions — money, food, securities, goods or services to electors. Criminal liability is governed by the Criminal Code.',
    descriptionRu:
      'Статья 19(6) прямо запрещает кандидатам и политическим партиям предоставлять или обещать — лично или через посредника, безвозмездно или на льготных условиях — деньги, продукты, ценные бумаги, товары или услуги избирателям. Уголовная ответственность регулируется Уголовным кодексом.',
    ecArticle: 'Art. 19(6) · Criminal Code',
    severity: 5,
    sortOrder: 100,
  },
  {
    id: 'other',
    labelAm: 'Այլ',
    labelEn: 'Other',
    labelRu: 'Другое',
    descriptionAm:
      'Այլ խախտում, որը չի համապատասխանում վերը նշվածներին։ Մանրամասները նկարագրեք ազատ ձևով։ Մի՛ նշիր անձնական անուններ կամ քվեի բովանդակություն։',
    descriptionEn:
      'Another violation not matching the categories above. Describe in free text. Do NOT include personal names or ballot contents.',
    descriptionRu:
      'Другое нарушение, не подпадающее под категории выше. Опишите в свободной форме. НЕ указывайте личных имён и содержания бюллетеня.',
    ecArticle: '—',
    severity: 1,
    sortOrder: 999,
  },
] as const;

export type ViolationCategoryId = (typeof VIOLATION_CATEGORIES)[number]['id'];
