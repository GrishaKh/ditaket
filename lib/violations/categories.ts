/**
 * Locked violation categories mapped to Armenia's Electoral Code articles.
 * Sourced from convergent analysis across all four PDFs in Researches/.
 * Severity 1..5 (5 = most serious).
 */
export const VIOLATION_CATEGORIES = [
  {
    id: 'multiple_in_booth',
    labelAm: 'Մեկից ավելի մարդ քվեախցիկում',
    labelEn: 'Multiple people in voting booth',
    labelRu: 'Несколько человек в кабине для голосования',
    descriptionAm:
      'Քվեախցիկում միաժամանակ ներկա է մեկից ավելի անձ՝ բացառությամբ օրինական աջակցության դեպքերի։',
    descriptionEn:
      'More than one person inside the voting booth simultaneously, except in legally permitted assistance cases.',
    descriptionRu:
      'Более одного человека одновременно в кабине для голосования, кроме случаев законного содействия.',
    ecArticle: 'Art. 5, 65',
    severity: 4,
    sortOrder: 10,
  },
  {
    id: 'ballot_stuffing',
    labelAm: 'Քվեատուփի «լցոնում»',
    labelEn: 'Ballot stuffing',
    labelRu: 'Вброс бюллетеней',
    descriptionAm:
      'Քվեատուփի մեջ ավելի քան մեկ քվեաթերթ մեկ ձեռքի շարժմամբ կամ առանց համապատասխան ընտրողի։',
    descriptionEn:
      'Multiple ballots inserted in a single motion or without a corresponding voter.',
    descriptionRu:
      'Несколько бюллетеней опускаются за одно движение или без соответствующего избирателя.',
    ecArticle: 'Art. 67, 68',
    severity: 5,
    sortOrder: 20,
  },
  {
    id: 'crowding_50m',
    labelAm: 'Անարտոնված հավաք 50 մ գոտում',
    labelEn: 'Unauthorized crowding within 50m perimeter',
    labelRu: 'Несанкционированное скопление в 50-метровой зоне',
    descriptionAm:
      'Քվեարկության օրը 50 մ շառավղում քարոզչություն, անօրինական ներկայություն կամ ընտրողների ճնշում։',
    descriptionEn:
      'Campaigning, unauthorized presence, or voter pressure within 50 metres of a polling station on voting day.',
    descriptionRu:
      'Агитация, несанкционированное присутствие или давление на избирателей в 50 метрах от участка в день голосования.',
    ecArticle: 'Art. 22.3, 19',
    severity: 3,
    sortOrder: 30,
  },
  {
    id: 'repeated_assistant',
    labelAm: 'Կրկնվող «օգնող» անձ',
    labelEn: 'Repeated voter-assistance violation',
    labelRu: 'Повторный «помощник» избирателя',
    descriptionAm:
      'Նույն անձը օգնում է մեկից ավելի ընտրողի (հոդված 65-ի խախտում)։',
    descriptionEn: 'The same person assists more than one voter (Art. 65 violation).',
    descriptionRu:
      'Один и тот же человек помогает нескольким избирателям (нарушение ст. 65).',
    ecArticle: 'Art. 65',
    severity: 4,
    sortOrder: 40,
  },
  {
    id: 'ballot_photograph',
    labelAm: 'Քվեաթերթի լուսանկարում',
    labelEn: 'Ballot photography',
    labelRu: 'Фотографирование бюллетеня',
    descriptionAm:
      'Քվեախցիկում հեռախոսով քվեաթերթի լուսանկարում (Հոդված 6, քվեի գաղտնիության խախտում)։',
    descriptionEn:
      'Photographing a marked ballot inside the booth (Art. 6, secrecy of vote violation).',
    descriptionRu:
      'Фотографирование заполненного бюллетеня в кабине (ст. 6, нарушение тайны голосования).',
    ecArticle: 'Art. 6',
    severity: 3,
    sortOrder: 50,
  },
  {
    id: 'voter_intimidation',
    labelAm: 'Ընտրողի վախեցում',
    labelEn: 'Voter intimidation',
    labelRu: 'Запугивание избирателей',
    descriptionAm:
      'Ընտրողի վրա ճնշում, սպառնալիք կամ ազատ ընտրության խոչընդոտում։',
    descriptionEn: 'Pressure, threats, or obstruction of free voter choice.',
    descriptionRu: 'Давление, угрозы или препятствование свободному выбору избирателя.',
    ecArticle: 'Art. 4, 6',
    severity: 5,
    sortOrder: 60,
  },
  {
    id: 'observer_obstruction',
    labelAm: 'Դիտորդի աշխատանքի խոչընդոտում',
    labelEn: 'Obstruction of observer',
    labelRu: 'Препятствование наблюдателю',
    descriptionAm:
      'Հավատարմագրված դիտորդի կամ ԶԼՄ-ի ներկայացուցչի աշխատանքի խոչընդոտում։',
    descriptionEn:
      'Obstructing the work of an accredited observer or media representative.',
    descriptionRu:
      'Препятствование работе аккредитованного наблюдателя или представителя СМИ.',
    ecArticle: 'Art. 8',
    severity: 4,
    sortOrder: 70,
  },
  {
    id: 'campaign_on_voting_day',
    labelAm: 'Քարոզչություն քվեարկության օրը',
    labelEn: 'Campaigning on voting day',
    labelRu: 'Агитация в день голосования',
    descriptionAm: 'Քվեարկության օրը արգելված քարոզչական նյութեր կամ բացահայտ քարոզ։',
    descriptionEn: 'Campaign materials or campaigning on the legal silence day.',
    descriptionRu: 'Агитационные материалы или агитация в день тишины.',
    ecArticle: 'Art. 19.1',
    severity: 2,
    sortOrder: 80,
  },
  {
    id: 'ballot_box_tampering',
    labelAm: 'Քվեատուփի վնասում կամ բացում',
    labelEn: 'Ballot box tampering',
    labelRu: 'Вмешательство в работу урны',
    descriptionAm:
      'Քվեատուփի վնասում, ապօրինի բացում կամ չհավատարմագրված անձի շփում քվեատուփի հետ։',
    descriptionEn: 'Damaging, illegally opening, or unauthorized handling of the ballot box.',
    descriptionRu:
      'Повреждение, незаконное вскрытие или несанкционированное обращение с урной.',
    ecArticle: 'Art. 64, 68',
    severity: 5,
    sortOrder: 90,
  },
  {
    id: 'vote_buying',
    labelAm: 'Ձայների գնում',
    labelEn: 'Vote buying',
    labelRu: 'Подкуп избирателей',
    descriptionAm:
      'Ընտրողին գումար, նվեր կամ այլ խոստումներ՝ որոշակի ընտրության դիմաց (Քրեական օրենսգիրք)։',
    descriptionEn:
      'Offering money, gifts, or favours in exchange for a specific vote (Criminal Code).',
    descriptionRu:
      'Предложение денег, подарков или услуг в обмен на конкретный голос (УК).',
    ecArticle: 'Crim. Art. 154, EC Art. 19.6',
    severity: 5,
    sortOrder: 100,
  },
  {
    id: 'other',
    labelAm: 'Այլ',
    labelEn: 'Other',
    labelRu: 'Другое',
    descriptionAm:
      'Այլ խախտում, որը չի համապատասխանում վերը նշվածներին։ Մանրամասները նկարագրեք ազատ ձևով։',
    descriptionEn:
      'Another violation not matching the categories above. Describe in free text.',
    descriptionRu:
      'Другое нарушение, не подпадающее под категории выше. Опишите в свободной форме.',
    ecArticle: '—',
    severity: 1,
    sortOrder: 999,
  },
] as const;

export type ViolationCategoryId = (typeof VIOLATION_CATEGORIES)[number]['id'];
