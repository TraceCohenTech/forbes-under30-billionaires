export type Billionaire = {
  rank: number;
  name: string;
  company: string;
  age: number;
  netWorthB: number;
  wealthType: "Inherited" | "Self-made";
  country: string;
  sector: string;
};

export const under30Billionaires2026: Billionaire[] = [
  { rank: 1, name: "Clemente Del Vecchio", company: "EssilorLuxottica", age: 21, netWorthB: 6.8, wealthType: "Inherited", country: "Italy", sector: "Eyewear / Consumer" },
  { rank: 2, name: "Luca Del Vecchio", company: "EssilorLuxottica", age: 24, netWorthB: 6.8, wealthType: "Inherited", country: "Italy", sector: "Eyewear / Consumer" },
  { rank: 3, name: "Johannes von Baumbach", company: "Boehringer Ingelheim", age: 20, netWorthB: 6.6, wealthType: "Inherited", country: "Germany", sector: "Pharmaceuticals" },
  { rank: 4, name: "Franz von Baumbach", company: "Boehringer Ingelheim", age: 24, netWorthB: 6.6, wealthType: "Inherited", country: "Germany", sector: "Pharmaceuticals" },
  { rank: 5, name: "Katharina von Baumbach", company: "Boehringer Ingelheim", age: 26, netWorthB: 6.6, wealthType: "Inherited", country: "Germany", sector: "Pharmaceuticals" },
  { rank: 6, name: "Maximilian von Baumbach", company: "Boehringer Ingelheim", age: 28, netWorthB: 6.6, wealthType: "Inherited", country: "Germany", sector: "Pharmaceuticals" },
  { rank: 7, name: "Kevin David Lehmann", company: "dm-drogerie markt", age: 23, netWorthB: 4.9, wealthType: "Inherited", country: "Germany", sector: "Retail / Pharmacy" },
  { rank: 8, name: "Alexandr Wang", company: "Scale AI", age: 29, netWorthB: 3.2, wealthType: "Self-made", country: "United States", sector: "AI / Data" },
  { rank: 9, name: "Zahan Mistry", company: "Tata Sons", age: 27, netWorthB: 3.1, wealthType: "Inherited", country: "Ireland", sector: "Conglomerate" },
  { rank: 10, name: "Firoz Mistry", company: "Tata Sons", age: 29, netWorthB: 3.1, wealthType: "Inherited", country: "Ireland", sector: "Conglomerate" },
  { rank: 11, name: "Alexandra Andresen", company: "Ferd", age: 29, netWorthB: 2.5, wealthType: "Inherited", country: "Norway", sector: "Investment / Holding Company" },
  { rank: 12, name: "Remi Dassault", company: "Dassault Aviation", age: 24, netWorthB: 2.4, wealthType: "Inherited", country: "France", sector: "Aerospace / Defense" },
  { rank: 13, name: "Adarsh Hiremath", company: "Mercor", age: 22, netWorthB: 2.2, wealthType: "Self-made", country: "United States", sector: "AI / Labor Marketplace" },
  { rank: 14, name: "Brendan Foody", company: "Mercor", age: 22, netWorthB: 2.2, wealthType: "Self-made", country: "United States", sector: "AI / Labor Marketplace" },
  { rank: 15, name: "Surya Midha", company: "Mercor", age: 22, netWorthB: 2.2, wealthType: "Self-made", country: "United States", sector: "AI / Labor Marketplace" },
  { rank: 16, name: "Abbas Sajwani", company: "AHS Properties", age: 26, netWorthB: 1.9, wealthType: "Inherited", country: "UAE", sector: "Real Estate" },
  { rank: 17, name: "Kim Jung-youn", company: "Nexon", age: 22, netWorthB: 1.7, wealthType: "Inherited", country: "South Korea", sector: "Gaming" },
  { rank: 18, name: "Kim Jung-min", company: "Nexon", age: 24, netWorthB: 1.7, wealthType: "Inherited", country: "South Korea", sector: "Gaming" },
  { rank: 19, name: "Fabian Hedin", company: "Lovable", age: 26, netWorthB: 1.6, wealthType: "Self-made", country: "Sweden", sector: "AI / Software" },
  { rank: 20, name: "Lívia Voigt de Assis", company: "WEG", age: 21, netWorthB: 1.4, wealthType: "Inherited", country: "Brazil", sector: "Industrial / Electric Motors" },
  { rank: 21, name: "Dora Voigt de Assis", company: "WEG", age: 28, netWorthB: 1.4, wealthType: "Inherited", country: "Brazil", sector: "Industrial / Electric Motors" },
  { rank: 22, name: "Yoni Nahmad", company: "Art dealing", age: 25, netWorthB: 1.3, wealthType: "Inherited", country: "Italy", sector: "Art / Collectibles" },
  { rank: 23, name: "Aman Sanger", company: "Cursor", age: 25, netWorthB: 1.3, wealthType: "Self-made", country: "United States", sector: "AI / Developer Tools" },
  { rank: 24, name: "Michael Truell", company: "Cursor", age: 25, netWorthB: 1.3, wealthType: "Self-made", country: "United States", sector: "AI / Developer Tools" },
  { rank: 25, name: "Sualeh Asif", company: "Cursor", age: 26, netWorthB: 1.3, wealthType: "Self-made", country: "Pakistan", sector: "AI / Developer Tools" },
  { rank: 26, name: "Arvid Lunnemark", company: "Cursor", age: 26, netWorthB: 1.3, wealthType: "Self-made", country: "Sweden", sector: "AI / Developer Tools" },
  { rank: 27, name: "Luana Lopes Lara", company: "Kalshi", age: 29, netWorthB: 1.3, wealthType: "Self-made", country: "Brazil", sector: "Fintech / Prediction Markets" },
  { rank: 28, name: "Tarek Mansour", company: "Kalshi", age: 29, netWorthB: 1.3, wealthType: "Self-made", country: "United States", sector: "Fintech / Prediction Markets" },
  { rank: 29, name: "Maxim Tebar", company: "Stihl", age: 25, netWorthB: 1.2, wealthType: "Inherited", country: "Germany", sector: "Industrial / Tools" },
  { rank: 30, name: "Wang Zelong", company: "Tinergy Chemical", age: 29, netWorthB: 1.2, wealthType: "Inherited", country: "China", sector: "Chemicals" },
  { rank: 31, name: "Amelie Voigt Trejes", company: "WEG", age: 20, netWorthB: 1.1, wealthType: "Inherited", country: "Brazil", sector: "Industrial / Electric Motors" },
  { rank: 32, name: "Felipe Voigt Trejes", company: "WEG", age: 23, netWorthB: 1.1, wealthType: "Inherited", country: "Brazil", sector: "Industrial / Electric Motors" },
  { rank: 33, name: "Pedro Voigt Trejes", company: "WEG", age: 23, netWorthB: 1.1, wealthType: "Inherited", country: "Brazil", sector: "Industrial / Electric Motors" },
  { rank: 34, name: "Carl Anton-Kunz", company: "Cordes & Graefe", age: 27, netWorthB: 1.1, wealthType: "Inherited", country: "Germany", sector: "Wholesale / Industrial Distribution" },
  { rank: 35, name: "Shayne Coplan", company: "Polymarket", age: 27, netWorthB: 1.0, wealthType: "Self-made", country: "United States", sector: "Prediction Markets / Crypto" },
];
