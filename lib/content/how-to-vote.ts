import type { Locale } from '@/lib/i18n/routing';

export type Step = { title: string; body: string };

export const HOW_TO_VOTE: Record<Locale, { lead: string; steps: Step[]; closing: string }> = {
  am: {
    lead:
      'Քվեարկության օրը (կիրակի, հունիսի 7) ընտրատեղամասերը բաց են 8:00-ից մինչև 20:00-ն։ Քվեարկում ես այն տեղամասում, որին վերագրված ես ըստ քո հաշվառման հասցեի. եթե 20:00-ին դեռ հերթի մեջ ես՝ քվեարկելու իրավունք ունես (Հոդված 54)։ Այս ընտրությունները կայանում են փակ ցուցակային համամասնական ընտրակարգով. ընտրողը ստանում է կուսակցությունների նախապես տպված քվեաթերթիկները և ընտրում է իր նախընտրած կուսակցության թերթիկը՝ առանց որևէ նշում կատարելու, գրիչ պետք չէ (ԿԸՀ որոշում, 10.05.2021)։ Ստացիոնար բուժման մեջ գտնվող, տեղամաս ինքնուրույն ներկայանալ չկարողացող ընտրողների համար գործում է շրջիկ քվեատուփ (Հոդված 54(2))։ Արտերկրում դիվանագիտական կամ զինվորական ծառայության մեջ գտնվող քաղաքացիները քվեարկում են էլեկտրոնային եղանակով՝ քվեարկության օրվանից մի քանի օր առաջ (Հոդված 60)։',
    steps: [
      {
        title: 'Բեր անձը հաստատող փաստաթուղթ',
        body:
          'Նույնականացման քարտ, անձնագիր (կենսաչափական կամ ոչ կենսաչափական), կամ լիազոր մարմնի կողմից տրված ժամանակավոր փաստաթուղթ։ Փաստաթղթի վավերականության ժամկետի ավարտը հիմք չէ քվեարկության չթողնելու համար։ Զինվորական մասի ցուցակում քվեարկող ծառայողները բերում են զինվորական գրքույկը կամ վկայականը (Հոդված 64(3))։',
      },
      {
        title: 'Գտիր քո տեղամասը',
        body:
          'Քո հաշվառման հասցեն կապում է քեզ որոշակի տեղամասի հետ։ Գտիր այն «Դիտակետի» որոնման տողի միջոցով կամ ԿԸՀ-ի ընտրողների ռեգիստրում՝ elections.am/Register։ Նույն ռեգիստրում նախապես ստուգիր նաև քո ընդգրկվածությունը ցուցակում։ Անճշտություն հայտնաբերելու դեպքում դիմիր լիազոր մարմնին քվեարկության օրվանից առնվազն 5 օր առաջ (Հոդված 12(1)). վերջին 4 օրերի ընթացքում՝ ընդհուպ մինչև քվեարկության ավարտը, դեռ կարող ես դիմել լրացուցիչ ցուցակում ընդգրկվելու համար (Հոդված 12(2), Հոդված 13)։',
      },
      {
        title: 'Գրանցվիր սեղանի մոտ',
        body:
          'Ընտրության սենյակում նախ մոտեցիր հատուկ սարքի մոտ նստած մասնագետին և տուր փաստաթուղթդ։ Նա համեմատում է լուսանկարդ, փաստաթուղթդ դնում է սարքի մեջ և խնդրում մատդ դնել՝ մատնահետք վերցնելու համար. երբ էկրանին հայտնվում է կանաչ նշանը, սարքը տպում է մի փոքր թուղթ՝ քվեարկության կտրոնը, որը մասնագետը տալիս է քեզ։ Պահի՛ր այն և ցույց տուր հաջորդ սեղանների մոտ։ Ապա մոտեցիր ընտրողների ցուցակի համար պատասխանատու անդամին, տուր կտրոնը, ստորագրիր անվանդ դիմաց, և անդամն իր կնիքը դնում է թե՛ ստորագրությանդ կողքին, թե՛ կտրոնի վրա (Հոդված 64(2))։ Եթե ինքնուրույն չես կարող ստորագրել՝ կարող է օգնել այլ քաղաքացի (բայց ոչ հանձնաժողովի անդամ)։',
      },
      {
        title: 'Ստացիր քվեաթերթիկները և ծրարը',
        body:
          'Քվեաթերթիկներ տրամադրող անդամը քեզ է հանձնում նախապես տպված քվեաթերթիկների մի փաթեթ՝ մեկ թերթիկ յուրաքանչյուր մասնակից կուսակցության կամ դաշինքի համար (2026-ին՝ 18 հատ), ինչպես նաև մեկ քվեարկության ծրար։ Չես կարող հրաժարվել թերթիկներից որևէ մեկն ստանալուց՝ ստանում ես ամբողջ փաթեթը։ Բոլորը տանում ես քվեախցիկ (Հոդված 65)։',
      },
      {
        title: 'Ընտրիր թերթիկդ՝ խցիկում, գաղտնի',
        body:
          'Քվեախցիկում ընտրիր քո նախընտրած կուսակցության կամ դաշինքի նախապես տպված քվեաթերթիկը և առանց ծալելու տեղավորիր այն քվեարկության ծրարի մեջ ու փակիր ծրարը։ Որևէ նշում կամ ստորագրություն կատարել պետք չէ՝ հենց թերթիկի ընտրությունն է քո ձայնը։ Չօգտագործված թերթիկները գցիր խցիկում տեղադրված՝ չօգտագործված թերթիկների արկղը։ Խցիկից դուրս գալիս մի՛ մոռացիր վերցնել քվեարկության կտրոնը՝ այն պետք կգա քվեատուփի մոտ։ Քվեախցիկում պետք է լինես միայն դու՝ բացառությամբ ինքնուրույն կողմնորոշվել չկարողացող ընտրողի օգնության դեպքի։ Այդ դեպքում ընտրողը նախ տեղեկացնում է հանձնաժողովի նախագահին և հրավիրում մեկ այլ անձի, որը չպետք է լինի հանձնաժողովի անդամ կամ վստահված անձ. այդ անձն իրավունք ունի օգնելու միայն մեկ ընտրողի (Հոդված 65(4))։ Քո ընտրած քվեաթերթիկի լուսանկարահանումը խախտում է քվեարկության գաղտնիությունը (Հոդված 5 և 65(7))։',
      },
      {
        title: 'Հանձնիր կտրոնը, գցիր ծրարը քվեատուփը',
        body:
          'Մոտեցիր քվեատուփին և հանձնիր քվեարկության կտրոնը պատասխանատու անդամին։ Նա ստուգում է կտրոնը (կարող է ստուգել նաև փաստաթուղթդ) և, առանց ծրարը քեզնից վերցնելու, ծրարի անկյան կտրվածքի միջով քվեաթերթիկին փակցնում է ինքնաստուգվող դրոշմանիշ, ապա բացում է քվեատուփի ճեղքը, և դու ինքդ ես ծրարը գցում քվեատուփը (Հոդված 66)։ Փաստաթղթիդ վրա թանաքով դրոշմակնիք չի դրվում՝ քո մասնակցությունն արձանագրվում է էլեկտրոնային եղանակով։',
      },
    ],
    closing:
      'Քվեարկելուց անմիջապես հետո դուրս եկ տեղամասային կենտրոնից, և տեղամասի ներսում մի՛ հայտնիր ուրիշներին, թե ինչպես ես քվեարկել (Հոդված 65(7))։ Ինչ-որ բան անհանգստացնո՞ւմ է քեզ՝ ազատորեն հաղորդիր «Դիտակետի» միջոցով, անանուն։',
  },
  en: {
    lead:
      'On election day (Sunday, June 7), polling stations are open from 8:00 to 20:00. You vote at the station assigned to your registered address; if you are still in line at 20:00, you keep the right to vote (Article 54). These elections use closed-list proportional representation: you receive a set of pre-printed party ballots and select the one for your preferred party — no marking, no pen needed (CEC decision of 10 May 2021). Voters in inpatient hospital care who cannot reach a station vote via a mobile ballot box at the hospital (Article 54(2)). Citizens in diplomatic or military service abroad vote electronically a few days before election day (Article 60).',
    steps: [
      {
        title: 'Bring valid ID',
        body:
          'A national ID card, a passport (biometric or non-biometric), or a temporary identity document issued by an authorised body. An expired document is not grounds to refuse you the vote. Servicemen voting on a military-unit list bring their military booklet or certificate (Article 64(3)).',
      },
      {
        title: 'Find your station',
        body:
          "Your registered address determines your assigned polling station. Look it up via Ditaket's search bar or in the CEC voter register at elections.am/Register. Use the same register to check that you are on the list. If you spot an error, apply to the authorised body to correct it at least 5 days before election day (Article 12(1)); within the final 4 days — and on election day until voting ends — you can still apply to be added to the supplementary list (Article 12(2), Article 13).",
      },
      {
        title: 'Get registered at the desk',
        body:
          'First, go to the specialist seated at the device and hand over your document. They compare your photo, insert the document into the device, and ask for a fingerprint; when the screen shows a green sign, the device prints a small slip — your voting coupon (քվեարկության կտրոն) — which the specialist gives you. Keep it and show it at the next tables. Then go to the member responsible for the voter list, give them the coupon, sign next to your name, and the member places their seal both next to your signature and on the coupon (Article 64(2)). If you cannot sign yourself, another citizen — but not a commission member — may sign for you.',
      },
      {
        title: 'Take your ballots and envelope',
        body:
          'The ballot-issuing member hands you a stack of pre-printed ballots — one per participating party or alliance (18 in 2026) — together with one voting envelope. You cannot decline any of them; you receive the whole set. You take them all to the booth (Article 65).',
      },
      {
        title: 'Choose your ballot in secret',
        body:
          'In the booth, select the pre-printed ballot of the party or alliance you support and place it — unfolded — in the envelope, then close it. You do not mark or sign anything — choosing the ballot is itself your vote. Drop the unused ballots in the box provided inside the booth. When you leave the booth, take your voting coupon with you — you will need it at the ballot box. Only you may be in the booth, except for one assistance case: a voter who cannot manage the ballots alone may, after informing the chairperson, invite one other person — not a commission member or proxy — who may assist only that one voter (Article 65(4)). Photographing the ballot you chose violates voting secrecy (Articles 5 and 65(7)).',
      },
      {
        title: 'Hand over your coupon, drop the envelope in the box',
        body:
          'Approach the ballot box and give your voting coupon to the responsible member. They check the coupon (and may check your ID) and — without taking the envelope from you — affix a self-verifying stamp (ինքնաստուգվող դրոշմանիշ) onto the ballot through the slit in the corner of the envelope, then open the slot of the box so you can drop the envelope in yourself (Article 66). No ink stamp is placed on your document — your participation is recorded electronically.',
      },
    ],
    closing:
      'Leave the polling station as soon as you have voted, and do not tell anyone inside how you voted (Article 65(7)). If something concerns you at any step, file a report through Ditaket — anonymously.',
  },
  ru: {
    lead:
      'В день выборов (воскресенье, 7 июня) избирательные участки открыты с 8:00 до 20:00. Голосуете на участке, к которому приписаны по адресу регистрации; если в 20:00 вы ещё стоите в очереди — вы сохраняете право проголосовать (статья 54). Эти выборы проходят по пропорциональной системе с закрытыми списками: вы получаете набор заранее отпечатанных бюллетеней партий и выбираете бюллетень предпочитаемой партии — никаких отметок, ручка не нужна (решение ЦИК от 10 мая 2021 г.). Избиратели на стационарном лечении, не способные прийти на участок, голосуют через выездную урну в медучреждении (статья 54(2)). Граждане, находящиеся на дипломатической или военной службе за рубежом, голосуют электронно за несколько дней до дня выборов (статья 60).',
    steps: [
      {
        title: 'Возьмите документ, удостоверяющий личность',
        body:
          'Удостоверение личности, паспорт (биометрический или небиометрический) или временный документ, выданный уполномоченным органом. Истечение срока действия документа не является основанием для отказа в голосовании. Военнослужащие, голосующие по списку воинской части, приносят военный билет или удостоверение (статья 64(3)).',
      },
      {
        title: 'Найдите свой участок',
        body:
          'Адрес вашей регистрации определяет, к какому участку вы приписаны. Найдите его через поиск «Дитакет» или в реестре избирателей ЦИК на elections.am/Register. В том же реестре заранее проверьте, есть ли вы в списке. Если обнаружили ошибку, обратитесь в уполномоченный орган для её исправления не позднее чем за 5 дней до дня выборов (статья 12(1)); в течение последних 4 дней — и в день выборов до окончания голосования — вы ещё можете подать заявление о включении в дополнительный список (статья 12(2), статья 13).',
      },
      {
        title: 'Зарегистрируйтесь у стола',
        body:
          'Сначала подойдите к специалисту, сидящему у устройства, и передайте ему документ. Он сверит вашу фотографию, вставит документ в устройство и попросит приложить палец для снятия отпечатка; когда на экране появится зелёный знак, устройство напечатает небольшой листок — ваш талон для голосования (քվեարկության կտրոն) — который специалист отдаёт вам. Сохраните его и показывайте у следующих столов. Затем подойдите к члену комиссии, ответственному за список избирателей, отдайте талон, распишитесь напротив своего имени, и член комиссии ставит печать и рядом с подписью, и на талоне (статья 64(2)). Если вы не можете расписаться сами, за вас может расписаться другой гражданин — но не член комиссии.',
      },
      {
        title: 'Получите бюллетени и конверт',
        body:
          'Член комиссии, выдающий бюллетени, вручает вам пачку заранее отпечатанных бюллетеней — по одному на каждую участвующую партию или альянс (в 2026 году — 18 штук), и один конверт для голосования. Отказаться от какого-либо из них нельзя — вы получаете весь комплект. Всё это берёте с собой в кабину (статья 65).',
      },
      {
        title: 'Выберите бюллетень тайно',
        body:
          'В кабине выберите заранее отпечатанный бюллетень партии или альянса, которому отдаёте голос, и, не сгибая, положите его в конверт, затем закройте конверт. Никаких отметок и подписей делать не нужно — сам выбор бюллетеня и есть ваш голос. Неиспользованные бюллетени опустите в ящик для неиспользованных бюллетеней внутри кабины. Выходя из кабины, не забудьте талон для голосования — он понадобится у урны. В кабине должны быть только вы — кроме случая помощи: избиратель, не способный справиться с бюллетенями самостоятельно, после уведомления председателя может пригласить одно другое лицо (не члена комиссии и не доверенное лицо), которое имеет право помочь только одному избирателю (статья 65(4)). Фотографирование выбранного бюллетеня нарушает тайну голосования (статьи 5 и 65(7)).',
      },
      {
        title: 'Сдайте талон, опустите конверт в урну',
        body:
          'Подойдите к урне и передайте талон для голосования ответственному члену комиссии. Он проверяет талон (может проверить и ваш документ) и, не забирая у вас конверт, через прорезь в углу конверта наклеивает на бюллетень самопроверяющуюся марку (ինքնաստուգվող դրոշմանիշ), затем открывает прорезь урны, и вы сами опускаете конверт (статья 66). Чернильный штамп на документ больше не ставится — ваше участие фиксируется электронно.',
      },
    ],
    closing:
      'Сразу после голосования покиньте участок и не сообщайте никому внутри, как вы проголосовали (статья 65(7)). Если что-то вас беспокоит на любом шаге, сообщите анонимно через «Дитакет».',
  },
};
