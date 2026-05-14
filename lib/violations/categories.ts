/**
 * Violation categories — verified against the OFFICIAL Armenian original of
 * the Electoral Code of the Republic of Armenia (Constitutional Law), as
 * published by the CEC at res.elections.am/images/doc/_code.pdf.
 *
 * Each `ecArticle` cites article numbers from the AUTHORITATIVE Armenian text.
 * These differ from the 2018 English translation (translation-centre.am)
 * because of post-2018 amendments and structural renumbering:
 *   - English "Free suffrage" (Art. 4) and "Mandatory/periodic" (Art. 7) do not
 *     exist as standalone articles in the current Armenian Code.
 *   - Camera/observer right is Հոդված 6(12), not Art. 8(11).
 *   - 50m perimeter is Հոդված 21(4), not Art. 22(3).
 *   - Campaign rules are in Հոդված 18, not Art. 19.
 *   - Voter-assistance rule is Հոդված 65(4), not Art. 67(9).
 *   - Voting starts at 8:00 per Հոդված 63(1); ends at 20:00 per Հոդված 67(1).
 *
 * Severity 1..5 (5 = most serious). Re-verified 2026-05-14.
 */
export const VIOLATION_CATEGORIES = [
  {
    id: 'multiple_in_booth',
    labelAm: 'Մեկից ավելի մարդ քվեախցիկում',
    labelEn: 'Multiple people in voting booth',
    labelRu: 'Несколько человек в кабине для голосования',
    descriptionAm:
      'Քվեախցիկում միաժամանակ ներկա է մեկից ավելի անձ։ Հոդված 65(4)-ը սահմանում է. «Քվեաթերթիկը ինքնուրույն լրացնելու հնարավորություն չունեցող ընտրողը իրավունք ունի… քվեարկության խցիկ հրավիրելու այլ անձի, որը չպետք է լինի ընտրական հանձնաժողովի անդամ, վստահված անձ: Անձն իրավունք ունի օգնելու… միայն մեկ ընտրողի»։ Հոդված 5-ը երաշխավորում է քվեարկության գաղտնիությունը։',
    descriptionEn:
      'More than one person inside the voting booth at the same time. Per Հոդված 65(4) of the RA Electoral Code: a voter unable to fill in the ballot on their own may invite ONE other person into the booth — and that person cannot be a commission member or a proxy, and can assist only one such voter. Հոդված 5 guarantees secrecy of the vote.',
    descriptionRu:
      'Более одного человека в кабине одновременно. По статье 65(4) Избирательного кодекса РА: избиратель, не способный заполнить бюллетень самостоятельно, может пригласить ОДНОГО помощника, и тот не может быть членом комиссии или доверенным лицом, и помогает только одному избирателю. Статья 5 гарантирует тайну голосования.',
    ecArticle: 'Հոդված 5 · Հոդված 65(4)',
    severity: 4,
    sortOrder: 10,
  },
  {
    id: 'ballot_stuffing',
    labelAm: 'Քվեատուփի «լցոնում»',
    labelEn: 'Ballot stuffing',
    labelRu: 'Вброс бюллетеней',
    descriptionAm:
      'Քվեատուփի մեջ բազմակի ծրարների գցում մեկ շարժմամբ կամ Հոդված 66-ով սահմանված ընթացակարգի շրջանցում. քվեարկության ծրարը կնքող անդամը պետք է ստուգի ընտրողի անձը հաստատող փաստաթղթի վրա «տվյալ ընտրությանը մասնակցելու մասին դրոշմակնիքի բացակայությունը», դրա բացակայության դեպքում դրոշմակնիք դնի, և միայն դրանից հետո թույլատրի ծրարի՝ քվեատուփ ձգելը։ Հաշվման ընթացքում պարզվող անհամապատասխանությունները կարգավորվում են Հոդված 67-ով (Քվեարկության արդյունքների ամփոփում)։',
    descriptionEn:
      'Multiple envelopes dropped into the ballot box in a single motion, or any bypass of the strict procedure in Հոդված 66 — the envelope-sealing commission member must verify that the elector\'s identity document does NOT already bear the voting-stamp; if absent, stamp the document; only then permit the envelope to be dropped into the box. Discrepancies surface during the count under Հոդված 67.',
    descriptionRu:
      'Несколько конвертов опускаются в урну за одно движение, либо обход строгой процедуры по статье 66 — член комиссии, ответственный за конверт, обязан проверить отсутствие штампа об участии в данных выборах на удостоверении личности избирателя; при отсутствии — поставить штамп; только тогда разрешается опустить конверт в урну. Несоответствия выявляются при подведении итогов по статье 67.',
    ecArticle: 'Հոդված 66 · Հոդված 67',
    severity: 5,
    sortOrder: 20,
  },
  {
    id: 'carousel_voting',
    labelAm: 'Մեկ ուրիշի անունից քվեարկություն',
    labelEn: 'Carousel voting / voting in another person’s name',
    labelRu: 'Голосование вместо другого лица («карусель»)',
    descriptionAm:
      'Քվեարկություն մեկ այլ անձի անունից, օտար փաստաթղթով, կամ նույն մարդու բազմակի քվեարկում տարբեր տեղամասերում։ Հոդված 64(1)-ը հստակ սահմանում է. «Ընտրողը քվեարկությանը մասնակցում է անձամբ. լիազորված քվեարկությունն արգելվում է»։ Հոդված 66-ի ընթացակարգով (ընտրողի անձը հաստատող փաստաթղթի դրոշմակնքում)՝ կրկնակի քվեարկությունը կանխվում է։',
    descriptionEn:
      'Voting in another person’s name, with someone else’s document, or the same individual voting at multiple stations. Հոդված 64(1) is explicit: «Ընտրողը քվեարկությանը մասնակցում է անձամբ. լիազորված քվեարկությունն արգելվում է» — "An elector participates in voting in person; proxy voting is prohibited." Հոդված 66 enforces this through the stamping of the elector\'s identity document at the moment the envelope is dropped, blocking re-voting.',
    descriptionRu:
      'Голосование от имени другого человека, по чужому документу, либо повторное голосование одного лица на разных участках. Статья 64(1) прямо устанавливает: «Избиратель участвует в голосовании лично; голосование через представителя запрещено». Статья 66 обеспечивает запрет через штамповку удостоверения личности в момент опускания конверта.',
    ecArticle: 'Հոդված 64(1) · Հոդված 66',
    severity: 5,
    sortOrder: 25,
  },
  {
    id: 'crowding_50m',
    labelAm: 'Անարտոնված հավաք 50 մ գոտում',
    labelEn: 'Unauthorized gathering within 50m perimeter',
    labelRu: 'Несанкционированное скопление в 50-метровой зоне',
    descriptionAm:
      'Հոդված 21(4)-ի համաձայն. «Արգելվում է քվեարկության օրը տեղամասային կենտրոնին հարող տարածքում մինչև 50 մետր շառավղով խմբերով հավաքվելը, տեղամասային կենտրոնի մուտքին հարող տարածքում մեքենաների կուտակումը: Սույն մասի դրույթների կատարումն ապահովում է Հայաստանի Հանրապետության ոստիկանությունը՝ անկախ ընտրական հանձնաժողովի պահանջից»։ Քվեարկող քաղաքացիների սովորական հերթը խախտում չէ։ Հոդված 65-ը նաև արգելում է թեկնածուին գտնվել տեղամասում կամ 50 մետր շառավղում քվեարկության ընթացքում (բացառությամբ իր քվեարկելու դեպքի)։',
    descriptionEn:
      'Per Հոդված 21(4): «Արգելվում է քվեարկության օրը տեղամասային կենտրոնին հարող տարածքում մինչև 50 մետր շառավղով խմբերով հավաքվելը, տեղամասային կենտրոնի մուտքին հարող տարածքում մեքենաների կուտակումը» — gathering in groups within a 50-metre radius of a polling station, and clusters of vehicles near the entrance, are prohibited on voting day. Enforcement is by the Republic of Armenia Police, independent of any commission request. The normal queue of voters is NOT a violation. Հոդված 65 also bars candidates from being inside the station or within the 50m radius during voting (except to vote themselves).',
    descriptionRu:
      'По статье 21(4): запрещены в день голосования скопления групп в радиусе 50 метров от участка и сосредоточение транспорта у входа на участок. Исполнение обеспечивает полиция РА — независимо от обращения комиссии. Обычная очередь избирателей нарушением не является. Статья 65 запрещает кандидату находиться на участке или в 50-метровой зоне во время голосования (кроме самого участия в голосовании).',
    ecArticle: 'Հոդված 21(4) · Հոդված 65',
    severity: 3,
    sortOrder: 30,
  },
  {
    id: 'repeated_assistant',
    labelAm: 'Կրկնվող «օգնող» անձ',
    labelEn: 'Repeated voter-assistance violation',
    labelRu: 'Повторный «помощник» избирателя',
    descriptionAm:
      'Հոդված 65(4)-ը հստակ սահմանում է. «Անձն իրավունք ունի օգնելու քվեաթերթիկ ինքնուրույն լրացնելու հնարավորություն չունեցող միայն մեկ ընտրողի»։ Մեկ անձի կողմից մի քանի ընտրողի «օգնելը» քվեախցիկում խախտում է այս կանոնը։ Օգնող անձը չպետք է լինի ընտրական հանձնաժողովի անդամ կամ վստահված անձ։',
    descriptionEn:
      'Հոդված 65(4) is explicit: «Անձն իրավունք ունի օգնելու քվեաթերթիկ ինքնուրույն լրացնելու հնարավորություն չունեցող միայն մեկ ընտրողի» — "A person has the right to assist only ONE elector who is unable to fill in the ballot on their own." If the same individual enters the booth to "help" multiple voters during the day, this rule is violated. The helper cannot be a commission member or a proxy.',
    descriptionRu:
      'Статья 65(4) прямо устанавливает: «Лицо имеет право помочь только ОДНОМУ избирателю, неспособному заполнить бюллетень самостоятельно». Если один и тот же человек входит в кабину «помогать» нескольким избирателям в течение дня — это нарушение. Помощник не может быть членом избирательной комиссии или доверенным лицом.',
    ecArticle: 'Հոդված 65(4)',
    severity: 4,
    sortOrder: 40,
  },
  {
    id: 'ballot_photograph',
    labelAm: 'Քվեաթերթի լուսանկարում',
    labelEn: 'Ballot photography',
    labelRu: 'Фотографирование бюллетеня',
    descriptionAm:
      'Քվեախցիկում քվեաթերթի լուսանկարում հեռախոսով։ Հոդված 5-ի համաձայն. «Քվեարկողի կամքի ազատ արտահայտման նկատմամբ վերահսկողությունն արգելվում է»։ Հոդված 65(7)-ը նշում է. «Տեղամասային կենտրոնում արգելվում է կատարած քվեարկության մասին տեղեկություններ հայտնելը»։ Քվեաթերթի լուսանկարը հաճախ օգտագործվում է ձայների գնման սխեմաներում որպես «ապացույց»։',
    descriptionEn:
      'Photographing a marked ballot inside the booth (typically by phone). Հոդված 5: «Քվեարկողի կամքի ազատ արտահայտման նկատմամբ վերահսկողությունն արգելվում է» — "Control over the free expression of will of an elector is prohibited." Հոդված 65(7): «Տեղամասային կենտրոնում արգելվում է կատարած քվեարկության մասին տեղեկություններ հայտնելը» — "Providing information about the voting in the polling station is prohibited." Ballot photos are a common "proof" device in vote-buying schemes.',
    descriptionRu:
      'Фотографирование заполненного бюллетеня в кабине (обычно на телефон). Статья 5: «Контроль над свободным выражением воли избирателя запрещён». Статья 65(7): «На участке запрещено сообщать сведения о состоявшемся голосовании». Фотографии бюллетеней — типичный «доказательственный» инструмент в схемах подкупа.',
    ecArticle: 'Հոդված 5 · Հոդված 65(7)',
    severity: 3,
    sortOrder: 50,
  },
  {
    id: 'voter_intimidation',
    labelAm: 'Ընտրողի վախեցում կամ հարկադրանք',
    labelEn: 'Voter intimidation or coercion',
    labelRu: 'Запугивание или принуждение избирателя',
    descriptionAm:
      'Ընտրողի վախեցում, սպառնալիք, կամ ստիպում թեկնածուի (կուսակցության) օգտին կամ դեմ քվեարկելու, կամ ընտրությանը մասնակցելու/չմասնակցելու։ Հոդված 5-ի համաձայն. «Քվեարկողի կամքի ազատ արտահայտման նկատմամբ վերահսկողությունն արգելվում է»։ Հոդված 21-ի վերնագիրը՝ «Ընտրողների կամքի ազատ արտահայտման վրա ներգործության արգելումը»՝ ներառում է ինչպես ֆիզիկական, այնպես էլ տնտեսական ճնշումը։',
    descriptionEn:
      'Intimidating, threatening, or coercing an elector — to vote for or against a candidate (party), or to participate / not participate. Հոդված 5: «Քվեարկողի կամքի ազատ արտահայտման նկատմամբ վերահսկողությունն արգելվում է» — "Control over the free expression of will of an elector is prohibited." The title of Հոդված 21 itself — «Ընտրողների կամքի ազատ արտահայտման վրա ներգործության արգելումը» ("Prohibiting influence on the free expression of will of electors") — covers physical and economic pressure alike.',
    descriptionRu:
      'Запугивание, угрозы или принуждение избирателя — голосовать за или против кандидата (партии) либо участвовать / не участвовать в выборах. Статья 5: «Контроль над свободным выражением воли избирателя запрещён». Статья 21 называется «Запрещение влияния на свободное волеизъявление избирателей» — это охватывает и физическое, и экономическое давление.',
    ecArticle: 'Հոդված 5 · Հոդված 21',
    severity: 5,
    sortOrder: 60,
  },
  {
    id: 'observer_obstruction',
    labelAm: 'Դիտորդի կամ ԶԼՄ-ի աշխատանքի խոչընդոտում',
    labelEn: 'Obstruction of observer or media',
    labelRu: 'Препятствование наблюдателю или СМИ',
    descriptionAm:
      'Հոդված 6(12)-ը երաշխավորում է. «Ընտրական հանձնաժողովների նիստերին, ինչպես նաև քվեարկության ամբողջ ընթացքում տեղամասային կենտրոնում… իրավունք ունեն ներկա լինելու վստահված անձինք, դիտորդները, զանգվածային լրատվության միջոցների ներկայացուցիչները… [նրանք] կարող են լուսանկարահանել, տեսանկարահանել՝ չխախտելու ընտրողների քվեարկության գաղտնիության իրավունքը»։ Հոդված 31-ը մանրամասնում է դիտորդի իրավունքները՝ ներառյալ ընտրական հանձնաժողովի նիստին և քվեարկության սենյակում ներկա լինելու իրավունքը։ Հավատարմագրված դիտորդի հեռացում, ապարատների խլում կամ սպառնալիք՝ խախտում է։',
    descriptionEn:
      'Հոդված 6(12) guarantees: «Ընտրական հանձնաժողովների նիստերին, ինչպես նաև քվեարկության ամբողջ ընթացքում տեղամասային կենտրոնում… իրավունք ունեն ներկա լինելու վստահված անձինք, դիտորդները, զանգվածային լրատվության միջոցների ներկայացուցիչները… [նրանք] կարող են լուսանկարահանել, տեսանկարահանել՝ չխախտելու ընտրողների քվեարկության գաղտնիության իրավունքը» — proxies, observers, and media representatives have the right to be present at commission sittings and throughout voting in the polling station, and to photograph and videotape without violating ballot secrecy. Հոդված 31 details observers’ specific rights, including presence at commission sessions and inside the voting room. Removing, threatening, or confiscating equipment from accredited observers is a violation.',
    descriptionRu:
      'Статья 6(12) гарантирует, что на заседаниях избирательных комиссий и в ходе всего голосования на участке имеют право присутствовать доверенные лица, наблюдатели, представители СМИ; они могут фотографировать и снимать видео, не нарушая тайны голосования. Статья 31 детально регулирует права наблюдателя — в том числе присутствие на заседаниях комиссии и в комнате для голосования. Удаление, угрозы или изъятие техники у аккредитованных наблюдателей — нарушение.',
    ecArticle: 'Հոդված 6(12) · Հոդված 31',
    severity: 4,
    sortOrder: 70,
  },
  {
    id: 'campaign_on_voting_day',
    labelAm: 'Քարոզչություն քվեարկության օրը',
    labelEn: 'Campaigning on voting day (silence-period violation)',
    labelRu: 'Агитация в день голосования (нарушение «дня тишины»)',
    descriptionAm:
      'Քվեարկության օրը և դրան նախորդող օրը հանրային ելույթներով, հանրային միջոցառումներով, ինչպես նաև տպագիր ԶԼՄ-ով, ռադիոյով և հեռուստաընկերություններով քարոզչությունն արգելվում է։ Այս կարգավորումը՝ ՀՀ Ընտրական օրենսգրքի Հոդված 18-ում (Նախընտրական քարոզչության հիմնական սկզբունքները), իսկ լրատվամիջոցների առանձնահատկությունները՝ Հոդված 19-ում (Նախընտրական քարոզչությունը զանգվածային լրատվության միջոցներով)։',
    descriptionEn:
      'Campaigning — on voting day and on the day preceding it — through public speeches, public events, print media, radio, and television is prohibited. The silence-period rule sits in Հոդված 18 (Main principles of pre-election campaign); media-specific provisions are in Հոդված 19 (Pre-election campaigning through mass media).',
    descriptionRu:
      'Агитация — в день голосования и в предшествующий день — через публичные выступления, мероприятия, печатные СМИ, радио и телевидение запрещена. Это правило «дня тишины» закреплено в статье 18 (Основные принципы предвыборной агитации); специфика медиа — в статье 19 (Предвыборная агитация через СМИ).',
    ecArticle: 'Հոդված 18',
    severity: 2,
    sortOrder: 80,
  },
  {
    id: 'ballot_box_tampering',
    labelAm: 'Քվեատուփի վնասում, բացում կամ կնիքի խախտում',
    labelEn: 'Ballot box tampering or seal violation',
    labelRu: 'Вмешательство в работу урны или повреждение пломбы',
    descriptionAm:
      'Հոդված 62-ի համաձայն՝ քվեարկության օրը՝ ժամը 7:00-ին, տեղամասային հանձնաժողովի նախագահը բացում է հրակայուն պահարանը, ստուգում, որ քվեատուփը դատարկ է, և կնքում է այն։ Հոդված 63(1). «Տեղամասային ընտրական հանձնաժողովի նախագահը քվեարկության օրը՝ ժամ 8.00-ին, հայտարարում է քվեարկության սկիզբը և թույլատրում ընտրողների մուտքը քվեարկության սենյակ»։ Հոդված 67(1). «Տեղամասային ընտրական հանձնաժողովի նախագահը ժամ 20.00-ին հայտարարում է քվեարկության ավարտի մասին և արգելում ընտրողների մուտքը քվեարկության սենյակ»։ Կնքված տուփի վնասում, ապօրինի բացում կամ անհավատարմագրված անձի շփումը՝ լուրջ խախտում է։',
    descriptionEn:
      'Per Հոդված 62, at 7:00 on voting day the precinct chairperson opens the fire-resistant safe, verifies the ballot box is empty, and seals it. Հոդված 63(1): the chairperson announces the start of voting at 8:00 and admits voters. Հոդված 67(1): «Տեղամասային ընտրական հանձնաժողովի նախագահը ժամ 20.00-ին հայտարարում է քվեարկության ավարտի մասին և արգելում ընտրողների մուտքը քվեարկության սենյակ» — at 20:00 the chairperson announces the end of voting and bars entry. Damaging the sealed box, opening it illegally, or unauthorized contact by an uncredentialed person is a serious violation.',
    descriptionRu:
      'По статье 62 в 7:00 в день голосования председатель участковой комиссии открывает огнеупорный сейф, проверяет, что урна пуста, и опечатывает её. По статье 63(1) в 8:00 объявляется начало голосования и допускаются избиратели. Статья 67(1): «В 20:00 председатель участковой комиссии объявляет об окончании голосования и закрывает вход в комнату для голосования». Повреждение опечатанной урны, незаконное вскрытие или несанкционированное обращение — серьёзное нарушение.',
    ecArticle: 'Հոդված 62 · Հոդված 67(1)',
    severity: 5,
    sortOrder: 90,
  },
  {
    id: 'vote_buying',
    labelAm: 'Ձայների գնում',
    labelEn: 'Vote buying',
    labelRu: 'Подкуп избирателей',
    descriptionAm:
      'Հոդված 18(7)-ը հստակ արգելում է. «Նախընտրական քարոզչության ժամանակ, ինչպես նաև քվեարկության նախորդ և քվեարկության օրը թեկնածուներին, կուսակցություններին, կուսակցությունների դաշինքներին արգելվում է անձամբ կամ նրանց անունից կամ որևէ այլ եղանակով ընտրողներին անհատույց կամ արտոնյալ պայմաններով տալ (խոստանալ) դրամ, սննդամթերք, արժեթղթեր, ապրանքներ կամ մատուցել (խոստանալ) ծառայություններ»։ Քրեական պատասխանատվությունը կարգավորվում է ՀՀ Քրեական օրենսգրքով։',
    descriptionEn:
      'Հոդված 18(7) explicitly prohibits: «Նախընտրական քարոզչության ժամանակ, ինչպես նաև քվեարկության նախորդ և քվեարկության օրը թեկնածուներին, կուսակցություններին, կուսակցությունների դաշինքներին արգելվում է… ընտրողներին անհատույց կամ արտոնյալ պայմաններով տալ (խոստանալ) դրամ, սննդամթերք, արժեթղթեր, ապրանքներ կամ մատուցել (խոստանալ) ծառայություններ» — during the pre-election campaign, and on the day preceding and the day of voting, candidates, parties, and party alliances — in person or through anyone else — are barred from giving or promising electors money, food, securities, goods, or services, gratuitously or on preferential terms. Criminal liability sits in the RA Criminal Code.',
    descriptionRu:
      'Статья 18(7) прямо запрещает: в период предвыборной агитации, а также накануне и в день голосования, кандидатам, партиям и партийным блокам запрещено лично или через посредников передавать или обещать избирателям безвозмездно или на льготных условиях деньги, продукты, ценные бумаги, товары либо оказывать (обещать) услуги. Уголовная ответственность — по УК РА.',
    ecArticle: 'Հոդված 18(7) · Քրեական օրենսգիրք',
    severity: 5,
    sortOrder: 100,
  },
  {
    id: 'other',
    labelAm: 'Այլ',
    labelEn: 'Other',
    labelRu: 'Другое',
    descriptionAm:
      'Այլ խախտում, որը չի համապատասխանում վերը նշվածներին։ Մանրամասները նկարագրեք ազատ ձևով։ Մի՛ նշեք անձնական անուններ կամ քվեի բովանդակություն։',
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
