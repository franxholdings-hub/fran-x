import heroImg from "@/assets/photos/hero.webp.asset.json";
import technologyImg from "@/assets/photos/technology.webp.asset.json";
import mobileImg from "@/assets/photos/mobile.webp.asset.json";
import aiImg from "@/assets/photos/ai.webp.asset.json";
import consultingImg from "@/assets/photos/consulting.webp.asset.json";
import dataImg from "@/assets/photos/data.webp.asset.json";
import marketingImg from "@/assets/photos/marketing.webp.asset.json";
import ecommerceImg from "@/assets/photos/ecommerce.webp.asset.json";
import realEstateImg from "@/assets/photos/realEstate.webp.asset.json";
import automotiveImg from "@/assets/photos/automotive.webp.asset.json";
import energyImg from "@/assets/photos/energy.webp.asset.json";
import opportunitiesImg from "@/assets/photos/opportunities.webp.asset.json";
import capitalImg from "@/assets/photos/capital.webp.asset.json";
import hospitalityImg from "@/assets/photos/hospitality.webp.asset.json";
import aviationImg from "@/assets/photos/aviation.webp.asset.json";
import agricultureImg from "@/assets/photos/agriculture.webp.asset.json";
import securityImg from "@/assets/photos/security.webp.asset.json";
import retailImg from "@/assets/photos/retail.webp.asset.json";

export type Photo = { src: string; alt: string; credit: string; source: string };

/**
 * Real photography used across the site. Every image is a licensed
 * Creative Commons / public-domain photograph (no AI generation),
 * optimised to WebP and served from the CDN.
 */
export const PHOTOS = {
  hero: {
    src: heroImg.url,
    alt: "Illuminated business district skyline at night with high-rise towers and waterfront",
    credit: "<div class='fn'> Dubai Marina At Night</div> \u2014 Chris S\u00e9tian (CC BY 3.0)",
    source: "https://commons.wikimedia.org/w/index.php?curid=71320680",
  },
  technology: {
    src: technologyImg.url,
    alt: "Software developer reviewing code on a laptop in a modern office",
    credit: "\u041f\u0456\u0434\u0442\u0440\u0438\u043c\u043a\u0430 \u043f\u0440\u043e\u0444\u0435\u0441\u0456\u0439\u043d\u043e\u0457 \u0442\u0435\u0445\u043d\u0456\u0447\u043d\u043e\u0457 \u043e\u0441\u0432\u0456\u0442\u0438 \u2014 EU-Ukraine cooperation (CC BY-SA 2.0)",
    source: "https://www.flickr.com/photos/149400054@N04/54241737441",
  },
  mobile: {
    src: mobileImg.url,
    alt: "Person holding a smartphone using a mobile application",
    credit: "Uber app \u2014 freestocks.org (CC0 1.0)",
    source: "https://www.flickr.com/photos/135396164@N05/23707913564",
  },
  ai: {
    src: aiImg.url,
    alt: "Rows of enterprise servers inside a data centre",
    credit: "HP Integrity rx4640 Series \u2014 Cdr. Trevor D. Biscope, CA Emerit (CC BY-SA 4.0)",
    source: "https://commons.wikimedia.org/w/index.php?curid=109677883",
  },
  consulting: {
    src: consultingImg.url,
    alt: "Business professionals in a strategy meeting beside a glass-walled office",
    credit: "Millennials Jam Workshop: Youth and ICTs beyond 2015 \u2014 ITU Pictures (CC BY 2.0)",
    source: "https://www.flickr.com/photos/42121221@N07/9025680314",
  },
  data: {
    src: dataImg.url,
    alt: "Analytics dashboard with charts displayed on a desktop screen",
    credit: "Seo Serpstat \u2014 Serpstat (CC0 1.0)",
    source: "https://stocksnap.io/photo/seo-serpstat-HQV6HVSTAW",
  },
  marketing: {
    src: marketingImg.url,
    alt: "Marketing team reviewing printed performance charts around a desk",
    credit: "Group of diverse people having a business meeting \u2014 Rawpixel Ltd (CC BY 2.0)",
    source: "https://www.flickr.com/photos/147875007@N03/45739291052",
  },
  ecommerce: {
    src: ecommerceImg.url,
    alt: "Forklift moving pallets of packaged goods inside a distribution warehouse",
    credit: "20110826-FS-LSC-0222 \u2014 USDAgov (CC BY 2.0)",
    source: "https://www.flickr.com/photos/41284017@N08/6098237534",
  },
  realEstate: {
    src: realEstateImg.url,
    alt: "Modern multi-storey residential apartment building exterior",
    credit: "Building Balconies \u2014 The Building Envelope (CC0 1.0)",
    source: "https://stocksnap.io/photo/building-balconies-H8SXFODO3W",
  },
  automotive: {
    src: automotiveImg.url,
    alt: "Row of new cars inside a vehicle showroom",
    credit: "BMW 530d Touring M Sport \u2014 nakhon100 (CC BY 2.0)",
    source: "https://www.flickr.com/photos/8058098@N07/5252503356",
  },
  energy: {
    src: energyImg.url,
    alt: "Offshore oil and gas production platform at sea",
    credit: "Global Santa Fe Rig 140 \u2014 ST33VO (CC BY 2.0)",
    source: "https://www.flickr.com/photos/94299816@N00/5848576484",
  },
  opportunities: {
    src: opportunitiesImg.url,
    alt: "Business leaders in discussion around a conference table",
    credit: "Lt. Governor Host MBE_Small Business Stakeholders Roundtable Discussion \u2014 MDGovpics (CC BY 2.0)",
    source: "https://www.flickr.com/photos/64018555@N03/13603167853",
  },
  capital: {
    src: capitalImg.url,
    alt: "Financial district skyline of high-rise office towers",
    credit: "East Midtown skyline, NYC (9636312625) (2) \u2014 Dimitry B. from London (CC BY 2.0)",
    source: "https://commons.wikimedia.org/w/index.php?curid=43207939",
  },
  hospitality: {
    src: hospitalityImg.url,
    alt: "Grand hotel lobby with marble floors and warm lighting",
    credit: "Lobby, Royal Hawaiian Hotel, Kalakaua Avenue, Waikiki, Honolulu, HI - 52273169908 \u2014 w_lemay (CC BY-SA 2.0)",
    source: "https://commons.wikimedia.org/w/index.php?curid=129550456",
  },
  aviation: {
    src: aviationImg.url,
    alt: "Private business jet parked on an airport apron",
    credit: "Private Jet for charter over the 2010 FIFA World Cup \u2014 Shine 2010 - 2010 World Cup good news (CC BY 2.0)",
    source: "https://www.flickr.com/photos/28125001@N04/4325471130",
  },
  agriculture: {
    src: agricultureImg.url,
    alt: "Farmers working with a tractor on cultivated farmland",
    credit: "Ploughing ahead in business \u2014 DFID - UK Department for International Development (CC BY 2.0)",
    source: "https://www.flickr.com/photos/14214150@N02/10692696565",
  },
  security: {
    src: securityImg.url,
    alt: "Secure server aisle in a monitored data facility",
    credit: "Microsoft Bing Maps' datacenter \u2014 Robert Scoble (CC BY 2.0)",
    source: "https://www.flickr.com/photos/35034363287@N01/4870003098",
  },
  retail: {
    src: retailImg.url,
    alt: "Premium skincare product bottle styled with fresh white flowers",
    credit: "None \u2014 Unknown (CC0 1.0)",
    source: "https://www.rawpixel.com/image/5944151/free-public-domain-cc0-photo",
  },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;

export const PHOTO_CREDITS = Object.values(PHOTOS).map((p) => ({
  credit: p.credit,
  source: p.source,
}));
