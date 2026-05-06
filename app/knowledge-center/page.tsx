import type { Metadata } from 'next';
import Link from 'next/link';
import { KnowledgeCenterHeader } from './KnowledgeCenterHeader';

export const metadata: Metadata = {
  title: 'Aylopet-ის ცოდნის ცენტრი: ყველაფერი კვებაზე',
  description:
    'ძაღლის კვებაზე პრაქტიკული გზამკვლევები, მითები და რეალური ფაქტები. Aylopet-ის ცოდნის ცენტრი შექმნილია იმისთვის, რომ სწორი არჩევანი გაგიადვილდეთ.',
  keywords: [
    'ძაღლის კვება',
    'ძაღლის ჯანსაღი კვება',
    'dog nutrition',
    'pasteurized raw food',
    'Aylopet ცოდნის ცენტრი',
  ],
  alternates: {
    canonical: '/knowledge-center',
  },
};

const mythCards = [
  {
    myth: 'მითი #1: რაც ძვირია, ყოველთვის უკეთესია.',
    fact: 'ფასი ხარისხის მხოლოდ ერთი ინდიკატორია. მნიშვნელოვანია ინგრედიენტების გამჭვირვალობა, ნუტრიენტული ბალანსი და ინდივიდუალური შესაბამისობა.',
  },
  {
    myth: 'მითი #2: ყველა ძაღლს ერთნაირი რაციონი სჭირდება.',
    fact: 'ასაკი, ჯიში, აქტივობა და ჯანმრთელობის მდგომარეობა რადიკალურად ცვლის საჭიროებებს.',
  },
  {
    myth: 'მითი #3: „ბევრი ცილა“ ყოველთვის საუკეთესოა.',
    fact: 'ძალიან მაღალი ცილა ყველა პროფილისთვის ოპტიმალური არ არის. სწორია ბალანსი, არა მხოლოდ ერთი მაჩვენებლის ზრდა.',
  },
];

const topics = [
  'როგორ შევარჩიოთ სწორი კვება ასაკის მიხედვით',
  'მშრალი, სველი თუ პასტერიზებული ნედლი: რას ნიშნავს რეალური განსხვავება',
  'კვების რეჟიმი, პორციები და პრაქტიკული რუტინა',
  'როგორ წავიკითხოთ საკვების ეტიკეტი და არ შევცდეთ არჩევანში',
  'დამწყებთათვის: რომელი შეცდომებია ყველაზე ხშირი კვების მართვაში',
];

export default function KnowledgeCenterPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#1e2c1d]">
      <KnowledgeCenterHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-3xl border border-[#d9e5d3] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2D4F1E]/75">Knowledge Hub</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#21371e] sm:text-4xl">
            Aylopet-ის ცოდნის ცენტრი: ყველაფერი კვებაზე
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
            ეს გვერდი შექმნილია ერთი მიზნისთვის: დაგეხმაროთ ძაღლის კვებაზე სწორი გადაწყვეტილებების მიღებაში. აქ იხილავთ
            პრაქტიკულ სტატიებს, მითების დამსხვრევას და რეალურ ფაქტებს, რომლებსაც დაეყრდნობით ყოველდღიურ ცხოვრებაში.
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {mythCards.map((item) => (
            <article key={item.myth} className="rounded-2xl border border-[#dbe6d5] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#2d4f1e]">{item.myth}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{item.fact}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-[#dbe6d5] bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold text-[#21371e]">რა თემები შეგხვდებათ აქ</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700 sm:text-base">
            {topics.map((topic) => (
              <li key={topic} className="rounded-xl bg-[#f5f8f2] px-4 py-2">
                {topic}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-3xl border border-[#dbe6d5] bg-gradient-to-br from-white to-[#f1f6ec] p-6 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold text-[#21371e]">შემდეგი ნაბიჯი</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
            თუ გსურთ უკვე თქვენი ძაღლისთვის ინდივიდუალურად მორგებული კვების ხედვა, გამოიყენეთ ჩვენი AI ჩათი და მიიღეთ
            რეკომენდაციები პროფილის მიხედვით.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/aylopetai-chat"
              className="inline-flex items-center rounded-full bg-[#2D4F1E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253f18]"
            >
              AylopetAI ჩათის დაწყება
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center rounded-full border border-[#cfdcc8] bg-white px-5 py-2.5 text-sm font-semibold text-[#2d4f1e] transition hover:bg-[#f4f8f1]"
            >
              FAQ-ის ნახვა
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
