export interface LocalPlatform {
  name: string;
  url: string;
  hasApi: boolean;
  postUrl?: string;
  color: string;
}

export interface CountryPlatforms {
  country: string;
  flag: string;
  currencyCode: string;
  platforms: LocalPlatform[];
}

export const localPlatformsByCountry: CountryPlatforms[] = [
  { country: "Algeria", flag: "🇩🇿", currencyCode: "DZD", platforms: [
    { name: "Ouedkniss", url: "https://www.ouedkniss.com", hasApi: false, postUrl: "https://www.ouedkniss.com/publish", color: "#E53935" },
    { name: "Jumia Algeria", url: "https://www.jumia.dz", hasApi: false, postUrl: "https://www.jumia.dz", color: "#F68B1E" },
  ]},
  { country: "Morocco", flag: "🇲🇦", currencyCode: "MAD", platforms: [
    { name: "Avito.ma", url: "https://www.avito.ma", hasApi: false, postUrl: "https://www.avito.ma/deposer", color: "#2E7D32" },
    { name: "Jumia Morocco", url: "https://www.jumia.ma", hasApi: false, color: "#F68B1E" },
    { name: "Hmizate", url: "https://www.hmizate.ma", hasApi: false, color: "#FF5722" },
  ]},
  { country: "Tunisia", flag: "🇹🇳", currencyCode: "TND", platforms: [
    { name: "Tayara.tn", url: "https://www.tayara.tn", hasApi: false, postUrl: "https://www.tayara.tn/publish", color: "#1565C0" },
    { name: "Jumia Tunisia", url: "https://www.jumia.com.tn", hasApi: false, color: "#F68B1E" },
    { name: "Affare.tn", url: "https://www.affare.tn", hasApi: false, color: "#009688" },
  ]},
  { country: "Egypt", flag: "🇪🇬", currencyCode: "EGP", platforms: [
    { name: "OLX Egypt", url: "https://www.olx.com.eg", hasApi: false, postUrl: "https://www.olx.com.eg/post", color: "#002F34" },
    { name: "Jumia Egypt", url: "https://www.jumia.com.eg", hasApi: false, color: "#F68B1E" },
    { name: "Amazon.eg", url: "https://www.amazon.eg", hasApi: true, color: "#FF9900" },
  ]},
  { country: "Saudi Arabia", flag: "🇸🇦", currencyCode: "SAR", platforms: [
    { name: "Haraj", url: "https://haraj.com.sa", hasApi: false, postUrl: "https://haraj.com.sa/post", color: "#4CAF50" },
    { name: "OpenSooq", url: "https://www.opensooq.com", hasApi: false, color: "#00BCD4" },
    { name: "Noon", url: "https://www.noon.com", hasApi: true, color: "#FEEE00" },
  ]},
  { country: "UAE", flag: "🇦🇪", currencyCode: "AED", platforms: [
    { name: "Dubizzle", url: "https://www.dubizzle.com", hasApi: false, postUrl: "https://www.dubizzle.com/place-ad", color: "#E53935" },
    { name: "Noon", url: "https://www.noon.com", hasApi: true, color: "#FEEE00" },
    { name: "Amazon.ae", url: "https://www.amazon.ae", hasApi: true, color: "#FF9900" },
  ]},
  { country: "France", flag: "🇫🇷", currencyCode: "EUR", platforms: [
    { name: "Leboncoin", url: "https://www.leboncoin.fr", hasApi: false, postUrl: "https://www.leboncoin.fr/deposer-une-annonce", color: "#EC6730" },
    { name: "Vinted", url: "https://www.vinted.fr", hasApi: false, color: "#09B1BA" },
    { name: "Back Market", url: "https://www.backmarket.fr", hasApi: true, color: "#4CDE4C" },
  ]},
  { country: "USA", flag: "🇺🇸", currencyCode: "USD", platforms: [
    { name: "Craigslist", url: "https://www.craigslist.org", hasApi: false, postUrl: "https://post.craigslist.org", color: "#5C0098" },
    { name: "OfferUp", url: "https://offerup.com", hasApi: false, color: "#00D48A" },
    { name: "Mercari", url: "https://www.mercari.com", hasApi: false, color: "#4DC9F6" },
    { name: "Poshmark", url: "https://poshmark.com", hasApi: false, color: "#7B2D8E" },
  ]},
  { country: "UK", flag: "🇬🇧", currencyCode: "GBP", platforms: [
    { name: "Gumtree", url: "https://www.gumtree.com", hasApi: false, postUrl: "https://www.gumtree.com/post", color: "#72EF36" },
    { name: "eBay UK", url: "https://www.ebay.co.uk", hasApi: true, color: "#E53238" },
    { name: "Depop", url: "https://www.depop.com", hasApi: false, color: "#FF2300" },
  ]},
  { country: "Germany", flag: "🇩🇪", currencyCode: "EUR", platforms: [
    { name: "eBay Kleinanzeigen", url: "https://www.kleinanzeigen.de", hasApi: false, postUrl: "https://www.kleinanzeigen.de/p-anzeige-aufgeben.html", color: "#86B817" },
    { name: "Vinted.de", url: "https://www.vinted.de", hasApi: false, color: "#09B1BA" },
  ]},
  { country: "Turkey", flag: "🇹🇷", currencyCode: "TRY", platforms: [
    { name: "Sahibinden", url: "https://www.sahibinden.com", hasApi: false, color: "#FFE800" },
    { name: "Letgo", url: "https://www.letgo.com", hasApi: false, color: "#FF6F61" },
    { name: "Hepsiburada", url: "https://www.hepsiburada.com", hasApi: true, color: "#FF6000" },
  ]},
  { country: "Nigeria", flag: "🇳🇬", currencyCode: "NGN", platforms: [
    { name: "Jiji.ng", url: "https://jiji.ng", hasApi: false, postUrl: "https://jiji.ng/sell", color: "#FFD600" },
    { name: "Jumia Nigeria", url: "https://www.jumia.com.ng", hasApi: false, color: "#F68B1E" },
  ]},
  { country: "Kenya", flag: "🇰🇪", currencyCode: "KES", platforms: [
    { name: "Jiji.ke", url: "https://jiji.co.ke", hasApi: false, color: "#FFD600" },
    { name: "Jumia Kenya", url: "https://www.jumia.co.ke", hasApi: false, color: "#F68B1E" },
  ]},
  { country: "India", flag: "🇮🇳", currencyCode: "INR", platforms: [
    { name: "OLX India", url: "https://www.olx.in", hasApi: false, color: "#002F34" },
    { name: "Flipkart", url: "https://www.flipkart.com", hasApi: true, color: "#2874F0" },
    { name: "Meesho", url: "https://www.meesho.com", hasApi: false, color: "#E91E63" },
  ]},
  { country: "Brazil", flag: "🇧🇷", currencyCode: "BRL", platforms: [
    { name: "Mercado Livre", url: "https://www.mercadolivre.com.br", hasApi: true, color: "#FFE600" },
    { name: "OLX Brazil", url: "https://www.olx.com.br", hasApi: false, color: "#002F34" },
  ]},
  { country: "Pakistan", flag: "🇵🇰", currencyCode: "PKR", platforms: [
    { name: "OLX Pakistan", url: "https://www.olx.com.pk", hasApi: false, color: "#002F34" },
    { name: "Daraz.pk", url: "https://www.daraz.pk", hasApi: true, color: "#F85606" },
  ]},
  { country: "Indonesia", flag: "🇮🇩", currencyCode: "IDR", platforms: [
    { name: "Tokopedia", url: "https://www.tokopedia.com", hasApi: true, color: "#42B549" },
    { name: "Shopee", url: "https://shopee.co.id", hasApi: true, color: "#EE4D2D" },
    { name: "Bukalapak", url: "https://www.bukalapak.com", hasApi: true, color: "#E31E52" },
  ]},
];

export function getLocalPlatformsForCurrency(currencyCode: string): CountryPlatforms | undefined {
  return localPlatformsByCountry.find((c) => c.currencyCode === currencyCode);
}
