/**
 * Promec India PayLater - Dynamic Razorpay Offers Engine
 * 
 * Fetches all active No Cost EMI offers and Cashback offers dynamically
 * directly from the Razorpay API (GET /v1/offers) so that any offer created
 * in the Razorpay Dashboard is immediately visible and applied on the website.
 */

export interface PromecOfferMeta {
  id: string;
  name: string;
  displayName: string;
  bankCode: string;
  bankName: string;
  cardType: "credit" | "debit";
  tenures: number[];
  minAmount: number;
  maxAmount: number;
  description: string;
  tnc: string;
  benefitType: "NO_COST_EMI";
}

export interface RealPaymentOfferMeta {
  id: string;
  bankCode: string;
  bankName: string;
  title: string;
  subtitle: string;
  cashbackPercent: number;
  maxBenefitRupees: number;
  minOrderRupees: number;
  logo: string;
  description: string;
  tnc: string;
}

export interface RealCardOfferBenefit {
  cashbackAmount: number;
  cashbackText: string;
  cashbackOfferId?: string;
  interestSavedAmount: number;
  totalSavingsAmount: number;
  badgeText: string;
  highlightText: string;
  isNoCost: boolean;
}

export const BANK_NAMES_MAP: Record<string, string> = {
  UTIB: "AXIS Bank",
  HDFC: "HDFC Bank",
  HDFC_DC: "HDFC Bank Debit Card",
  ICIC: "ICICI Bank",
  ICIC_DC: "ICICI Bank Debit Card",
  SBIN: "State Bank of India",
  SBIN_DC: "State Bank of India Debit Card",
  KKBK: "Kotak Mahindra Bank",
  BARB: "Bank of Baroda",
  BARB_R: "Bank of Baroda",
  AMEX: "American Express",
  YESB: "Yes Bank",
  IDFB: "IDFC FIRST Bank",
  INDB: "IndusInd Bank",
  RATN: "RBL Bank",
  FDRL: "Federal Bank",
  HSBC: "HSBC",
  SCBL: "Standard Chartered Bank",
  AUBL: "AU Small Finance Bank",
  onecard: "One Card",
  BAJAJ: "Bajaj Finserv",
};

export const BANK_LOGOS_MAP: Record<string, string> = {
  UTIB: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png",
  HDFC: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png",
  HDFC_DC: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png",
  ICIC: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/icici.png",
  ICIC_DC: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/icici.png",
  SBIN: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/sbi.png",
  KKBK: "https://cashfreelogo.cashfree.com/assets_images/pg/paylater/64/kotak.png",
  BARB: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/bobc.png",
  AMEX: "https://cashfreelogo.cashfree.com/assets_images/pg/card/64/amex.png",
  YESB: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yes.png",
  IDFB: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/idfc.png",
  INDB: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/indusind.png",
  RATN: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/rbl.png",
  FDRL: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/federal.png",
  HSBC: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hsb.png",
  SCBL: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/scb.png",
  AUBL: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/aus.png",
};

/**
 * Verified Live Snapshot fallback (fetched directly from live Razorpay account)
 * Used as safe immediate fallback if network call to Razorpay is ever delayed.
 */
export const DEFAULT_NO_COST_OFFERS_SNAPSHOT: PromecOfferMeta[] = [
  {
    id: "offer_TrKPkDTGQi70St",
    name: "Yes Bank",
    displayName: "Yes Bank",
    bankCode: "YESB",
    bankName: "Yes Bank",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 4000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrKOSCeMPUMCl0",
    name: "Axis Bank",
    displayName: "Axis Bank",
    bankCode: "UTIB",
    bankName: "AXIS Bank",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 4000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrKN1ZsSGcrJtN",
    name: "Standard Chartered Bank",
    displayName: "Standard Chartered Bank",
    bankCode: "SCBL",
    bankName: "Standard Chartered Bank",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 4000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrKLd4IAqPXLk7",
    name: "Kotak Mahindra Bank",
    displayName: "Kotak Mahindra Bank",
    bankCode: "KKBK",
    bankName: "Kotak Mahindra Bank",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 4000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrKKFnfJ2Cqq7Y",
    name: "INDUSIND Bank",
    displayName: "INDUSIND Bank",
    bankCode: "INDB",
    bankName: "IndusInd Bank",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 4000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrKIkRRRYiH5pc",
    name: "IDFB",
    displayName: "IDFB",
    bankCode: "IDFB",
    bankName: "IDFC FIRST Bank",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 4000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrKDEka4eRe2Xx",
    name: "ICICI",
    displayName: "ICICI",
    bankCode: "ICIC",
    bankName: "ICICI Bank",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 4000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrKBPvFZZn3ABg",
    name: "HSBC",
    displayName: "HSBC",
    bankCode: "HSBC",
    bankName: "HSBC",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 4000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrK7uq6dBAclzQ",
    name: "HDFC Bank Debit Card",
    displayName: "HDFC Bank Debit Card",
    bankCode: "HDFC_DC",
    bankName: "HDFC Bank Debit Card",
    cardType: "debit",
    tenures: [3, 6, 9, 12],
    minAmount: 6000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI on HDFC Debit Card. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrK07DafTn3T00",
    name: "FDRL",
    displayName: "FDRL",
    bankCode: "FDRL",
    bankName: "Federal Bank",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 4000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrIHolSP6RZe8D",
    name: "Bank of Baroda",
    displayName: "Bank of Baroda",
    bankCode: "BARB",
    bankName: "Bank of Baroda",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 4000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
  {
    id: "offer_TrF1VsESJ1z4kb",
    name: "AU Small Finance Bank",
    displayName: "AU Small Finance Bank",
    bankCode: "AUBL",
    bankName: "AU Small Finance Bank",
    cardType: "credit",
    tenures: [3, 6, 9, 12],
    minAmount: 3000,
    maxAmount: 500000,
    description: "Buy AquaForce on No Cost EMI. 0% Interest subsidized by Promec India.",
    tnc: "The offer is applicable to AquaForce products purchased through our website.",
    benefitType: "NO_COST_EMI",
  },
];

export const DEFAULT_CASHBACK_OFFERS_SNAPSHOT: RealPaymentOfferMeta[] = [
  {
    id: "offer_TiYBMRbEeMiCk4",
    bankCode: "YESB",
    bankName: "Yes Bank",
    title: "5% Cashback on Yes Bank Credit Card EMI Transactions",
    subtitle: "5% Cashback up to Rs 1500 on Yes Bank Credit Card EMI Transactions",
    cashbackPercent: 5.0,
    maxBenefitRupees: 1500,
    minOrderRupees: 5000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yes.png",
    description: "5% Cashback up to ₹1,500 on Min Cart Value of ₹5,000 on Yes Bank Credit Card EMI Transactions.",
    tnc: "5% Cashback with YES BANK Credit Card EMI Transactions. Minimum Transaction Amount: Rs. 5,000. Maximum Cashback: Rs. 1,500. Velocity: Once per card per merchant per month. Cashback will be posted by YES BANK 90 days after offer month.",
  },
  {
    id: "offer_TiYhWuqMTvDC3g",
    bankCode: "HSBC",
    bankName: "HSBC",
    title: "5% Cashback on Min Cart Value of Rs 5000 on HSBC Credit Card EMI Transactions",
    subtitle: "5% Cashback up to Rs 1000 on HSBC Credit Card EMI Transactions",
    cashbackPercent: 5.0,
    maxBenefitRupees: 1000,
    minOrderRupees: 5000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hsb.png",
    description: "5% Cashback up to ₹1,000 on Min Cart Value of ₹5,000 on HSBC Credit Card EMI Transactions.",
    tnc: "5% Cashback on HSBC Credit Card EMI Transactions. Minimum Transaction Amount: Rs. 5,000. Maximum Cashback: Rs. 1,000.",
  },
  {
    id: "offer_TiYk8pkfvaoOuD",
    bankCode: "UTIB",
    bankName: "AXIS Bank",
    title: "5% Cashback on Min Cart Value of Rs 5,000 on AXIS Bank Credit Card EMI Transactions",
    subtitle: "5% Cashback up to Rs 750 on AXIS Bank Credit Card EMI Transactions",
    cashbackPercent: 5.0,
    maxBenefitRupees: 750,
    minOrderRupees: 5000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png",
    description: "5% Cashback up to ₹750 on Min Cart Value of ₹5,000 on AXIS Bank Credit Card EMI Transactions.",
    tnc: "5% Cashback with Axis Bank Credit Card EMI Transactions. Minimum Transaction Amount: Rs. 5,000. Maximum Cashback: Rs. 750.",
  },
  {
    id: "offer_TieLmu4h87lIRz",
    bankCode: "IDFB",
    bankName: "IDFC FIRST Bank",
    title: "3.5% Cashback on Min Cart Value of Rs 5000 using IDFC FIRST Bank Credit Card EMI Transactions",
    subtitle: "3.5% Cashback up to Rs 3000 using IDFC FIRST Bank Credit Card EMI Transactions",
    cashbackPercent: 3.5,
    maxBenefitRupees: 3000,
    minOrderRupees: 5000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/idfc.png",
    description: "3.5% Cashback up to ₹3,000 on Min Cart Value of ₹5,000 using IDFC FIRST Bank Credit Card EMI Transactions.",
    tnc: "3.5% Cashback using IDFC FIRST Bank Credit Card EMI Transactions. Minimum Transaction Amount: Rs. 5,000. Maximum Cashback: Rs. 3,000.",
  },
  {
    id: "offer_TX5wSvxDLRo8sT",
    bankCode: "SBIN",
    bankName: "State Bank of India",
    title: "Save 5%* with PhonePe SBI Select Black Card!",
    subtitle: "Get 5%* Reward Points on online transactions with your PhonePe SBI Select Black Card",
    cashbackPercent: 5.0,
    maxBenefitRupees: 1000,
    minOrderRupees: 100,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/sbi.png",
    description: "Get 5%* Reward Points on online transactions with your PhonePe SBI Select Black Card.",
    tnc: "Get 5%* Reward Points on online transactions with your PhonePe SBI Select Black Card.",
  },
  {
    id: "offer_Rv2PH0sIK8F3wD",
    bankCode: "ICIC",
    bankName: "ICICI Bank",
    title: "Unlimited 1% cashback with Amazon Pay ICICI Bank Credit Card",
    subtitle: "Unlimited 1% cashback on non-Amazon purchases",
    cashbackPercent: 1.0,
    maxBenefitRupees: 100000,
    minOrderRupees: 100,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/icici.png",
    description: "Unlimited 1% cashback with Amazon Pay ICICI Bank Credit Card.",
    tnc: "Unlimited 1% cashback with Amazon Pay ICICI Bank Credit Card on all orders.",
  },
  {
    id: "offer_QPEhahmXZYrNL4",
    bankCode: "HDFC",
    bankName: "Tata NeuCard",
    title: "Upto 1.5% savings with NeuCard on EMI/ non EMI trxns",
    subtitle: "Upto 1.5% savings with NeuCard on EMI/ non EMI trxns",
    cashbackPercent: 1.5,
    maxBenefitRupees: 1000,
    minOrderRupees: 0,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png",
    description: "1.5% back on Tata Neu HDFC Bank Infinity Credit Card & 1% back on Tata Neu HDFC Bank Plus Credit cards as NeuCoins.",
    tnc: "1.5% back on Tata Neu HDFC Bank Infinity Credit Card & 1% back on Tata Neu HDFC Bank Plus Credit cards as NeuCoins on all EMI and non-EMI spends.",
  },
];

// Backwards compatibility exports
export let PROMEC_PAYLATER_OFFERS_METADATA: PromecOfferMeta[] = DEFAULT_NO_COST_OFFERS_SNAPSHOT;
export let REAL_RAZORPAY_CASHBACK_OFFERS: RealPaymentOfferMeta[] = DEFAULT_CASHBACK_OFFERS_SNAPSHOT;
export let DEFAULT_PROMEC_PAYLATER_OFFERS: string[] = [
  ...DEFAULT_NO_COST_OFFERS_SNAPSHOT.map((o) => o.id),
  ...DEFAULT_CASHBACK_OFFERS_SNAPSHOT.map((o) => o.id),
];

/**
 * In-memory cache for live offers to minimize latency
 */
interface ParsedRazorpayOffersData {
  noCostOffers: PromecOfferMeta[];
  cashbackOffers: RealPaymentOfferMeta[];
  allOfferIds: string[];
  rawItems: any[];
}

let cachedData: ParsedRazorpayOffersData | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Parses raw Razorpay GET /v1/offers response into structured offers
 */
export function parseRazorpayOffersResponse(items: any[]): ParsedRazorpayOffersData {
  const activeItems = (items || []).filter((o) => o.status === "ACTIVE");
  const noCostOffers: PromecOfferMeta[] = [];
  const cashbackOffers: RealPaymentOfferMeta[] = [];
  const allOfferIds: string[] = activeItems.map((o) => String(o.id)).filter(Boolean);

  activeItems.forEach((item) => {
    const isNoCost = Array.isArray(item.benefits_types) && item.benefits_types.includes("NO_COST_EMI");
    const isCashback = Array.isArray(item.benefits_types) && item.benefits_types.includes("CASHBACK");
    const rules = item.rules?.items || [];

    const issuers = new Set<string>();
    const cardTypes = new Set<string>();
    const tenures = new Set<number>();
    let minAmount = 0;
    let maxAmount = 99999999;
    let cashbackPercent = 0;
    let maxBenefitRupees = 0;

    rules.forEach((r: any) => {
      const inst = r.criteria?.includes?.paymentInstrument;
      if (inst?.card) {
        (inst.card.issuers || []).forEach((iss: string) => issuers.add(iss));
        (inst.card.types || []).forEach((ct: string) => cardTypes.add(ct.toLowerCase()));
      }
      if (inst?.emi?.durations) {
        inst.emi.durations.forEach((d: any) => tenures.add(Number(d)));
      }
      const ord = r.criteria?.includes?.order;
      if (ord?.min_amount) {
        const val = Number(ord.min_amount) / 100;
        if (minAmount === 0 || val < minAmount) minAmount = val;
      }
      if (ord?.max_amount) {
        const val = Number(ord.max_amount) / 100;
        if (val < maxAmount) maxAmount = val;
      }

      const bItems = r.benefits?.items || [];
      bItems.forEach((b: any) => {
        if (b.type === "no_cost_emi" && b.tenures) {
          b.tenures.forEach((t: any) => tenures.add(Number(t)));
        }
        if (b.type === "cashback") {
          if (b.unit === "PERCENTAGE") cashbackPercent = Number(b.value) / 100;
          if (b.max_benefit_value) maxBenefitRupees = Number(b.max_benefit_value) / 100;
        }
      });
    });

    const issuerList = Array.from(issuers);
    const primaryIssuer = issuerList[0] || "";
    const cardTypeList = Array.from(cardTypes);
    const isDebit = cardTypeList.includes("debit") || item.name?.toLowerCase().includes("debit");
    const bankCode = isDebit && primaryIssuer ? primaryIssuer + "_DC" : primaryIssuer;
    const bankName = BANK_NAMES_MAP[bankCode] || BANK_NAMES_MAP[primaryIssuer] || item.display_name || item.name;

    if (isNoCost) {
      noCostOffers.push({
        id: item.id,
        name: item.name,
        displayName: item.display_name || item.name,
        bankCode: bankCode || primaryIssuer,
        bankName,
        cardType: isDebit ? "debit" : "credit",
        tenures: Array.from(tenures).sort((a, b) => a - b),
        minAmount: minAmount || 4000,
        maxAmount: maxAmount === 99999999 ? 500000 : maxAmount,
        description: item.description || `0% Interest No Cost EMI on ${bankName}. Subsidized by Promec India.`,
        tnc: item.terms?.tnc || "Available on eligible cards and selected tenures only.",
        benefitType: "NO_COST_EMI",
      });
    } else if (isCashback && (primaryIssuer || cashbackPercent > 0 || maxBenefitRupees > 0)) {
      cashbackOffers.push({
        id: item.id,
        bankCode: primaryIssuer,
        bankName,
        title: item.display_name || item.name,
        subtitle: item.description || "",
        cashbackPercent,
        maxBenefitRupees: maxBenefitRupees || 1000,
        minOrderRupees: minAmount,
        logo: BANK_LOGOS_MAP[primaryIssuer] || "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png",
        description: item.description || "",
        tnc: item.terms?.tnc || "",
      });
    }
  });

  // Ensure default fallback snapshots are retained if Razorpay returned partial
  const finalNoCost = noCostOffers.length > 0 ? noCostOffers : DEFAULT_NO_COST_OFFERS_SNAPSHOT;
  const finalCashback = cashbackOffers.length > 0 ? cashbackOffers : DEFAULT_CASHBACK_OFFERS_SNAPSHOT;

  return {
    noCostOffers: finalNoCost,
    cashbackOffers: finalCashback,
    allOfferIds,
    rawItems: items,
  };
}

/**
 * Fetches live offers directly from the merchant's Razorpay account via GET /v1/offers
 */
export async function fetchLiveRazorpayOffers(): Promise<ParsedRazorpayOffersData> {
  const now = Date.now();
  if (cachedData && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedData;
  }

  const key_id = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!key_id || !key_secret) {
    console.warn("[Razorpay Offers] Credentials missing, using snapshot");
    const fallback = {
      noCostOffers: DEFAULT_NO_COST_OFFERS_SNAPSHOT,
      cashbackOffers: DEFAULT_CASHBACK_OFFERS_SNAPSHOT,
      allOfferIds: DEFAULT_PROMEC_PAYLATER_OFFERS,
      rawItems: [],
    };
    cachedData = fallback;
    lastCacheTime = now;
    return fallback;
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${key_id}:${key_secret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/offers?count=100", {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      const parsed = parseRazorpayOffersResponse(data.items || []);
      cachedData = parsed;
      lastCacheTime = now;

      // Update runtime globals for backwards-compatible consumers
      PROMEC_PAYLATER_OFFERS_METADATA = parsed.noCostOffers;
      REAL_RAZORPAY_CASHBACK_OFFERS = parsed.cashbackOffers;
      DEFAULT_PROMEC_PAYLATER_OFFERS = parsed.allOfferIds;

      return parsed;
    } else {
      console.warn(`[Razorpay Offers] Upstream returned status ${res.status}`);
    }
  } catch (err) {
    console.error("[Razorpay Offers] Error fetching live offers:", err);
  }

  // Graceful fallback to snapshot if network fails
  const fallback = {
    noCostOffers: DEFAULT_NO_COST_OFFERS_SNAPSHOT,
    cashbackOffers: DEFAULT_CASHBACK_OFFERS_SNAPSHOT,
    allOfferIds: DEFAULT_NO_COST_OFFERS_SNAPSHOT.map((o) => o.id),
    rawItems: [],
  };
  cachedData = fallback;
  lastCacheTime = now;
  return fallback;
}

/**
 * Returns an array of clean, non-empty live Razorpay offer_id strings
 */
export async function getLiveRazorpayOfferIds(): Promise<string[]> {
  const data = await fetchLiveRazorpayOffers();
  return data.allOfferIds;
}

/**
 * Synchronous/fallback helper for legacy routes
 */
export function getPromecPayLaterOfferIds(): string[] {
  if (cachedData && cachedData.allOfferIds.length > 0) {
    return cachedData.allOfferIds;
  }

  const envOffers =
    process.env.RAZORPAY_OFFER_IDS ||
    process.env.PROMEC_PAYLATER_OFFER_IDS ||
    process.env.NEXT_PUBLIC_RAZORPAY_OFFER_IDS ||
    "";

  const envList = envOffers
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const snapshotIds = [
    ...DEFAULT_NO_COST_OFFERS_SNAPSHOT.map((o) => o.id),
    ...DEFAULT_CASHBACK_OFFERS_SNAPSHOT.map((o) => o.id),
  ];

  return Array.from(new Set([...envList, ...snapshotIds]));
}

/**
 * Checks if No Cost EMI offers are configured for the merchant
 */
export function hasPromecPayLaterOffers(): boolean {
  return getPromecPayLaterOfferIds().length > 0;
}

/**
 * Calculate the exact real cashback & interest saved for a specific bank and cart total
 * using live offers dynamically.
 */
export function calculateRealCardOffer(
  bankCode: string,
  cardType: "credit" | "debit",
  totalPrice: number,
  customNoCostOffers?: PromecOfferMeta[],
  customCashbackOffers?: RealPaymentOfferMeta[]
): RealCardOfferBenefit {
  const noCostList = customNoCostOffers || cachedData?.noCostOffers || DEFAULT_NO_COST_OFFERS_SNAPSHOT;
  const cashbackList = customCashbackOffers || cachedData?.cashbackOffers || DEFAULT_CASHBACK_OFFERS_SNAPSHOT;

  const normalizedCode = bankCode.replace(/_DC$/, "");
  const cb = cashbackList.find(
    (o) => o.bankCode === normalizedCode && cardType === "credit"
  );

  let cashbackAmount = 0;
  let cashbackText = "";
  let cashbackOfferId = cb?.id;

  if (cb && totalPrice >= cb.minOrderRupees) {
    const rawVal = Math.round((totalPrice * cb.cashbackPercent) / 100);
    cashbackAmount = Math.min(rawVal, cb.maxBenefitRupees);
    cashbackText = `${cb.cashbackPercent}% Cashback (Up to ₹${cb.maxBenefitRupees.toLocaleString("en-IN")})`;
  }

  // Real No Cost EMI: Check if merchant has an active No Cost EMI offer in Razorpay for this bank
  const noCostOffer = noCostList.find(
    (o) =>
      o.bankCode === bankCode ||
      (cardType === "debit" && o.cardType === "debit" && (o.bankCode === "HDFC_DC" || bankCode.includes("HDFC"))) ||
      (cardType === "credit" && o.cardType === "credit" && o.bankCode === normalizedCode)
  );

  const isNoCost = Boolean(
    noCostOffer &&
    totalPrice >= (noCostOffer.minAmount || 0) &&
    totalPrice <= (noCostOffer.maxAmount || 999999)
  );

  const interestSavedAmount = isNoCost ? Math.round(totalPrice * 0.15 * (6 / 12)) : 0;
  const totalSavingsAmount = cashbackAmount + interestSavedAmount;

  let badgeText = "";
  let highlightText = "";

  if (isNoCost && cashbackAmount > 0) {
    badgeText = "NO COST EMI";
    highlightText = `0% Interest No Cost EMI + ₹${cashbackAmount.toLocaleString("en-IN")} Cashback`;
  } else if (isNoCost) {
    badgeText = "NO COST EMI";
    highlightText = "0% Interest No Cost EMI";
  } else if (cashbackAmount > 0 && cb) {
    badgeText = `${cb.cashbackPercent}% CASHBACK`;
    highlightText = `${cb.cashbackPercent}% Cashback up to ₹${cb.maxBenefitRupees.toLocaleString("en-IN")}`;
  }

  return {
    cashbackAmount,
    cashbackText,
    cashbackOfferId,
    interestSavedAmount,
    totalSavingsAmount,
    badgeText,
    highlightText,
    isNoCost,
  };
}
