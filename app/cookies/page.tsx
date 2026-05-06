'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';
const SUPPORT_GMAIL_URL = 'https://mail.google.com/mail/?view=cm&fs=1&to=support@aylopet.com&su=Aylopet%20Support';

const t: Record<Lang, { title: string; updatedAt: string; home: string; comingSoon: string }> = {
  GE: {
    title: 'ქუქი პოლიტიკა',
    updatedAt: 'ბოლოს განახლდა: 2026 წლის 27 თებერვალი',
    home: 'მთავარი',
    comingSoon: 'ქართული ვერსია მალე დაემატება.',
  },
  EN: {
    title: 'COOKIE POLICY',
    updatedAt: 'Last updated February 27, 2026',
    home: 'Home',
    comingSoon: 'Coming soon.',
  },
};

export default function CookiesPage() {
  const [lang, setLang] = useState<Lang>('GE');

  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem(LANG_KEY);
      setLang(stored === 'EN' ? 'EN' : 'GE');
    };
    sync();
    window.addEventListener('aylopet-lang-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('aylopet-lang-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggleLang = () => {
    const next = lang === 'GE' ? 'EN' : 'GE';
    localStorage.setItem(LANG_KEY, next);
    setLang(next);
    window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
  };

  const tr = t[lang];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#D4E4D4] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6">
        <Link href="/" className="flex items-center gap-2 no-underline text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d5a27] text-sm font-bold text-white">A</div>
          <span className="text-sm font-semibold">Aylopet</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-full border border-slate-200/90 bg-[#eef2e7] px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-[#e2e8d8]"
          >
            {lang === 'GE' ? 'EN' : 'GE'}
          </button>
          <Link href="/" className="rounded-lg bg-[#2d5a27] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3a6b33]">
            {tr.home}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
        <h1 className="mb-2 font-serif text-3xl font-semibold text-[#1f3f16] sm:text-4xl">{tr.title}</h1>
        <p className="mb-8 text-sm text-slate-500">{tr.updatedAt}</p>

        {lang === 'EN' ? (
          <article className="space-y-6">
            <p className="text-sm leading-7 text-slate-700">
              This Cookie Policy explains how Aylopet LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; and &quot;our&quot;) uses cookies and similar technologies to recognize you when you visit our website at{' '}
              <a className="font-medium text-[#2d5a27] underline" href="https://aylopet.com" target="_blank" rel="noopener noreferrer">https://aylopet.com</a> (&quot;Website&quot;). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            <p className="text-sm leading-7 text-slate-700">
              In some cases we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
            </p>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">What are cookies?</h2>
              <p className="text-sm leading-7 text-slate-700">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                Cookies set by the website owner (in this case, Aylopet LLC) are called &quot;first-party cookies.&quot; Cookies set by parties other than the website owner are called &quot;third-party cookies.&quot; Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">How can I control cookies?</h2>
              <p className="text-sm leading-7 text-slate-700">
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Preference Center. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                The Cookie Preference Center allows you to select which categories of cookies you accept or reject.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                The Cookie Preference Center can be found in the notification banner and on our Website. If you choose to reject cookies, you may still use our Website though your access to some functionality and areas of our Website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                The specific types of first- and third-party cookies served through our Website and the purposes they perform are described in the table below (please note that the specific cookies served may vary depending on the specific Online Properties you visit):
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">How can I control cookies on my browser?</h2>
              <p className="text-sm leading-7 text-slate-700">
                As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser&apos;s help menu for more information. The following is information about how to manage cookies on the most popular browsers:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-slate-700">
                <li><a className="font-medium text-[#2d5a27] underline" href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://support.microsoft.com/en-us/topic/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Internet Explorer</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Firefox</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Edge</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://help.opera.com/en/latest/web-preferences/" target="_blank" rel="noopener noreferrer">Opera</a></li>
              </ul>
              <p className="text-sm leading-7 text-slate-700">
                In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-slate-700">
                <li><a className="font-medium text-[#2d5a27] underline" href="https://www.privacyrights.info/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://youradchoices.ca/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance of Canada</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">European Interactive Digital Advertising Alliance</a></li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">What about other tracking technologies, like web beacons?</h2>
              <p className="text-sm leading-7 text-slate-700">
                Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called &quot;tracking pixels&quot; or &quot;clear gifs&quot;). These are tiny graphics files that contain a unique identifier that enables us to recognize when someone has visited our Website or opened an email including them. This allows us, for example, to monitor the traffic patterns of users from one page within a website to another, to deliver or communicate with cookies, to understand whether you have come to the website from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of email marketing campaigns. In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">Do you use Flash cookies or Local Shared Objects?</h2>
              <p className="text-sm leading-7 text-slate-700">
                Websites may also use so-called &quot;Flash Cookies&quot; (also known as Local Shared Objects or &quot;LSOS&quot;) to, among other things, collect and store information about your use of our services, fraud prevention, and for other site operations.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                If you do not want Flash Cookies stored on your computer, you can adjust the settings of your Flash player to block Flash Cookies storage using the tools contained in the Website Storage Settings Panel. You can also control Flash Cookies by going to the Global Storage Settings Panel and following the instructions (which may include instructions that explain, for example, how to delete existing Flash Cookies (referred to &quot;information&quot; on the Macromedia site), how to prevent Flash LSOS from being placed on your computer without your being asked, and (for Flash Player 8 and later) how to block Flash Cookies that are not being delivered by the operator of the page you are on at the time).
              </p>
              <p className="text-sm leading-7 text-slate-700">
                Please note that setting the Flash Player to restrict or limit acceptance of Flash Cookies may reduce or impede the functionality of some Flash applications, including, potentially, Flash applications used in connection with our services or online content.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">Do you serve targeted advertising?</h2>
              <p className="text-sm leading-7 text-slate-700">
                Third parties may serve cookies on your computer or mobile device to serve advertising through our Website. These companies may use information about your visits to this and other websites in order to provide relevant advertisements about goods and services that you may be interested in. They may also employ technology that is used to measure the effectiveness of advertisements. They can accomplish this by using cookies or web beacons to collect information about your visits to this and other sites in order to provide relevant advertisements about goods and services of potential interest to you. The information collected through this process does not enable us or them to identify your name, contact details, or other details that directly identify you unless you choose to provide these.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">How often will you update this Cookie Policy?</h2>
              <p className="text-sm leading-7 text-slate-700">
                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                The date at the top of this Cookie Policy indicates when it was last updated.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">Where can I get further information?</h2>
              <p className="text-sm leading-7 text-slate-700">If you have questions about our use of cookies or related technologies, contact:</p>
              <div className="border-l-2 border-[#dbe6d3] pl-4 text-sm leading-7 text-slate-700">
                <p className="font-semibold text-[#2d5a27]">Aylopet LLC</p>
                <p>Georgia</p>
                <p>Phone: +995595885625</p>
                <p>
                  Email:{' '}
                  <a className="font-medium text-[#2d5a27] underline" href={SUPPORT_GMAIL_URL} target="_blank" rel="noopener noreferrer">
                    support@aylopet.com
                  </a>
                </p>
              </div>
            </section>
          </article>
        ) : (
          <article className="space-y-6">
            <p className="text-sm leading-7 text-slate-700">
              წინამდებარე ქუქი-ფაილების პოლიტიკა განმარტავს, როგორ იყენებს Aylopet LLC (&quot;კომპანია&quot;, &quot;ჩვენ&quot;, &quot;ჩვენი&quot;) ქუქი-ფაილებსა და მსგავს ტექნოლოგიებს თქვენი ამოცნობისთვის, როდესაც სტუმრობთ ჩვენს ვებგვერდს:{' '}
              <a className="font-medium text-[#2d5a27] underline" href="https://aylopet.com" target="_blank" rel="noopener noreferrer">
                https://aylopet.com
              </a>
              . დოკუმენტი განმარტავს, რას წარმოადგენს ეს ტექნოლოგიები, რატომ ვიყენებთ მათ და რა უფლებები გაქვთ ჩვენი გამოყენების კონტროლისთვის.
            </p>
            <p className="text-sm leading-7 text-slate-700">
              ზოგიერთ შემთხვევაში ქუქი-ფაილები შეიძლება გამოვიყენოთ პერსონალური ინფორმაციის შესაგროვებლად, ან ისეთი ინფორმაციისთვის, რომელიც პერსონალურ ინფორმაციად იქცევა სხვა მონაცემებთან კომბინირების შედეგად.
            </p>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">რა არის ქუქი-ფაილები?</h2>
              <p className="text-sm leading-7 text-slate-700">
                ქუქი-ფაილები არის მცირე ზომის მონაცემთა ფაილები, რომლებიც თავსდება თქვენს კომპიუტერზე ან მობილურ მოწყობილობაზე ვებგვერდის მონახულებისას. ქუქი-ფაილებს ვებგვერდის მფლობელები ფართოდ იყენებენ იმისთვის, რომ ვებგვერდი გამართულად მუშაობდეს, უფრო ეფექტური იყოს და მიიღონ შესაბამისი ანგარიშგებითი ინფორმაცია.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                ვებგვერდის მფლობელის მიერ დაყენებულ ქუქი-ფაილებს (ამ შემთხვევაში, Aylopet LLC) ეწოდება &quot;პირველი მხარის ქუქი-ფაილები&quot;. სხვა მხარეების მიერ დაყენებულ ქუქი-ფაილებს ეწოდება &quot;მესამე მხარის ქუქი-ფაილები&quot;. მესამე მხარის ქუქი-ფაილები უზრუნველყოფს მესამე მხარის ფუნქციებსა და შესაძლებლობებს ვებგვერდზე ან ვებგვერდის მეშვეობით (მაგალითად: რეკლამა, ინტერაქტიული კონტენტი, ანალიტიკა).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">როგორ შემიძლია ქუქი-ფაილების კონტროლი?</h2>
              <p className="text-sm leading-7 text-slate-700">
                თქვენ გაქვთ უფლება თავად გადაწყვიტოთ, მიიღებთ თუ უარყოფთ ქუქი-ფაილებს. ამ უფლების გამოსაყენებლად შეგიძლიათ დააყენოთ პრეფერენციები &quot;Cookie Preference Center&quot;-ში. აღნიშნული ცენტრი საშუალებას გაძლევთ აირჩიოთ ქუქი-ფაილების კატეგორიები, რომლებსაც მიიღებთ ან უარყოფთ. აუცილებელი ქუქი-ფაილების უარყოფა შეუძლებელია, რადგან ისინი მკაცრად აუცილებელია მომსახურების მიწოდებისთვის.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                &quot;Cookie Preference Center&quot; ხელმისაწვდომია შეტყობინების ბანერში და ჩვენს ვებგვერდზე. თუ უარს იტყვით არასავალდებულო ქუქი-ფაილებზე, ვებგვერდის გამოყენებას მაინც შეძლებთ, თუმცა გარკვეულ ფუნქციებსა და არეალებზე წვდომა შეიძლება შეიზღუდოს. ასევე შეგიძლიათ თქვენი ბრაუზერის პარამეტრებიდან დააყენოთ ქუქი-ფაილების მიღება ან უარყოფა.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">როგორ ვაკონტროლო ქუქი-ფაილები ბრაუზერში?</h2>
              <p className="text-sm leading-7 text-slate-700">
                რადგან ბრაუზერებში ქუქი-ფაილების მართვის გზები განსხვავდება, დამატებითი ინფორმაციისთვის ეწვიეთ თქვენი ბრაუზერის Help მენიუს. ყველაზე პოპულარული ბრაუზერები:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-slate-700">
                <li><a className="font-medium text-[#2d5a27] underline" href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://support.microsoft.com/en-us/topic/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Internet Explorer</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Firefox</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Edge</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://help.opera.com/en/latest/web-preferences/" target="_blank" rel="noopener noreferrer">Opera</a></li>
              </ul>
              <p className="text-sm leading-7 text-slate-700">
                დამატებით, სარეკლამო ქსელების უმეტესობა გაძლევთ მიზნობრივ რეკლამაზე უარის თქმის შესაძლებლობას. დეტალებისთვის ეწვიეთ:
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-slate-700">
                <li><a className="font-medium text-[#2d5a27] underline" href="https://www.privacyrights.info/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://youradchoices.ca/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance of Canada</a></li>
                <li><a className="font-medium text-[#2d5a27] underline" href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">European Interactive Digital Advertising Alliance</a></li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">რა ხდება სხვა თრექინგ-ტექნოლოგიების შემთხვევაში?</h2>
              <p className="text-sm leading-7 text-slate-700">
                ქუქი-ფაილები არ არის ვიზიტორების ამოცნობის ან ქცევის ანალიზის ერთადერთი გზა. შესაძლოა დროდადრო გამოვიყენოთ სხვა მსგავსი ტექნოლოგიები, მაგალითად ვებ-ბეკონები (&quot;tracking pixels&quot; ან &quot;clear gifs&quot;). ეს არის მცირე გრაფიკული ფაილები უნიკალური იდენტიფიკატორით, რაც გვაძლევს საშუალებას დავაფიქსიროთ, როდის მოინახულა ვინმემ ვებგვერდი ან გახსნა ელფოსტა, რომელიც ამ ტექნოლოგიას შეიცავს.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">იყენებთ თუ არა Flash ქუქი-ფაილებს ან Local Shared Objects-ს?</h2>
              <p className="text-sm leading-7 text-slate-700">
                ვებგვერდები შესაძლოა იყენებდნენ ე.წ. &quot;Flash ქუქი-ფაილებს&quot; (Local Shared Objects ან &quot;LSOS&quot;) სხვადასხვა მიზნისთვის, მათ შორის ჩვენი სერვისების გამოყენების შესახებ ინფორმაციის შესაგროვებლად, თაღლითობის პრევენციისთვის და სხვა საოპერაციო საჭიროებებისთვის.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                თუ არ გსურთ Flash ქუქი-ფაილების შენახვა თქვენს მოწყობილობაზე, შეგიძლიათ Flash Player-ის პარამეტრებში შეზღუდოთ მათი შენახვა (Website Storage Settings Panel / Global Storage Settings Panel).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">იყენებთ თუ არა მიზნობრივ რეკლამას?</h2>
              <p className="text-sm leading-7 text-slate-700">
                მესამე მხარეებმა შეიძლება განათავსონ ქუქი-ფაილები თქვენს კომპიუტერზე ან მობილურ მოწყობილობაზე ჩვენი ვებგვერდის მეშვეობით რეკლამის საჩვენებლად. ასეთმა კომპანიებმა შეიძლება გამოიყენონ ინფორმაცია ამ და სხვა ვებგვერდებზე თქვენი ვიზიტების შესახებ, რათა გაჩვენონ თქვენთვის შესაბამისი შეთავაზებები.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                ამ პროცესით მიღებული ინფორმაცია, თავისთავად, არ გვაძლევს საშუალებას დავადგინოთ თქვენი სახელი, საკონტაქტო ინფორმაცია ან სხვა პირდაპირი იდენტიფიკატორები, თუ თქვენ თავად არ მოგვაწოდებთ ამ მონაცემებს.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">რამდენად ხშირად განახლდება ქუქი-ფაილების პოლიტიკა?</h2>
              <p className="text-sm leading-7 text-slate-700">
                შესაძლოა პერიოდულად განვაახლოთ ეს დოკუმენტი, მათ შორის ქუქი-ფაილებში განხორციელებული ცვლილებების, საოპერაციო საჭიროებების, იურიდიული ან მარეგულირებელი მოთხოვნების გამო. გთხოვთ, რეგულარულად გადაამოწმოთ ეს გვერდი.
              </p>
              <p className="text-sm leading-7 text-slate-700">
                გვერდის დასაწყისში მითითებული თარიღი ასახავს ბოლო განახლების დროს.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">სად შემიძლია დამატებითი ინფორმაციის მიღება?</h2>
              <p className="text-sm leading-7 text-slate-700">
                თუ გაქვთ შეკითხვები ქუქი-ფაილების ან სხვა ტექნოლოგიების გამოყენებასთან დაკავშირებით, დაგვიკავშირდით:
              </p>
              <div className="border-l-2 border-[#dbe6d3] pl-4 text-sm leading-7 text-slate-700">
                <p className="font-semibold text-[#2d5a27]">Aylopet LLC</p>
                <p>საქართველო</p>
                <p>ტელეფონი: +995595885625</p>
                <p>
                  ელფოსტა:{' '}
                  <a className="font-medium text-[#2d5a27] underline" href={SUPPORT_GMAIL_URL} target="_blank" rel="noopener noreferrer">
                    support@aylopet.com
                  </a>
                </p>
              </div>
            </section>
          </article>
        )}
      </main>
    </div>
  );
}

