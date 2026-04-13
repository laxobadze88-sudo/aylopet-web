export interface Disease {
  id: string;
  nameKa: string;
  nameEn: string;
}

export const diseases: Disease[] = [
  { id: 'anxiety', nameKa: 'შფოთვა', nameEn: 'Anxiety' },
  { id: 'bad-breath', nameKa: 'სუნი პირიდან', nameEn: 'Bad Breath' },
  { id: 'cancer', nameKa: 'სიმსივნე', nameEn: 'Cancer' },
  { id: 'chews-paws', nameKa: 'თათების ღეჭვა', nameEn: 'Chews Paws' },
  { id: 'constipation', nameKa: 'შეკრულობა', nameEn: 'Constipation' },
  { id: 'diarrhea', nameKa: 'დიარეა', nameEn: 'Diarrhea' },
  { id: 'ear-infections', nameKa: 'ყურის ინფექციები', nameEn: 'Ear Infections' },
  { id: 'environmental-allergies', nameKa: 'გარემო ალერგიები', nameEn: 'Environmental Allergies' },
  { id: 'food-allergies', nameKa: 'კვებითი ალერგია', nameEn: 'Food Allergies' },
  { id: 'gluten-sensitive', nameKa: 'გლუტენზე მგრძნობელობა', nameEn: 'Gluten Sensitive' },
  { id: 'grain-sensitive', nameKa: 'მარცვლეულზე მგრძნობელობა', nameEn: 'Grain Sensitive' },
  { id: 'pancreatitis-history', nameKa: 'პანკრეატიტის ისტორია', nameEn: 'History of Pancreatitis' },
  { id: 'hyperactive', nameKa: 'ჰიპერაქტიურობა', nameEn: 'Hyperactive' },
  { id: 'hyperlipidemia', nameKa: 'ჰიპერლიპიდემია', nameEn: 'Hyperlipidemia' },
  { id: 'itchiness', nameKa: 'ქავილი', nameEn: 'Itchiness' },
  { id: 'joints', nameKa: 'სახსრების პრობლემები', nameEn: 'Joints' },
  { id: 'lethargy', nameKa: 'ლეთარგია / უენერგიობა', nameEn: 'Lethargy' },
  { id: 'passes-gas', nameKa: 'მეტეორიზმი (აირები)', nameEn: 'Passes Gas' },
  { id: 'seizures', nameKa: 'კრუნჩხვები', nameEn: 'Seizures' },
  { id: 'skin-and-coat', nameKa: 'კანისა და ბეწვის პრობლემები', nameEn: 'Skin and Coat' },
  { id: 'tear-stains', nameKa: 'ცრემლის ლაქები', nameEn: 'Tear Stains' },
  { id: 'urinary-stones-oxalate', nameKa: 'შარდკენჭოვანი დაავადება (ოქსალატები)', nameEn: 'Urinary Stones: Oxalate' },
  { id: 'urinary-stones-struvite', nameKa: 'შარდკენჭოვანი დაავადება (სტრუვიტები)', nameEn: 'Urinary Stones: Struvite' },
  { id: 'urinary-tract', nameKa: 'შარდსადენი გზების ინფექცია', nameEn: 'Urinary Tract' },
  { id: 'vomiting', nameKa: 'ღებინება', nameEn: 'Vomiting' }
];
