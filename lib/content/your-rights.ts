import type { Locale } from '@/lib/i18n/routing';

export type Right = {
  title: string;
  body: string;
  ecArticle: string;
};

export const VOTER_RIGHTS: Record<Locale, { lead: string; rights: Right[] }> = {
  am: {
    lead:
      'Որպես Հայաստանի քաղաքացի՝ ընտրությունների օրը դու պաշտպանված ես հետևյալ իրավունքներով։ ՀՀ Ընտրական օրենսգիրքը երաշխավորում է ազատ, գաղտնի, և անարգել քվեարկություն։ Հոդվածի համարները ՀՀ Ընտրական օրենսգրքի ընթացիկ՝ հայերեն բնագրով են։',
    rights: [
      {
        title: 'Ազատ քվեարկություն',
        body: 'Ոչ ոք չի կարող ճնշում գործադրել քո ընտրության վրա։ Հոդված 5-ի համաձայն. «Քվեարկողի կամքի ազատ արտահայտման նկատմամբ վերահսկողությունն արգելվում է»։ Հոդված 21-ի վերնագիրն իսկ՝ «Ընտրողների կամքի ազատ արտահայտման վրա ներգործության արգելումը»։',
        ecArticle: 'Հոդված 5 · 21',
      },
      {
        title: 'Քվեի գաղտնիություն',
        body: 'Քո քվեի բովանդակությունը գաղտնիք է։ Հոդված 5. «Քվեարկությունը գաղտնի է: Ընտրողի համար քվեարկության գաղտնիությունը ոչ միայն իրավունք է, այլև պարտականություն»։ Քվեախցիկում մեկից ավելի անձ չպետք է լինի, բացառությամբ Հոդված 65(4)-ով սահմանված օգնության դեպքի։',
        ecArticle: 'Հոդված 5',
      },
      {
        title: 'Հաշմանդամության դեպքում օգնություն',
        body: 'Հոդված 65(4). «Քվեաթերթիկը ինքնուրույն լրացնելու հնարավորություն չունեցող ընտրողը իրավունք ունի… քվեարկության խցիկ հրավիրելու այլ անձի, որը չպետք է լինի ընտրական հանձնաժողովի անդամ, վստահված անձ: Անձն իրավունք ունի օգնելու… միայն մեկ ընտրողի»։',
        ecArticle: 'Հոդված 65(4)',
      },
      {
        title: 'Տեսանկարահանման իրավունք տեղամասում',
        body: 'Հոդված 6(12)-ի համաձայն՝ վստահված անձինք, դիտորդները, ԶԼՄ ներկայացուցիչները կարող են ներկա լինել քվեարկության ընթացքին և լուսանկարահանել, տեսանկարահանել՝ չխախտելով քվեի գաղտնիությունը։ ԿԸՀ-ի 2017 և 2021 թվականների պրակտիկայով տեղամասերում տեղադրվել են ֆիքսված տեսախցիկներ՝ իրական ժամանակում հանրային հեռարձակմամբ. քվեախցիկի ներսը չի դիտարկվում։',
        ecArticle: 'Հոդված 6(12)',
      },
      {
        title: 'Քվեարկության արգելք 50 մ գոտում',
        body: 'Հոդված 21(4). «Արգելվում է քվեարկության օրը տեղամասային կենտրոնին հարող տարածքում մինչև 50 մետր շառավղով խմբերով հավաքվելը, տեղամասային կենտրոնի մուտքին հարող տարածքում մեքենաների կուտակումը»։ Ընտրողների սովորական հերթը խախտում չէ։',
        ecArticle: 'Հոդված 21(4)',
      },
      {
        title: 'Հաղորդելու իրավունք',
        body: 'Ցանկացած խախտում դու կարող ես հաղորդել՝ տեղամասի հանձնաժողովի նախագահին, դիտորդական կազմակերպություններին, ոստիկանությանը կամ ԿԸՀ-ին։ «Դիտակետի» միջոցով կարող ես անանուն հաղորդել։',
        ecArticle: 'ՀՀ Ընտրական օրենսգիրք',
      },
    ],
  },
  en: {
    lead:
      "As a citizen of Armenia, you are protected by the following rights on election day. The RA Electoral Code guarantees free, secret, and unimpeded voting. Article numbers below refer to the CURRENT Armenian original of the Code.",
    rights: [
      {
        title: 'Free vote',
        body: 'No one may pressure your choice. Article 5: «Քվեարկողի կամքի ազատ արտահայտման նկատմամբ վերահսկողությունն արգելվում է» — "Control over the free expression of will of an elector is prohibited." Article 21 is titled "Prohibiting influence on the free expression of will of electors".',
        ecArticle: 'Հոդված 5 · 21',
      },
      {
        title: 'Secrecy of vote',
        body: 'The content of your ballot is secret. Article 5: «Քվեարկությունը գաղտնի է» — "Voting is by secret ballot. Secrecy is not only a right but also a duty of the elector." Only one person may be in the voting booth, except for the permitted assistance case under Article 65(4).',
        ecArticle: 'Հոդված 5',
      },
      {
        title: 'Assistance for disability',
        body: 'Article 65(4): a voter unable to fill in the ballot on their own may invite ONE other person into the booth (not a commission member or a proxy), and that person may assist only one voter throughout the day.',
        ecArticle: 'Հոդված 65(4)',
      },
      {
        title: 'Recording rights inside the polling station',
        body: 'Article 6(12) guarantees the right of proxies, observers, and media representatives to be present throughout voting and to photograph and videotape, without violating ballot secrecy. In practice, fixed cameras have been installed at every polling station for the 2017 and 2021 elections, with real-time public webcast; the inside of the voting booth itself is NOT covered.',
        ecArticle: 'Հոդված 6(12)',
      },
      {
        title: '50-metre exclusion zone',
        body: 'Article 21(4): «Արգելվում է քվեարկության օրը տեղամասային կենտրոնին հարող տարածքում մինչև 50 մետր շառավղով խմբերով հավաքվելը…» — gathering in groups within a 50-metre radius of a polling station, and clusters of vehicles near the entrance, are prohibited on voting day. The voter queue itself is exempt.',
        ecArticle: 'Հոդված 21(4)',
      },
      {
        title: 'Right to report',
        body: 'You may report any violation to the precinct commission chair, observer organisations, the police, or the CEC. Through Ditaket you can also report anonymously.',
        ecArticle: 'RA Electoral Code',
      },
    ],
  },
  ru: {
    lead:
      'Как гражданин Армении, в день выборов вы защищены следующими правами. Избирательный кодекс РА гарантирует свободное, тайное и беспрепятственное голосование. Номера статей ниже соответствуют ТЕКУЩЕМУ армянскому оригиналу Кодекса.',
    rights: [
      {
        title: 'Свободное голосование',
        body: 'Никто не может оказывать давление на ваш выбор. Статья 5: «Контроль над свободным выражением воли избирателя запрещён». Статья 21 называется «Запрещение влияния на свободное волеизъявление избирателей».',
        ecArticle: 'Հոդված 5 · 21',
      },
      {
        title: 'Тайна голосования',
        body: 'Содержание вашего бюллетеня — тайна. Статья 5: «Голосование тайное. Тайна голосования — не только право, но и обязанность избирателя». В кабине одновременно может находиться только один человек, кроме предусмотренного статьёй 65(4) случая содействия.',
        ecArticle: 'Հոդված 5',
      },
      {
        title: 'Помощь при инвалидности',
        body: 'Статья 65(4): избиратель, не способный самостоятельно заполнить бюллетень, может пригласить ОДНОГО помощника (не члена комиссии и не доверенное лицо), который вправе помочь только одному избирателю за день.',
        ecArticle: 'Հոդված 65(4)',
      },
      {
        title: 'Право на фото- и видеосъёмку на участке',
        body: 'Статья 6(12) гарантирует право доверенных лиц, наблюдателей и представителей СМИ присутствовать в течение всего голосования и вести фото- и видеосъёмку, не нарушая тайны голосования. На практике на выборах 2017 и 2021 годов на каждом участке были установлены фиксированные камеры с прямой трансляцией; внутренняя часть кабины камерами НЕ охватывается.',
        ecArticle: 'Հոդված 6(12)',
      },
      {
        title: '50-метровая запретная зона',
        body: 'Статья 21(4): запрещены в день голосования скопления групп в радиусе 50 метров от участка и сосредоточение транспорта у входа. Обычная очередь избирателей нарушением не является.',
        ecArticle: 'Հոդված 21(4)',
      },
      {
        title: 'Право сообщить',
        body: 'Вы можете сообщить о любом нарушении председателю участковой комиссии, организациям наблюдателей, полиции или ЦИК. Через Дитакет — анонимно.',
        ecArticle: 'Избирательный кодекс РА',
      },
    ],
  },
};
