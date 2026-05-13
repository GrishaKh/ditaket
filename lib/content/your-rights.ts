import type { Locale } from '@/lib/i18n/routing';

export type Right = {
  title: string;
  body: string;
  ecArticle: string;
};

export const VOTER_RIGHTS: Record<Locale, { lead: string; rights: Right[] }> = {
  am: {
    lead:
      'Որպես Հայաստանի քաղաքացի՝ ընտրությունների օրը դու պաշտպանված ես հետևյալ իրավունքներով։ Ընտրական օրենսգիրքը երաշխավորում է ազատ, գաղտնի, և անարգել քվեարկություն։',
    rights: [
      {
        title: 'Ազատ քվեարկություն',
        body: 'Ոչ ոք չի կարող ճնշում գործադրել քո ընտրության վրա։ Քո ձայնի ազատ արտահայտման ցանկացած վերահսկողություն արգելված է։',
        ecArticle: 'Հոդված 4',
      },
      {
        title: 'Քվեի գաղտնիություն',
        body: 'Քո քվեի բովանդակությունը գաղտնիք է։ Ոչ ոք իրավունք չունի տեսնել, թե ինչպես ես նշում քվեաթերթը։ Քվեախցիկում մեկից ավելի անձ չպետք է լինի, բացառությամբ օգնության պաշտոնական դեպքերի։',
        ecArticle: 'Հոդված 5, 6',
      },
      {
        title: 'Հաշմանդամության դեպքում օգնություն',
        body: 'Եթե ֆիզիկապես չես կարող ինքնուրույն լրացնել քվեաթերթը, կարող ես հրավիրել մեկ ընտրողի (ոչ հանձնաժողովի անդամ, ոչ դիտորդ, ոչ ԶԼՄ ներկայացուցիչ)։ Նույն օգնողը կարող է օգնել միայն մեկ ընտրողի։',
        ecArticle: 'Հոդված 65',
      },
      {
        title: 'Տեսախցիկներ տեղամասում',
        body: 'Տեղամասում պարտադիր են ֆիքսված տեսախցիկներ, որոնք իրական ժամանակում հեռարձակվում են։ Քվեախցիկի ներսը տեսախցիկներով չի դիտարկվում՝ քվեի գաղտնիության պաշտպանության համար։',
        ecArticle: 'Հոդված 8.11.1',
      },
      {
        title: 'Քվեարկության արգելք 50 մ գոտում',
        body: 'Տեղամասի 50 մետր շառավղում քվեարկության օրը արգելված է քարոզչություն, քվեարկության արդյունքների վրա ազդեցություն կամ խմբավորում՝ բացառությամբ ընտրողների շարքի։',
        ecArticle: 'Հոդված 22.3',
      },
      {
        title: 'Հաղորդելու իրավունք',
        body: 'Ցանկացած խախտում դու կարող ես հաղորդել՝ տեղամասի հանձնաժողովի նախագահին, դիտորդական կազմակերպություններին, ոստիկանությանը կամ ԿԸՀ-ին։ Դիտակետի միջոցով կարող ես անանուն հաղորդել։',
        ecArticle: 'Հոդված 8',
      },
    ],
  },
  en: {
    lead:
      "As a citizen of Armenia, you are protected by the following rights on election day. The Electoral Code guarantees free, secret, and unimpeded voting.",
    rights: [
      {
        title: 'Free vote',
        body: 'No one may pressure your choice. Any control over the free expression of your will is prohibited.',
        ecArticle: 'Article 4',
      },
      {
        title: 'Secrecy of vote',
        body: "The content of your ballot is secret. No one is entitled to see how you mark it. Only one person may be in the voting booth at a time, except in officially permitted assistance cases.",
        ecArticle: 'Article 5, 6',
      },
      {
        title: 'Assistance for disability',
        body: 'If you cannot physically complete the ballot independently, you may invite ONE voter to assist (not a commission member, observer, or media representative). The same assistant may only help one voter throughout the day.',
        ecArticle: 'Article 65',
      },
      {
        title: 'Cameras at polling stations',
        body: 'Fixed cameras at every polling station broadcast in real time. The inside of the voting booth itself is NOT covered, to preserve ballot secrecy.',
        ecArticle: 'Article 8.11.1',
      },
      {
        title: '50-metre exclusion zone',
        body: 'Campaigning, attempts to influence voters, or unauthorized gatherings within 50 metres of a polling station on voting day are prohibited (the voter queue itself is exempt).',
        ecArticle: 'Article 22.3',
      },
      {
        title: 'Right to report',
        body: 'You may report any violation to the precinct commission chair, observer organisations, the police, or the CEC. Through Ditaket, you can also report anonymously.',
        ecArticle: 'Article 8',
      },
    ],
  },
  ru: {
    lead:
      'Как гражданин Армении, в день выборов вы защищены следующими правами. Избирательный кодекс гарантирует свободное, тайное и беспрепятственное голосование.',
    rights: [
      {
        title: 'Свободное голосование',
        body: 'Никто не может оказывать давление на ваш выбор. Любой контроль над свободным выражением вашей воли запрещён.',
        ecArticle: 'Статья 4',
      },
      {
        title: 'Тайна голосования',
        body: 'Содержание вашего бюллетеня — тайна. Никто не вправе видеть, как вы его заполняете. В кабине одновременно может находиться только один человек, кроме официальных случаев содействия.',
        ecArticle: 'Статья 5, 6',
      },
      {
        title: 'Помощь при инвалидности',
        body: 'Если вы физически не можете самостоятельно заполнить бюллетень, вы можете пригласить ОДНОГО избирателя для помощи (не члена комиссии, не наблюдателя, не представителя СМИ). Тот же помощник может помочь только одному избирателю за день.',
        ecArticle: 'Статья 65',
      },
      {
        title: 'Камеры на участках',
        body: 'На каждом участке обязательны фиксированные камеры с прямой трансляцией. Внутренняя часть кабины камерами НЕ охватывается — для защиты тайны голосования.',
        ecArticle: 'Статья 8.11.1',
      },
      {
        title: '50-метровая запретная зона',
        body: 'В радиусе 50 метров от участка в день голосования запрещены агитация, попытки воздействия на избирателей и несанкционированные скопления (очередь самих избирателей — исключение).',
        ecArticle: 'Статья 22.3',
      },
      {
        title: 'Право сообщить',
        body: 'Вы можете сообщить о любом нарушении председателю участковой комиссии, организациям наблюдателей, полиции или ЦИК. Через Дитакет — также анонимно.',
        ecArticle: 'Статья 8',
      },
    ],
  },
};
