import type { Locale } from '@/lib/i18n/routing';

export type Step = { title: string; body: string };

export const HOW_TO_VOTE: Record<Locale, { lead: string; steps: Step[]; closing: string }> = {
  am: {
    lead:
      'Քվեարկության օրը (հունիսի 7) ընտրատեղամասերը բաց են առավոտյան 8:00-ից մինչև երեկոյան 20:00։ Հետևի՛ր այս հինգ քայլերին։',
    steps: [
      {
        title: 'Վերցրու անձնագիր',
        body: 'Բեր անձնագիր կամ նույնականացման քարտ։ Առանց փաստաթղթի քվեարկություն չի թույլատրվում։',
      },
      {
        title: 'Գտիր քո տեղամասը',
        body: 'Անդամագրումը անցկացվում է բնակության հասցեով։ Քո հասցեին համապատասխանող տեղամասը գտիր «Դիտակետի» էջի որոնման տողի միջոցով կամ ԿԸՀ-ի կայքում։',
      },
      {
        title: 'Արձանագրիր մուտքը',
        body: 'Տեղամասի մուտքի մոտ ցույց տուր փաստաթուղթդ։ Հանձնաժողովը կփնտրի քեզ ընտրացուցակում և կտա ստորագրման թերթիկը։',
      },
      {
        title: 'Քվեարկիր գաղտնի',
        body: 'Ստացիր քվեաթերթը, գնա քվեախցիկ, և նշիր քո ընտրությունը։ Քվեախցիկում միայն դու պետք է լինես (բացառությամբ Հոդված 65(4)-ով սահմանված օգնության դեպքերի)։ Քվեաթերթի լուսանկարումն արգելված է (Հոդված 5 և 65(7))։',
      },
      {
        title: 'Գցիր քվեատուփը',
        body: 'Ծալիր քվեաթերթը այնպես, որ ընտրությունդ չերևա, ապա գցիր քվեատուփը։',
      },
    ],
    closing:
      'Եթե ինչ-որ բան անհանգստացնում է քեզ, ազատորեն հաղորդիր «Դիտակետի» միջոցով։',
  },
  en: {
    lead:
      'On election day (June 7), polling stations are open from 08:00 to 20:00. Follow these five steps.',
    steps: [
      {
        title: 'Bring your ID',
        body: 'Bring a passport or national ID card. Voting without a document is not permitted.',
      },
      {
        title: 'Find your station',
        body: "You are registered by residential address. Find your assigned station via Ditaket's search bar, or on the CEC website.",
      },
      {
        title: 'Check in',
        body: 'Show your document at the entrance. The commission finds you in the voter list and gives you the signed slip.',
      },
      {
        title: 'Vote in secret',
        body: 'Take the ballot, go to the booth, mark your choice. You must be alone in the booth (except for the assistance case permitted under Article 65(4)). Photographing the ballot is prohibited (Articles 5 and 65(7)).',
      },
      {
        title: 'Drop in the ballot box',
        body: 'Fold the ballot so your choice is hidden, then drop it in the ballot box.',
      },
    ],
    closing: 'If something concerns you, file a report through Ditaket — anonymously.',
  },
  ru: {
    lead:
      'В день выборов (7 июня) участки открыты с 8:00 до 20:00. Следуйте этим пяти шагам.',
    steps: [
      {
        title: 'Возьмите документ',
        body: 'Возьмите паспорт или удостоверение личности. Без документа голосование не допускается.',
      },
      {
        title: 'Найдите свой участок',
        body: 'Регистрация — по адресу проживания. Найдите ваш участок через поиск Дитакет или на сайте ЦИК.',
      },
      {
        title: 'Зарегистрируйтесь',
        body: 'Покажите документ у входа. Комиссия найдёт вас в списке избирателей и выдаст подписной лист.',
      },
      {
        title: 'Голосуйте тайно',
        body: 'Возьмите бюллетень, пройдите в кабину, отметьте свой выбор. В кабине должен быть только один человек (кроме случая содействия по статье 65(4)). Фотографирование бюллетеня запрещено (статьи 5 и 65(7)).',
      },
      {
        title: 'Опустите в урну',
        body: 'Сложите бюллетень так, чтобы выбор был не виден, и опустите в урну.',
      },
    ],
    closing:
      'Если что-то вас беспокоит, сообщите анонимно через Дитакет.',
  },
};
