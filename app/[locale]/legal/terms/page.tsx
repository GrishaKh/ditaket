import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/routing';

const CONTENT: Record<Locale, { title: string; updated: string; body: string[] }> = {
  am: {
    title: 'Օգտվելու պայմաններ',
    updated: 'Թարմացված՝ 2026 թ. մայիսի 13',
    body: [
      'Դիտակետը ազատ քաղաքացիական պլատֆորմ է։ Օգտվելով նրանից՝ դու ընդունում ես ստորև բերված պարզ կանոնները։',
      'Քեզ արգելվում է ուղարկել քվեաթերթի լուսանկար (ՀՀ Ընտրական օրենսգիրք, Հոդված 5 և 65(7))։ Քվեի գաղտնիության խախտումը հանցագործություն է։ Մենք ինքնաբերաբար ստուգում ենք վերբեռնված պատկերները և մերժում այնպիսիք, որոնք քվեաթերթեր են պարունակում։',
      'Քեզ արգելվում է ուղարկել ակնհայտորեն կեղծ, զազրախառն կամ վիրավորական բովանդակություն, անձնական անուններ, կամ կրկնապատկվող ողողման հաղորդումներ։ Կրկնակի խախտումները կարող են հանգեցնել քո մատնահետքի IP-ի ժամանակավոր արգելափակմանը։',
      'Բոլոր հաղորդումները հրապարակվում են որպես «չստուգված»՝ մինչև գործընկեր կազմակերպության հաստատումը։ Դիտակետը ոչ մի անձնական դատավարության պատասխանատվություն չի կրում քո հաղորդման բովանդակության հետևանքով։',
      'Մենք իրավունք ունենք հեռացնել ցանկացած հաղորդում, որը խախտում է այս պայմանները կամ Հայաստանի օրենքները։',
      'Կոդը՝ բաց (հեռանկարային՝ AGPL/MIT), տեղակայված է Vercel-ում։',
    ],
  },
  en: {
    title: 'Terms of use',
    updated: 'Updated 2026-05-13',
    body: [
      'Ditaket is a free civic platform. By using it you accept the following simple rules.',
      'You may NOT upload a photograph of a ballot (RA Electoral Code, Articles 5 and 65(7)). Violating ballot secrecy is a crime. We screen uploaded images automatically and reject any containing ballots.',
      'You may not submit obviously fabricated, harassing, or insulting content, personal names, or flooding repeat reports. Repeated violations can result in temporary blocking of your fingerprint / IP.',
      'All reports are published as "unverified" until a partner organisation confirms them. Ditaket bears no personal-legal responsibility for the content you submit.',
      'We reserve the right to remove any report that violates these terms or the laws of Armenia.',
      'Source code: open (planned AGPL/MIT licence). Hosted on Vercel.',
    ],
  },
  ru: {
    title: 'Условия использования',
    updated: 'Обновлено 13.05.2026',
    body: [
      'Дитакет — бесплатная гражданская платформа. Используя её, вы принимаете следующие простые правила.',
      'Запрещено загружать фотографию бюллетеня (Избирательный кодекс РА, статьи 5 и 65(7)). Нарушение тайны голосования — преступление. Мы автоматически проверяем загруженные изображения и отклоняем те, что содержат бюллетени.',
      'Запрещено отправлять явно сфабрикованный, оскорбительный или травлящий контент, личные имена, повторные флуд-сообщения. За повторные нарушения возможна временная блокировка вашего отпечатка / IP.',
      'Все сообщения публикуются как «непроверенные» до подтверждения партнёрской организацией. Дитакет не несёт личной юридической ответственности за содержание ваших сообщений.',
      'Мы оставляем за собой право удалять любое сообщение, нарушающее эти условия или законы Армении.',
      'Исходный код: открытый (планируется лицензия AGPL/MIT). Размещён на Vercel.',
    ],
  },
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[locale];
  return (
    <main className="container-main max-w-prose py-12">
      <h1 className="font-display text-4xl font-bold text-navy-900 sm:text-5xl">
        {c.title}
      </h1>
      <p className="mt-2 text-xs text-navy-700/70">{c.updated}</p>
      <div className="mt-8 space-y-4 leading-relaxed text-navy-700">
        {c.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </main>
  );
}
