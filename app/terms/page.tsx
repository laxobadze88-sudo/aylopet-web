'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Lang = 'GE' | 'EN';
const LANG_KEY = 'aylopet-lang';
const SUPPORT_EMAIL = 'support@aylopet.com';
const SUPPORT_GMAIL_URL = 'https://mail.google.com/mail/?view=cm&fs=1&to=support@aylopet.com&su=Aylopet%20Support';

function renderWithSupportEmail(text: string) {
  const chunks = text.split(SUPPORT_EMAIL);
  return chunks.map((chunk, idx) => (
    <span key={`${chunk}-${idx}`}>
      {chunk}
      {idx < chunks.length - 1 ? (
        <a href={SUPPORT_GMAIL_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-[#2d5a27] underline">
          {SUPPORT_EMAIL}
        </a>
      ) : null}
    </span>
  ));
}

const t: Record<Lang, { title: string; comingSoon: string; home: string; englishTitle: string }> = {
  GE: { title: 'გამოყენების პირობები', comingSoon: 'მალე დაგვემატება', home: 'მთავარი', englishTitle: 'Terms of Use' },
  EN: { title: 'Terms of Use', comingSoon: 'Coming soon', home: 'Home', englishTitle: 'Terms of Use' },
};

const geSections: Array<{ heading: string; body: string[]; bullets?: string[] }> = [
  {
    heading: 'შეთანხმება ჩვენს იურიდიულ პირობებზე',
    body: [
      'ჩვენ ("კომპანია", "ჩვენ", "ჩვენი") ვმართავთ და ვაწვდით სერვისებს, რომლებიც მიუთითებს ან უკავშირდება ამ იურიდიულ პირობებს ("იურიდიული პირობები") (ერთობლივად, "სერვისები"). თქვენ შეგიძლიათ დაგვიკავშირდეთ ელფოსტით მისამართზე support@aylopet.com ან ფოსტით მისამართზე: დავით აღმაშენებლის გამზირი, ნომერი 200, სამტრედია, საქართველო.',
      'ეს იურიდიული პირობები წარმოადგენს იურიდიულად სავალდებულო შეთანხმებას თქვენსა (პირადად ან იურიდიული პირის სახელით - "თქვენ") და ჩვენს შორის თქვენს მიერ სერვისებზე წვდომისა და გამოყენების შესახებ. სერვისებზე წვდომით თქვენ ადასტურებთ, რომ წაიკითხეთ, გაიგეთ და ეთანხმებით ყველა ამ იურიდიულ პირობას. თუ თქვენ არ ეთანხმებით ყველა ამ იურიდიულ პირობას, მაშინ გეკრძალებათ სერვისების გამოყენება და დაუყოვნებლივ უნდა შეწყვიტოთ მათი გამოყენება.',
      'დამატებითი პირობები ან დოკუმენტები, რომლებიც შეიძლება დროდადრო განთავსდეს სერვისებზე, პირდაპირ არის ინკორპორირებული ამ დოკუმენტში მითითების სახით. ჩვენ ვიტოვებთ უფლებას, ჩვენი შეხედულებისამებრ, ნებისმიერ დროს და ნებისმიერი მიზეზით შევიტანოთ ცვლილებები ან მოდიფიკაციები ამ იურიდიულ პირობებში. ნებისმიერი ცვლილების შესახებ ჩვენ გაცნობებთ ოფიციალური შეტყობინების გაგზავნით იმ ელფოსტაზე, რომელიც მიუთითეთ ანგარიშის შექმნისას. თქვენ იტოვებთ უფლებას ცალმხრივად შეწყვიტოთ ჩვენთან შეთანხმება, თუ ცვლილებები და/ან მოდიფიკაციები თქვენთვის მიუღებელია.',
    ],
  },
  {
    heading: '1. ჩვენი სერვისები',
    body: [
      'სერვისების გამოყენებისას მოწოდებული ინფორმაცია არ არის გამიზნული გასავრცელებლად ან გამოსაყენებლად ნებისმიერი პირის ან იურიდიული პირის მიერ ნებისმიერ იურისდიქციაში ან ქვეყანაში, სადაც ასეთი გავრცელება ან გამოყენება ეწინააღმდეგება კანონს ან რეგულაციას, ან რაც დაგვაკისრებდა რეგისტრაციის ვალდებულებას ასეთ იურისდიქციაში ან ქვეყანაში.',
      'შესაბამისად, ის პირები, რომლებიც ირჩევენ სერვისებზე წვდომას სხვა ლოკაციებიდან, ამას აკეთებენ საკუთარი ინიციატივით და თავად არიან პასუხისმგებელნი ადგილობრივი კანონების დაცვაზე, თუ და რამდენადაც ადგილობრივი კანონები გამოიყენება.',
    ],
  },
  {
    heading: '2. ინტელექტუალური საკუთრების უფლებები',
    body: [
      'ჩვენი ინტელექტუალური საკუთრება: ჩვენ ვართ ჩვენს სერვისებში არსებული ყველა ინტელექტუალური საკუთრების უფლების მფლობელი ან ლიცენზიის მფლობელი, მათ შორის ყველა საწყისი კოდის, მონაცემთა ბაზების, ფუნქციონალის, პროგრამული უზრუნველყოფის, ვებსაიტის დიზაინის, აუდიო, ვიდეო, ტექსტის, ფოტოებისა და გრაფიკის (ერთობლივად "კონტენტი"), ასევე მათში შემავალი სავაჭრო ნიშნების, მომსახურების ნიშნებისა და ლოგოების ("ნიშნები").',
      'თქვენი წარდგენილი მასალები: სერვისების შესახებ ნებისმიერი კითხვის, კომენტარის, შეთავაზების, იდეის, გამოხმაურების ან სხვა ინფორმაციის პირდაპირ ჩვენთვის გამოგზავნით, თქვენ თანხმდებით, რომ გადმოგვცემთ ყველა ინტელექტუალური საკუთრების უფლებას აღნიშნულ მასალებზე, თუ სხვაგვარად არ რეგულირდება საქართველოს კანონმდებლობით.',
      'სერვისების ნებისმიერი ნაწილის მეშვეობით მასალების გამოგზავნით თქვენ:',
    ],
    bullets: [
      'ადასტურებთ, რომ წაიკითხეთ და ეთანხმებით ჩვენს "აკრძალულ საქმიანობას" და არ გამოაქვეყნებთ უკანონო, შეურაცხმყოფელ, მუქარის შემცველ, ცრუ ან შეცდომაში შემყვან მასალას.',
      'მოქმედი კანონმდებლობით დაშვებულ ფარგლებში, უარს ამბობთ მორალურ უფლებებზე ასეთ მასალებთან დაკავშირებით.',
      'იძლევით გარანტიას, რომ მასალა არის თქვენი ან გაქვთ შესაბამისი უფლებები/ლიცენზიები.',
      'ადასტურებთ, რომ წარდგენილი მასალები არ წარმოადგენს კონფიდენციალურ ინფორმაციას.',
      'ხართ ერთპიროვნულად პასუხისმგებელი თქვენს მასალებზე და გეკისრებათ ჩვენთვის ზიანის ანაზღაურება დარღვევის შემთხვევაში.',
    ],
  },
  {
    heading: '3. მომხმარებლის განცხადებები (გარანტიები)',
    body: [
      'სერვისების გამოყენებით თქვენ აცხადებთ და იძლევით გარანტიას, რომ: (1) გაქვთ ქმედუნარიანობა და ეთანხმებით ამ იურიდიული პირობების დაცვას; (2) არ ხართ არასრულწლოვანი შესაბამის იურისდიქციაში; (3) არ შეხვალთ სერვისებზე ავტომატიზებული ან არაადამიანური საშუალებებით; (4) არ გამოიყენებთ სერვისებს უკანონო ან არაავტორიზებული მიზნისთვის; და (5) თქვენი გამოყენება არ დაარღვევს მოქმედ კანონმდებლობას.',
    ],
  },
  {
    heading: '4. აკრძალული საქმიანობა',
    body: [
      'თქვენ არ შეგიძლიათ სერვისების გამოყენება სხვა მიზნით, გარდა იმისა, რისთვისაც სერვისები არის განკუთვნილი. როგორც მომხმარებელი, თანხმდებით, რომ არ:',
    ],
    bullets: [
      'ამოიღებთ სისტემატურად მონაცემებს სერვისებიდან წერილობითი ნებართვის გარეშე.',
      'მოგვატყუებთ ან შეცდომაში შეიყვანთ ჩვენ/სხვა მომხმარებლებს (მათ შორის პაროლების მოპოვების მცდელობით).',
      'ჩაერევით უსაფრთხოების ფუნქციებში ან შეზღუდვების გვერდის ავლით.',
      'გამოიყენებთ სერვისებს შეურაცხყოფის, შევიწროების, ზიანის მიყენების მიზნით.',
      'გავრცელებთ ვირუსებს, ტროას ცხენებს, სპამს ან სხვა მავნე მასალას.',
      'გამოიყენებთ სკრიპტებს, ბოტებს, რობოტებს, სკრეპერებს ან სხვა ავტომატიზებულ მექანიზმებს.',
      'წაშლით საავტორო უფლებების ან საკუთრების ნიშნულებს კონტენტიდან.',
      'შეეცდებით სხვა მომხმარებლის განსახიერებას.',
      'შექმნით ზედმეტ დატვირთვას სერვისებზე/ქსელებზე ან ჩაერევით ფუნქციონირებაში.',
      'გამოიყენებთ სერვისებს ჩვენთან კონკურენციის ან არაავტორიზებული კომერციული მიზნებისთვის.',
    ],
  },
  {
    heading: '5. მომხმარებლის მიერ შექმნილი კონტენტი/წვლილი',
    body: [
      'ჩვენ შეიძლება მოგცეთ შესაძლებლობა შექმნათ, წარადგინოთ, გამოაქვეყნოთ ან გაავრცელოთ კონტენტი და მასალები (ერთობლივად, "წვლილი"). როდესაც ქმნით ან ხელმისაწვდომს ხდით წვლილს, თქვენ აცხადებთ და იძლევით გარანტიას, რომ იგი შეესაბამება ამ პირობებს.',
    ],
  },
  {
    heading: '6. წვლილის ლიცენზია',
    body: [
      'თქვენ და სერვისები თანხმდებით, რომ ჩვენ შეგვიძლია მივიღოთ წვდომა, შევინახოთ, დავამუშაოთ და გამოვიყენოთ თქვენ მიერ მოწოდებული ინფორმაცია და პერსონალური მონაცემი (პარამეტრების ჩათვლით). უკუკავშირის გაგზავნით თანხმდებით, რომ ის შეიძლება გამოყენებულ იქნას ნებისმიერი მიზნისთვის კომპენსაციის გარეშე.',
      'ჩვენ არ ვაცხადებთ საკუთრების უფლებას თქვენს წვლილზე. თქვენ ინარჩუნებთ სრულ საკუთრების უფლებას თქვენს წვლილსა და მასთან დაკავშირებულ უფლებებზე.',
    ],
  },
  {
    heading: '7. სერვისების მართვა',
    body: [
      'ჩვენ ვიტოვებთ უფლებას (არა ვალდებულებას) ვაკონტროლოთ სერვისები დარღვევებზე, მივიღოთ სამართლებრივი ზომები, შევზღუდოთ წვდომა, წავშალოთ ზედმეტად მძიმე ფაილები და სხვაგვარად ვმართოთ სერვისები ჩვენი უფლებებისა და გამართული მუშაობის დასაცავად.',
    ],
  },
  {
    heading: '8. ვადა და შეწყვეტა',
    body: [
      'ეს იურიდიული პირობები ძალაშია, სანამ თქვენ იყენებთ სერვისებს. ჩვენ ვიტოვებთ უფლებას, ყოველგვარი გაფრთხილების გარეშე, შევზღუდოთ ან შევწყვიტოთ სერვისებზე წვდომა კანონიერი მიზეზით, მათ შორის პირობების ან კანონის დარღვევის შემთხვევაში.',
      'თუ ანგარიში შეგიწყვიტეთ ან შეგიჩერეთ, გეკრძალებათ ახალი ანგარიშის შექმნა თქვენი ან მესამე პირის სახელით. ჩვენ ვიტოვებთ სამართლებრივი დაცვის ზომების გამოყენების უფლებას.',
    ],
  },
  {
    heading: '9. ცვლილებები და შეფერხებები',
    body: [
      'ჩვენ ვიტოვებთ უფლებას შევცვალოთ, მოვხსნათ ან განვაახლოთ სერვისების კონტენტი ნებისმიერ დროს შეტყობინების გარეშე. ჩვენ არ ვიქნებით პასუხისმგებელი თქვენი დანაკარგისთვის სერვისების მოდიფიკაციის, შეჩერების ან შეწყვეტის გამო.',
      'სერვისების მუდმივი ხელმისაწვდომობა ვერ იქნება გარანტირებული. ტექნიკური მომსახურება, შეფერხებები და შეცდომები შესაძლებელია.',
    ],
  },
  {
    heading: '10. მარეგულირებელი კანონმდებლობა',
    body: ['ეს იურიდიული პირობები რეგულირდება და განიმარტება საქართველოს კანონმდებლობის შესაბამისად.'],
  },
  {
    heading: '11. დავების გადაწყვეტა',
    body: [
      'არაფორმალური მოლაპარაკებები: დავის სასამართლოში გადატანამდე მხარეები შეეცდებიან არაფორმალურ შეთანხმებას მინიმუმ 30 დღის განმავლობაში.',
      'სამართალწარმოება: ნებისმიერი დავა საბოლოოდ გადაწყდება საქართველოს შესაბამის სასამართლოებში, საქართველოს საპროცესო კანონმდებლობის შესაბამისად.',
    ],
  },
  {
    heading: '12. შესწორებები',
    body: [
      'სერვისებზე შეიძლება იყოს ტიპოგრაფიული შეცდომები, უზუსტობები ან გამოტოვებები. ჩვენ ვიტოვებთ უფლებას გამოვასწოროთ შეცდომები და განვაახლოთ ინფორმაცია წინასწარი შეტყობინების გარეშე.',
    ],
  },
  {
    heading: '13. პასუხისმგებლობის უარყოფა',
    body: [
      'სერვისები მოწოდებულია "როგორც არის" და "როგორც ხელმისაწვდომია" პრინციპით. თქვენი გამოყენება არის მხოლოდ თქვენი რისკის ქვეშ.',
      'საქართველოს კანონმდებლობით დაშვებულ ფარგლებში, ჩვენ უარს ვამბობთ ყველა გამოხატულ ან ნაგულისხმევ გარანტიაზე.',
      'ჩვენ არ ვიღებთ პასუხისმგებლობას შეცდომებზე, შეფერხებებზე, არაავტორიზებულ წვდომაზე, მესამე მხარის მიერ გადაცემულ ვირუსებზე ან მესამე მხარის სერვისებთან ტრანზაქციებზე.',
    ],
  },
  {
    heading: '14. მომხმარებლის მონაცემები',
    body: [
      'ჩვენ ვინარჩუნებთ გარკვეულ მონაცემებს სერვისების მუშაობის მართვის მიზნით და ასევე თქვენს გამოყენებასთან დაკავშირებულ მონაცემებს. მიუხედავად სარეზერვო ასლების რეგულარული შექმნისა, თქვენ ხართ პასუხისმგებელი თქვენ მიერ გადაცემულ მონაცემებზე და თქვენს აქტივობაზე.',
    ],
  },
  {
    heading: '15. ელექტრონული კომუნიკაციები, ტრანზაქციები და ხელმოწერები',
    body: [
      'სერვისების მონახულება, ელფოსტის გაგზავნა და ფორმების შევსება წარმოადგენს ელექტრონულ კომუნიკაციას. თქვენ ეთანხმებით ელექტრონული კომუნიკაციის მიღებასა და ელექტრონული ხელმოწერების, ჩანაწერებისა და შეტყობინებების გამოყენებას.',
    ],
  },
  {
    heading: '16. სხვადასხვა',
    body: [
      'ეს იურიდიული პირობები და შესაბამისი პოლიტიკები წარმოადგენს თქვენსა და ჩვენს შორის სრულ შეთანხმებას. დებულების აღუსრულებლობა არ წარმოადგენს უფლებაზე უარის თქმას. პირობების ნაწილი თუ ბათილია, დანარჩენი ძალაში რჩება. არ იქმნება პარტნიორობის, დასაქმების ან სააგენტოს ურთიერთობა.',
    ],
  },
  {
    heading: '17. მნიშვნელოვანი გაფრთხილება ანგარიშის წაშლამდე',
    body: ['არაგანზრახი გადასახადების ან სერვისის ფუნქციონალის დაკარგვის თავიდან ასაცილებლად, ანგარიშის წაშლამდე ხელით უნდა გააუქმოთ:'],
    bullets: [
      'კვების გამოწერები (Food Subscriptions) — განმეორებადი შეკვეთები და ავტომატური ბილინგი.',
      'AI კვების ექსპერტზე წვდომა — AI ჩეთის გამოწერა.',
      'Smart GPS სერვისები — აქტიური თვალთვალის/მონაცემთა გეგმები Smart Collar-ზე.',
      'Aylopet არ არის პასუხისმგებელი უწყვეტ გადასახადებზე, თუ მომხმარებელი ინდივიდუალურ სერვისებს პროფილის წაშლამდე არ გააუქმებს.',
    ],
  },
  {
    heading: '18. დაგვიკავშირდით',
    body: ['სერვისებთან დაკავშირებული საჩივრის ან დამატებითი ინფორმაციისთვის დაგვიკავშირდით: support@aylopet.com.'],
  },
];

const enSections: Array<{ heading: string; body: string[]; bullets?: string[] }> = [
  {
    heading: 'AGREEMENT TO OUR LEGAL TERMS',
    body: [
      'We ("Company," "we," "us," "our") operate and provide services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services"). You can contact us by email at support@aylopet.com or by mail to David agmashenebeli avenue 200, Samtredia, Georgia.',
      'These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU SHALL BE PROHIBITED FROM USING THE SERVICES AND YOU SHALL DISCONTINUE USE IMMEDIATELY.',
      'Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason. We will alert you about any changes by sending an official notice to the e-mail you have provided while creating an account. You reserve the right to unilaterally terminate the agreement with us if the changes and/or modification are not acceptable to you.',
    ],
  },
  {
    heading: '1. OUR SERVICES',
    body: [
      'The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country.',
      'Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.',
    ],
  },
  {
    heading: '2. INTELLECTUAL PROPERTY RIGHTS',
    body: [
      'Our intellectual property: We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks"). Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.',
      'Your submissions: By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services ("Submissions"), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you, unless otherwise regulated under the laws of Georgia.',
      'You are responsible for what you post or upload. By sending us Submissions through any part of the Services you:',
    ],
    bullets: [
      'confirm that you have read and agree with our "PROHIBITED ACTIVITIES" and will not post, send, publish, upload, or transmit through the Services any Submission that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;',
      'to the extent permissible by applicable law, waive any and all moral rights to any such Submission;',
      'warrant that any such Submission are original to you or that you have the necessary rights and licenses to submit such Submissions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions; and',
      'warrant and represent that your Submissions do not constitute confidential information.',
      "You are solely responsible for your Submissions and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party's intellectual property rights, or (c) applicable law.",
    ],
  },
  {
    heading: '3. USER REPRESENTATIONS',
    body: [
      'By using the Services, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Legal Terms; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (4) you will not use the Services for any illegal or unauthorized purpose; and (5) your use of the Services will not violate any applicable law or regulation. If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).',
    ],
  },
  {
    heading: '4. PROHIBITED ACTIVITIES',
    body: [
      'You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.',
      'As a user of the Services, you agree not to:',
    ],
    bullets: [
      'Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.',
      'Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.',
      'Circumvent, disable, or otherwise interfere with security-related features of the Services.',
      'Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.',
      'Use any information obtained from the Services in order to harass, abuse, or harm another person.',
      'Make improper use of our support services or submit false reports of abuse or misconduct.',
      'Use the Services in a manner inconsistent with any applicable laws or regulations.',
      'Engage in unauthorized framing of or linking to the Services.',
      'Upload or transmit viruses, Trojan horses, spam, or other harmful material.',
      'Engage in automated use of the system, including scripts, data mining, robots, scrapers, or similar tools.',
      'Delete copyright or other proprietary rights notices from any Content.',
      'Attempt to impersonate another user or person.',
      'Upload any spyware-like collection mechanisms including web bugs, cookies, passive collection mechanisms, or similar devices.',
      'Interfere with, disrupt, or create an undue burden on the Services.',
      'Harass, annoy, intimidate, or threaten any of our employees or agents.',
      'Attempt to bypass measures designed to prevent or restrict access to the Services.',
      "Copy or adapt the Services' software.",
      'Decipher, decompile, disassemble, or reverse engineer software related to the Services except where allowed by law.',
      'Use or distribute any automated system to access the Services beyond normal browser/search engine behavior.',
      'Use a buying or purchasing agent to make purchases on the Services.',
      'Collect usernames or emails for unsolicited outreach or create accounts by automation or false pretenses.',
      'Use the Services to compete with us or for unauthorized commercial exploitation.',
    ],
  },
  {
    heading: '5. USER GENERATED CONTRIBUTIONS',
    body: [
      'We may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through third-party websites. When you create or make available any Contributions, you represent and warrant that your Contributions comply with these terms.',
    ],
  },
  {
    heading: '6. CONTRIBUTION LICENSE',
    body: [
      'You and Services agree that we may access, store, process, and use any information and personal data that you provide and your choices (including settings). By submitting suggestions or other feedback regarding the Services, you agree that we can use and share such feedback for any purpose without compensation to you.',
      'We do not assert ownership over your Contributions. You retain full ownership of your Contributions and associated rights. You are solely responsible for your Contributions and agree to exonerate us from responsibility and legal claims related to them.',
    ],
  },
  {
    heading: '7. SERVICES MANAGEMENT',
    body: [
      'We reserve the right, but not the obligation, to monitor the Services for violations of these Legal Terms; take legal action where appropriate; refuse, restrict, or disable access to Contributions; remove files that burden our systems; and manage the Services to protect our rights, property, and proper operation.',
    ],
  },
  {
    heading: '8. TERM AND TERMINATION',
    body: [
      'These Legal Terms remain in effect while you use the Services. We reserve the right, in our sole discretion and without notice or liability, to deny access and use of the Services to any person for any legal reason, including breach of these Legal Terms or applicable law. We may terminate your use or participation and delete content or information you posted at any time, without warning.',
      'If we terminate or suspend your account, you may not register or create a new account under your name, a fake or borrowed name, or a third party name. We reserve the right to pursue civil, criminal, and injunctive remedies.',
    ],
  },
  {
    heading: '9. MODIFICATIONS AND INTERRUPTIONS',
    body: [
      'We reserve the right to change, modify, or remove contents of the Services at any time without notice. We are not liable for modification, price change, suspension, or discontinuance of the Services.',
      'We cannot guarantee continuous availability. Hardware/software issues and maintenance may cause interruptions, delays, or errors. Nothing in these Legal Terms obligates us to maintain/support the Services or provide corrections and updates.',
    ],
  },
  {
    heading: '10. GOVERNING LAW',
    body: ['These Legal Terms are governed by and defined according to the laws of Georgia.'],
  },
  {
    heading: '11. DISPUTE RESOLUTION',
    body: [
      'Informal negotiations: Parties agree to attempt informal negotiation of any Dispute for at least 30 days before court proceedings.',
      'Proceedings: Any dispute related to these Legal Terms shall be finally resolved by the respective courts of Georgia in accordance with Georgian procedural law.',
    ],
  },
  {
    heading: '12. CORRECTIONS',
    body: [
      'There may be typographical errors, inaccuracies, or omissions on the Services. We reserve the right to correct them and update information at any time without prior notice.',
    ],
  },
  {
    heading: '13. DISCLAIMER',
    body: [
      'THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOUR USE OF THE SERVICES IS AT YOUR SOLE RISK.',
      'TO THE FULLEST EXTENT PERMITTED BY GEORGIAN LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
      "WE DO NOT GUARANTEE THE ACCURACY OR COMPLETENESS OF CONTENT, ASSUME NO LIABILITY FOR ERRORS, INTERRUPTION, UNAUTHORIZED ACCESS, TRANSMITTED VIRUSES, OR DAMAGES ARISING FROM USE OF THE SERVICES OR THIRD-PARTY LINKS/PROVIDERS.",
    ],
  },
  {
    heading: '14. USER DATA',
    body: [
      'We maintain certain data to manage Service performance and usage. While we perform routine backups, you are solely responsible for data you transmit and activity you perform via the Services.',
    ],
  },
  {
    heading: '15. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES',
    body: [
      'Visiting the Services, sending emails, and completing forms constitute electronic communications. You consent to receive electronic communications and agree that electronic agreements, notices, disclosures, and records satisfy legal writing requirements. You agree to electronic signatures and records for transactions initiated or completed by us or via the Services.',
    ],
  },
  {
    heading: '16. MISCELLANEOUS',
    body: [
      'These Legal Terms and related policies constitute the entire agreement. Our failure to enforce a provision is not a waiver. We may assign rights and obligations. If any provision is unlawful, void, or unenforceable, it is severable and remaining provisions remain valid. No joint venture, partnership, employment, or agency relationship is created.',
    ],
  },
  {
    heading: '17. IMPORTANT WARNING BEFORE ACCOUNT DELETION',
    body: ['To avoid unintended charges or service loss, users must manually cancel the following before account deletion:'],
    bullets: [
      'Food Subscriptions: Cancel recurring food orders to stop future automated billing.',
      'AI Nutrition Expert Access: Terminate your AI chat subscription; access is revoked immediately upon deletion.',
      'Smart GPS Services: Disable active tracking/data plans associated with Smart Collar.',
      'Aylopet is not responsible for continued billing if the user fails to cancel individual services before deleting a profile.',
    ],
  },
  {
    heading: '18. CONTACT US',
    body: [
      'To resolve a complaint regarding the Services or receive further information, contact us at support@aylopet.com.',
    ],
  },
];

export default function TermsPage() {
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
  const tr = t[lang];
  const activeSections = lang === 'EN' ? enSections : geSections;

  const toggleLang = () => {
    const next = lang === 'GE' ? 'EN' : 'GE';
    localStorage.setItem(LANG_KEY, next);
    setLang(next);
    window.dispatchEvent(new CustomEvent('aylopet-lang-change'));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#D4E4D4] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-6">
        <Link href="/" className="flex items-center gap-2 no-underline text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2d5a27] text-white font-bold text-sm">A</div>
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
      <main className="mx-auto max-w-2xl px-4 py-16 sm:py-20">
        <h1 className="mb-4 font-serif text-2xl font-bold text-[#2d5a27]">{tr.title}</h1>
        <div className="space-y-8">
          {lang === 'EN' && <h2 className="text-xl font-semibold text-slate-900">{tr.englishTitle}</h2>}
          {activeSections.map((section) => (
            <section key={section.heading} className="space-y-3 border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#2d5a27]">{section.heading}</h3>
              {section.body.map((paragraph, idx) => (
                <p key={`${section.heading}-p-${idx}`} className="text-sm leading-7 text-slate-700">
                  {renderWithSupportEmail(paragraph)}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                  {section.bullets.map((bullet, idx) => (
                    <li key={`${section.heading}-b-${idx}`}>{renderWithSupportEmail(bullet)}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
