import { NextResponse } from "next/server";
// @ts-ignore
import icons from "payments-icons-library";
import {
  fetchLiveRazorpayOffers,
  PromecOfferMeta,
  RealPaymentOfferMeta,
  BANK_NAMES_MAP,
  BANK_LOGOS_MAP,
} from "@/lib/razorpayOffers";

// Bank code to Payments Icons Library alias mapping
const BANK_ALIASES: Record<string, string> = {
  UTIB: "axis",
  HDFC: "hdfc",
  HDFC_DC: "hdfc",
  ICIC: "icici",
  ICIC_DC: "icici",
  SBIN: "sbi",
  SBIN_DC: "sbi",
  KKBK: "kotak",
  BARB: "bob",
  BARB_R: "bob",
  AMEX: "amex",
  YESB: "yes",
  IDFB: "idfc",
  INDB: "indusind",
  RATN: "rbl",
  FDRL: "federal",
  HSBC: "hsbc",
  SCBL: "scb",
  AUBL: "au",
  onecard: "onecard",
  AIRP: "airtel",
  CBIN: "cbi",
  CNRB: "canara",
  UBIN: "union",
  PUNB_R: "pnb",
  IBKL: "idbi",
  MAHB: "bom",
  IOBA: "iob",
  BKID: "boi",
  BKID_C: "boi",
  CSBK: "csb",
  DCBL: "dcb",
  DEUT: "deutsche",
  DLXB: "dhanlaxmi",
  ESFB: "equitas",
  FSFB: "fincare",
  IDIB: "indian",
  JAKA: "jk",
  JSFB: "jana",
  KARB: "karnataka",
  KVBL: "kvb",
  LAVB_R: "lvb",
  NSPB: "nsdl",
  ORBC: "obc",
  PSIB: "psb",
  SIBL: "sib",
  SRCB: "saraswat",
  SVCB: "svc",
  TMBL: "tmb",
  UCBA: "uco",
  UJVN: "ujjivan",
  UTBI: "ubi",
  VIJB: "vijaya",
  DBSS: "dbs",
  BAJAJ: "bajaj",
};

export interface EmiPlan {
  months: number;
  interestRate: number;
  monthlyAmount: number;
  totalPayable: number;
  isNoCost: boolean;
  offerId?: string;
  discountAmount?: number;
}

export interface EmiBankItem {
  id: string;
  code: string;
  name: string;
  logo: string;
  type: "credit" | "debit" | "both" | "cardless";
  isNoCost: boolean;
  hasOffer: boolean;
  offerText: string;
  offerId?: string;
  minAmount: number;
  startingEmi: number;
  plans: EmiPlan[];
  cashbackAmount?: number;
  cashbackText?: string;
  cashbackOfferId?: string;
  interestSavedAmount?: number;
  totalSavingsAmount?: number;
  badgeText?: string;
}

export interface RazorpayOfferDisplayItem {
  id: string;
  name: string;
  displayName: string;
  bankCode: string;
  bankName: string;
  bankLogo: string;
  cardType: "credit" | "debit" | "cardless";
  tenures: number[];
  minAmount: number;
  maxAmount: number;
  monthlyAmountForCurrentPrice: number;
  interestRate: number;
  status: string;
  description: string;
  tnc: string;
  benefits: string[];
  cashbackAmount?: number;
  cashbackText?: string;
  cashbackOfferId?: string;
  interestSavedAmount?: number;
  totalSavingsAmount?: number;
  badgeText?: string;
  highlightText?: string;
}

export interface NetbankingBankItem {
  code: string;
  name: string;
  shortName: string;
  logo: string;
  isPopular: boolean;
}

interface MasterEmiConfig {
  id: string;
  code: string;
  name: string;
  type: "credit" | "debit" | "both" | "cardless";
  isNoCost: boolean;
  hasOffer: boolean;
  offerText: string;
  minAmount: number;
  logo: string;
}

const MASTER_EMI_BANKS: MasterEmiConfig[] = [
  {
    id: "axis",
    code: "UTIB",
    name: "AXIS Bank",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "5% Cashback (Up to ₹750)",
    minAmount: 4000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png",
  },
  {
    id: "icic",
    code: "ICIC",
    name: "ICICI Bank",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "1% Cashback",
    minAmount: 4000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/icici.png",
  },
  {
    id: "amex",
    code: "AMEX",
    name: "American Express",
    type: "credit",
    isNoCost: false,
    hasOffer: false,
    offerText: "",
    minAmount: 5000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/card/64/amex.png",
  },
  {
    id: "yesb",
    code: "YESB",
    name: "Yes Bank",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "5% Cashback (Up to ₹1,500)",
    minAmount: 4000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/yes.png",
  },
  {
    id: "hsbc",
    code: "HSBC",
    name: "HSBC",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "5% Cashback (Up to ₹1,000)",
    minAmount: 4000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hsb.png",
  },
  {
    id: "scbl",
    code: "SCBL",
    name: "Standard Chartered Bank",
    type: "credit",
    isNoCost: true,
    hasOffer: false,
    offerText: "",
    minAmount: 4000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/scb.png",
  },
  {
    id: "indb",
    code: "INDB",
    name: "IndusInd Bank",
    type: "credit",
    isNoCost: true,
    hasOffer: false,
    offerText: "",
    minAmount: 4000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/indusind.png",
  },
  {
    id: "barb",
    code: "BARB",
    name: "Bank of Baroda",
    type: "credit",
    isNoCost: true,
    hasOffer: false,
    offerText: "",
    minAmount: 4000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/bobc.png",
  },
  {
    id: "fdrl",
    code: "FDRL",
    name: "Federal Bank",
    type: "credit",
    isNoCost: true,
    hasOffer: false,
    offerText: "",
    minAmount: 4000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/federal.png",
  },
  {
    id: "onecard",
    code: "onecard",
    name: "One Card",
    type: "credit",
    isNoCost: false,
    hasOffer: false,
    offerText: "",
    minAmount: 2500,
    logo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><circle cx='32' cy='32' r='30' fill='black'/><text x='32' y='42' font-size='30' font-weight='900' font-family='Arial,sans-serif' fill='white' text-anchor='middle'>1</text></svg>",
  },
  {
    id: "aubl",
    code: "AUBL",
    name: "AU Small Finance Bank",
    type: "credit",
    isNoCost: true,
    hasOffer: false,
    offerText: "",
    minAmount: 3000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/aus.png",
  },
  {
    id: "idfb",
    code: "IDFB",
    name: "IDFC FIRST Bank",
    type: "credit",
    isNoCost: true,
    hasOffer: true,
    offerText: "3.5% Cashback (Up to ₹3,000)",
    minAmount: 4000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/idfc.png",
  },
  {
    id: "kkbk",
    code: "KKBK",
    name: "Kotak Mahindra Bank",
    type: "credit",
    isNoCost: true,
    hasOffer: false,
    offerText: "",
    minAmount: 4000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/paylater/64/kotak.png",
  },
  {
    id: "ratn",
    code: "RATN",
    name: "RBL Bank",
    type: "credit",
    isNoCost: false,
    hasOffer: false,
    offerText: "",
    minAmount: 2000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/rbl.png",
  },
  {
    id: "sbin",
    code: "SBIN",
    name: "State Bank of India",
    type: "credit",
    isNoCost: false,
    hasOffer: true,
    offerText: "5% Reward Points",
    minAmount: 2500,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/sbi.png",
  },
  {
    id: "hdfc_dc",
    code: "HDFC_DC",
    name: "HDFC Bank Debit Card",
    type: "debit",
    isNoCost: true,
    hasOffer: false,
    offerText: "",
    minAmount: 6000,
    logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png",
  },
];

function getBankLogoUrl(code: string): string {
  if (BANK_LOGOS_MAP[code]) return BANK_LOGOS_MAP[code];
  const alias = BANK_ALIASES[code] || code.toLowerCase();
  try {
    const iconObj = icons && typeof icons.getIcon === "function" ? icons.getIcon(alias, "md") : null;
    if (iconObj && iconObj.icon_url && !iconObj.icon_url.includes("default.svg")) {
      return iconObj.icon_url;
    }
  } catch (e) {}

  if (code.toLowerCase() === "onecard") {
    return "https://getonecard.app/images/onecard-logo.svg";
  }

  return `https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/${alias}.png`;
}

function calculateEmi(principal: number, annualRatePercent: number, months: number): number {
  if (annualRatePercent === 0 || !annualRatePercent) {
    return Math.round(principal / months);
  }
  const monthlyRate = annualRatePercent / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
}

function generateDynamicPlans(
  bankCode: string,
  totalAmount: number,
  matchingOffer?: PromecOfferMeta | null
): EmiPlan[] {
  const isDebit = bankCode.endsWith("_DC");
  const isHdfc = bankCode.startsWith("HDFC");
  const isIndus = bankCode === "INDB";
  const isBajaj = bankCode === "BAJAJ";

  const discount = isHdfc && isDebit ? Math.min(Math.round(totalAmount * 0.1), 2500) : 0;
  const principal = totalAmount - discount;

  const baseTenures = isBajaj
    ? [3, 6]
    : isHdfc && !isDebit
    ? [3, 6, 9, 12, 18, 24, 36, 48]
    : isIndus
    ? [3, 6, 9, 12, 18, 24, 36]
    : isDebit
    ? [3, 6, 9, 12, 18]
    : [3, 6, 9, 12, 18, 24];

  const offerTenures = new Set<number>(matchingOffer?.tenures || []);
  const allTenures = Array.from(new Set([...Array.from(offerTenures), ...baseTenures])).sort((a, b) => a - b);

  const isOfferEligibleForCart = Boolean(
    matchingOffer &&
    (!matchingOffer.minAmount || totalAmount >= matchingOffer.minAmount) &&
    (!matchingOffer.maxAmount || totalAmount <= matchingOffer.maxAmount)
  );

  return allTenures.map((months) => {
    const isPlanNoCost = Boolean(
      isOfferEligibleForCart &&
      offerTenures.has(months)
    );

    if (isPlanNoCost) {
      const rate = 0;
      const monthlyAmount = Math.round(principal / months);
      const totalPayable = principal;
      return {
        months,
        interestRate: rate,
        monthlyAmount,
        totalPayable,
        isNoCost: true,
        offerId: matchingOffer?.id,
        discountAmount: Math.round(principal * 0.15 * (months / 12)),
      };
    } else {
      const rate = bankCode === "UTIB" ? 17 : bankCode === "onecard" ? 16 : bankCode === "KKBK" ? 16 : 15;
      const monthlyAmount = calculateEmi(principal, rate, months);
      const totalPayable = monthlyAmount * months;
      return {
        months,
        interestRate: rate,
        monthlyAmount,
        totalPayable,
        isNoCost: false,
      };
    }
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const priceParam = searchParams.get("price");
    const totalPrice = priceParam ? Math.max(1, parseInt(priceParam, 10)) : 44991;

    const key_id = (
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ""
    ).trim();

    // 1. Fetch live methods & live offers concurrently
    const [methodsRes, offersData] = await Promise.all([
      key_id
        ? fetch(`https://api.razorpay.com/v1/methods?key_id=${key_id}`, {
            next: { revalidate: 300 },
          })
            .then((r) => (r.ok ? r.json() : {}))
            .catch(() => ({}))
        : Promise.resolve({}),
      fetchLiveRazorpayOffers(),
    ]);

    const rawMethods: any = methodsRes || {};
    const { noCostOffers, cashbackOffers } = offersData;

    // 2. Process Netbanking Banks
    const POPULAR_CANDIDATES = [
      "HDFC", "ICIC", "SBIN", "UTIB", "KKBK", 
      "BARB_R", "BARB", "INDB", "IDFB", "YESB", 
      "CNRB", "PUNB_R", "UBIN", "BKID", "RATN", "AUBL"
    ];
    
    const rawNb = rawMethods.netbanking || {};
    const availablePopularCodes = POPULAR_CANDIDATES.filter(code => rawNb[code]).slice(0, 6);

    let netbankingList: NetbankingBankItem[] = Object.entries(rawNb).map(
      ([code, name]) => {
        let shortName = String(name)
          .replace(" - Retail Banking", "")
          .replace(" - Corporate Banking", "")
          .replace(/ \(Erstwhile.*?\)/, "")
          .trim();

        if (code === "UTIB") shortName = "Axis Bank";
        if (code === "SBIN") shortName = "SBI";
        if (code === "ICIC") shortName = "ICICI Bank";
        if (code === "KKBK") shortName = "Kotak Bank";
        if (code === "BARB_R" || code === "BARB") shortName = "Bank of Baroda";
        if (code === "INDB") shortName = "IndusInd Bank";
        if (code === "IDFB") shortName = "IDFC FIRST Bank";
        if (code === "YESB") shortName = "Yes Bank";
        if (code === "CNRB") shortName = "Canara Bank";
        if (code === "PUNB_R") shortName = "PNB";
        if (code === "UBIN") shortName = "Union Bank";
        if (code === "BKID" || code === "BKID_C") shortName = "Bank of India";
        if (code === "RATN") shortName = "RBL Bank";
        if (code === "AUBL") shortName = "AU Bank";

        return {
          code,
          name: String(name),
          shortName,
          logo: getBankLogoUrl(code),
          isPopular: availablePopularCodes.includes(code),
        };
      }
    );

    if (netbankingList.length === 0) {
      netbankingList = [
        { code: "SBIN", name: "State Bank of India", shortName: "SBI", logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/sbi.png", isPopular: true },
        { code: "HDFC", name: "HDFC Bank", shortName: "HDFC Bank", logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/hdfc.png", isPopular: true },
        { code: "ICIC", name: "ICICI Bank", shortName: "ICICI Bank", logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/icici.png", isPopular: true },
        { code: "UTIB", name: "Axis Bank", shortName: "Axis Bank", logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/axis.png", isPopular: true },
        { code: "KKBK", name: "Kotak Mahindra Bank", shortName: "Kotak Bank", logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/kotak.png", isPopular: true },
        { code: "PUNB_R", name: "Punjab National Bank", shortName: "PNB", logo: "https://cashfreelogo.cashfree.com/assets_images/pg/nb/64/pnb.png", isPopular: true },
      ];
    } else {
      netbankingList.sort((a, b) => {
        if (a.isPopular && b.isPopular) {
          return availablePopularCodes.indexOf(a.code) - availablePopularCodes.indexOf(b.code);
        }
        if (a.isPopular) return -1;
        if (b.isPopular) return 1;
        return a.shortName.localeCompare(b.shortName);
      });
    }

    // 3. Process Live Offers:
    // Create offer display items for both verified active Cashback offers AND No Cost EMI offers
    const cashbackDisplayOffers: RazorpayOfferDisplayItem[] = cashbackOffers.map((meta) => {
      const isEligible = totalPrice >= meta.minOrderRupees;
      const rawCashback = Math.round((totalPrice * meta.cashbackPercent) / 100);
      const effectiveCashback = isEligible ? Math.min(rawCashback, meta.maxBenefitRupees) : 0;
      const monthlyAmountForCurrentPrice = Math.round(totalPrice / 6);

      return {
        id: meta.id,
        name: meta.title,
        displayName: meta.title,
        bankCode: meta.bankCode,
        bankName: meta.bankName,
        bankLogo: meta.logo || getBankLogoUrl(meta.bankCode),
        cardType: "credit",
        tenures: [3, 6, 9, 12, 18, 24],
        minAmount: meta.minOrderRupees,
        maxAmount: 1000000,
        monthlyAmountForCurrentPrice,
        interestRate: 15,
        status: "ACTIVE",
        description: meta.description,
        tnc: meta.tnc,
        benefits: ["CASHBACK"],
        cashbackAmount: effectiveCashback,
        cashbackText: `${meta.cashbackPercent}% Cashback (Up to ₹${meta.maxBenefitRupees.toLocaleString("en-IN")})`,
        cashbackOfferId: meta.id,
        interestSavedAmount: 0,
        totalSavingsAmount: effectiveCashback,
        badgeText: `${meta.cashbackPercent}% CASHBACK`,
        highlightText: `${meta.cashbackPercent}% Cashback up to ₹${meta.maxBenefitRupees.toLocaleString("en-IN")}`,
      };
    });

    const noCostDisplayOffers: RazorpayOfferDisplayItem[] = noCostOffers.map((nco) => {
      const maxTenure = nco.tenures[nco.tenures.length - 1] || 6;
      const monthlyAmountForCurrentPrice = Math.round(totalPrice / maxTenure);
      const interestSavedAmount = Math.round(totalPrice * 0.15 * (maxTenure / 12));

      return {
        id: nco.id,
        name: nco.name,
        displayName: `0% Interest No Cost EMI - ${nco.bankName}`,
        bankCode: nco.bankCode,
        bankName: nco.bankName,
        bankLogo: getBankLogoUrl(nco.bankCode),
        cardType: nco.cardType,
        tenures: nco.tenures,
        minAmount: nco.minAmount,
        maxAmount: nco.maxAmount,
        monthlyAmountForCurrentPrice,
        interestRate: 0,
        status: "ACTIVE",
        description: nco.description || `Buy AquaForce on 0% Interest No Cost EMI on ${nco.bankName}.`,
        tnc: nco.tnc,
        benefits: ["NO_COST_EMI"],
        cashbackAmount: 0,
        cashbackText: `No Cost EMI (${nco.tenures.join(", ")}M)`,
        interestSavedAmount,
        totalSavingsAmount: interestSavedAmount,
        badgeText: "NO COST EMI",
        highlightText: `0% Interest No Cost EMI (${nco.tenures.join(", ")} Months)`,
      };
    });

    const displayOffers: RazorpayOfferDisplayItem[] = [
      ...cashbackDisplayOffers,
      ...noCostDisplayOffers,
    ];

    // 4. Process Live EMI Banks
    const emiPlans = rawMethods.emi_plans || {};
    const hasLiveEmiData = Object.keys(emiPlans).length > 0;

    // Start with master list, and ensure ANY bank with an active live offer is included
    const bankMap = new Map<string, MasterEmiConfig>();
    MASTER_EMI_BANKS.forEach((b) => bankMap.set(b.code, { ...b }));

    // Inject any new banks from live No Cost offers
    noCostOffers.forEach((nco) => {
      const existing = bankMap.get(nco.bankCode);
      if (existing) {
        existing.isNoCost = true;
        existing.minAmount = nco.minAmount;
      } else {
        bankMap.set(nco.bankCode, {
          id: nco.bankCode.toLowerCase(),
          code: nco.bankCode,
          name: nco.bankName,
          type: nco.cardType,
          isNoCost: true,
          hasOffer: false,
          offerText: "0% Interest No Cost EMI",
          minAmount: nco.minAmount,
          logo: getBankLogoUrl(nco.bankCode),
        });
      }
    });

    const combinedBankConfigs = Array.from(bankMap.values());

    // Eligible banks: check emi_plans, but always retain banks that have active No Cost EMI offers in Razorpay
    const noCostBankCodes = new Set(noCostOffers.map((o) => o.bankCode));
    const eligibleBanks = hasLiveEmiData
      ? combinedBankConfigs.filter((cfg) => Boolean(emiPlans[cfg.code]) || noCostBankCodes.has(cfg.code))
      : combinedBankConfigs;

    const emiBanks: EmiBankItem[] = eligibleBanks.map((cfg) => {
      const livePlanObj = emiPlans[cfg.code];

      // Match live cashback offer
      const matchingCashbackOffer = cashbackOffers.find((doff) => {
        if (cfg.type === "debit") {
          return cfg.code === doff.bankCode || cfg.code.startsWith(doff.bankCode);
        }
        return cfg.code === doff.bankCode || doff.bankCode === cfg.code;
      });

      // Match live No Cost EMI offer
      const matchingNoCostMeta = noCostOffers.find((m) => {
        if (cfg.code === m.bankCode) return true;
        if (cfg.type === "debit" && m.cardType === "debit") {
          return m.bankCode === "HDFC_DC" || cfg.code.includes("HDFC");
        }
        if (cfg.type === "credit" && m.cardType === "credit") {
          return m.bankCode === cfg.code || m.bankName.toLowerCase().includes(cfg.name.toLowerCase());
        }
        return false;
      });

      const offerTenures = new Set<number>(matchingNoCostMeta?.tenures || []);
      const isOfferEligibleForCart = Boolean(
        matchingNoCostMeta &&
        (!matchingNoCostMeta.minAmount || totalPrice >= matchingNoCostMeta.minAmount) &&
        (!matchingNoCostMeta.maxAmount || totalPrice <= matchingNoCostMeta.maxAmount)
      );

      let plans: EmiPlan[] = [];

      if (livePlanObj && livePlanObj.plans && Object.keys(livePlanObj.plans).length > 0) {
        // Collect all durations from livePlanObj AND offerTenures
        const allMonths = Array.from(new Set([
          ...Object.keys(livePlanObj.plans).map(d => parseInt(d, 10)),
          ...Array.from(offerTenures),
        ])).sort((a, b) => a - b);

        plans = allMonths.map((months) => {
          const rawRate = livePlanObj.plans[String(months)];
          const liveRate = typeof rawRate === "number" ? rawRate : parseFloat(rawRate) || 15;
          const isPlanNoCost = Boolean(
            isOfferEligibleForCart &&
            offerTenures.has(months)
          );

          if (isPlanNoCost) {
            const monthlyAmount = Math.round(totalPrice / months);
            return {
              months,
              interestRate: 0,
              monthlyAmount,
              totalPayable: totalPrice,
              isNoCost: true,
              offerId: matchingNoCostMeta?.id,
              discountAmount: Math.round(totalPrice * (liveRate / 100) * (months / 12)),
            };
          } else {
            const interestRate = liveRate;
            const monthlyAmount = calculateEmi(totalPrice, interestRate, months);
            return {
              months,
              interestRate,
              monthlyAmount,
              totalPayable: monthlyAmount * months,
              isNoCost: false,
            };
          }
        });
      } else {
        plans = generateDynamicPlans(cfg.code, totalPrice, matchingNoCostMeta);
      }

      const hasNoCostPlan = plans.some((p) => p.isNoCost);
      const isNoCost = Boolean(isOfferEligibleForCart && hasNoCostPlan) || Boolean(matchingNoCostMeta);

      // Starting monthly EMI: lowest monthly amount among plans (e.g. 12 months or 6 months)
      const plan12 = plans.find((p) => p.months === 12);
      const plan6 = plans.find((p) => p.months === 6);
      const startingEmi = plan12
        ? plan12.monthlyAmount
        : (plan6 ? plan6.monthlyAmount : plans[0]?.monthlyAmount || Math.round(totalPrice / 12));

      // Calculate cashback benefit
      let cashbackAmount = 0;
      let cashbackText = "";
      if (matchingCashbackOffer && totalPrice >= matchingCashbackOffer.minOrderRupees) {
        const rawCb = Math.round((totalPrice * matchingCashbackOffer.cashbackPercent) / 100);
        cashbackAmount = Math.min(rawCb, matchingCashbackOffer.maxBenefitRupees);
        cashbackText = `${matchingCashbackOffer.cashbackPercent}% Cashback (Up to ₹${matchingCashbackOffer.maxBenefitRupees.toLocaleString("en-IN")})`;
      }

      const hasOffer = Boolean(cashbackAmount > 0 || isNoCost);
      const offerText = cashbackText || (isNoCost ? "0% Interest No Cost EMI" : "");
      const badgeText = isNoCost && cashbackAmount > 0
        ? "NO COST EMI + CASHBACK"
        : isNoCost
        ? "NO COST EMI"
        : cashbackAmount > 0
        ? `${matchingCashbackOffer?.cashbackPercent}% CASHBACK`
        : undefined;

      return {
        id: cfg.id,
        code: cfg.code,
        name: cfg.name,
        logo: cfg.logo,
        type: cfg.type,
        isNoCost,
        hasOffer,
        offerText,
        offerId: matchingNoCostMeta?.id || matchingCashbackOffer?.id,
        minAmount: matchingNoCostMeta?.minAmount || cfg.minAmount,
        startingEmi,
        plans,
        cashbackAmount: cashbackAmount > 0 ? cashbackAmount : undefined,
        cashbackText: cashbackText || undefined,
        cashbackOfferId: matchingCashbackOffer?.id,
        interestSavedAmount: isNoCost ? Math.round(totalPrice * 0.15 * (6 / 12)) : 0,
        totalSavingsAmount: cashbackAmount + (isNoCost ? Math.round(totalPrice * 0.15 * (6 / 12)) : 0),
        badgeText,
      };
    });

    return NextResponse.json({
      success: true,
      totalPrice,
      netbanking: netbankingList,
      emi: emiBanks,
      offers: displayOffers,
      offersCount: displayOffers.length,
    });
  } catch (err: any) {
    console.error("[Razorpay Methods API] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch Razorpay methods" },
      { status: 500 }
    );
  }
}
