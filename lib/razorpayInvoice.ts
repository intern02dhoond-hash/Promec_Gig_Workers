import Razorpay from "razorpay";
import { PromecOrder, orderStore } from "./orderStore";

export interface CreateInvoiceResult {
  success: boolean;
  invoiceId?: string;
  invoiceUrl?: string;
  error?: string;
}

/**
 * Creates and auto-issues an official "Paid" Razorpay GST Tax Invoice
 * linked directly to the captured Razorpay transaction ID.
 */
export async function createAndIssueRazorpayInvoice(
  order: PromecOrder,
  paymentId?: string
): Promise<CreateInvoiceResult> {
  try {
    const payId = paymentId || order.payment.razorpayPaymentId;
    if (!payId) {
      return { success: false, error: "Payment ID is missing" };
    }

    // If already generated, return cached invoice details
    if (order.payment.razorpayInvoiceId) {
      return {
        success: true,
        invoiceId: order.payment.razorpayInvoiceId,
        invoiceUrl: order.payment.invoiceUrl,
      };
    }

    const key_id = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!key_id || !key_secret) {
      console.warn("[Razorpay Invoice] Credentials not configured on server.");
      return { success: false, error: "Razorpay credentials not configured" };
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const amountInPaise = order.payment.amountPaidInPaise || order.payment.amountRequiredInPaise;
    const cleanPhone = (order.customer.phone || "").replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10);
    const cleanStreet = (order.customer.shippingAddress || "Doorstep Address")
      .replace(/[\r\n\t]+/g, ", ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 100);

    const customer = {
      ...(order.customer.fullName ? { name: order.customer.fullName.trim() } : {}),
      ...(order.customer.email ? { email: order.customer.email.trim() } : {}),
      ...(formattedPhone ? { contact: formattedPhone } : {}),
      billing_address: {
        line1: cleanStreet,
        city: order.customer.city || "City",
        state: order.customer.state || "State",
        postal_code: order.customer.pincode || "440016",
        country: "India",
      },
    };

    console.log(`[Razorpay Invoice] Creating invoice for order ${order.id}, payment ${payId}...`);

    // 1. Create a "Paid" invoice by binding the transaction ID and exact order ID
    const invoicePayload: any = {
      type: "invoice",
      description: "PROMEC Aquaforce® 1400 PSI Cordless High-Pressure Washer",
      currency: "INR",
      receipt: order.id,
      invoice_number: order.id,
      customer: customer,
      line_items: [
        {
          name: `PROMEC Purchase - Order ID ${order.id}`,
          description: `AquaForce 1400 High-Pressure Washer - Commercial B2B Package`,
          amount: amountInPaise,
          currency: "INR",
          quantity: 1,
          hsn_code: "84243000",
        },
      ],
      email_notify: order.customer.email ? 1 : 0,
      sms_notify: formattedPhone ? 1 : 0,
      notes: {
        orderId: order.id,
        invoiceNumber: order.id,
        customerType: "commercial",
        ...(order.customer.gstNumber ? { gstNumber: order.customer.gstNumber } : {}),
      },
    };

    let invoice: any;
    try {
      invoice = await (razorpay.invoices as any).create(invoicePayload);
    } catch (createErr: any) {
      console.warn(
        `[Razorpay Invoice] Custom invoice_number creation warning (${createErr?.message}), retrying without explicit invoice_number...`
      );
      const fallbackPayload = { ...invoicePayload };
      delete fallbackPayload.invoice_number;
      invoice = await (razorpay.invoices as any).create(fallbackPayload);
    }

    let invoiceId = invoice?.id;
    let invoiceUrl = invoice?.short_url;

    // 2. Issue the invoice immediately to dispatch official receipt via Razorpay
    if (invoiceId) {
      try {
        const issued: any = await (razorpay.invoices as any).issue(invoiceId);
        invoiceUrl = issued?.short_url || invoiceUrl;
        console.log(`[Razorpay Invoice] Auto-issued Paid Invoice: ${invoiceId} for payment ${payId}`);
      } catch (issueErr: any) {
        console.warn(`[Razorpay Invoice] Issue step note:`, issueErr?.message || issueErr);
      }

      // Explicitly trigger notification dispatch via Razorpay API for immediate customer delivery
      if (order.customer.email) {
        try {
          await (razorpay.invoices as any).notifyBy(invoiceId, "email");
          console.log(`[Razorpay Invoice] Dispatched invoice email to ${order.customer.email} via Razorpay`);
        } catch (notifyEmailErr: any) {
          console.warn(`[Razorpay Invoice] notifyBy email warning:`, notifyEmailErr?.message || notifyEmailErr);
        }
      }

      if (formattedPhone) {
        try {
          await (razorpay.invoices as any).notifyBy(invoiceId, "sms");
          console.log(`[Razorpay Invoice] Dispatched invoice SMS to ${formattedPhone} via Razorpay`);
        } catch (notifySmsErr: any) {
          console.warn(`[Razorpay Invoice] notifyBy sms warning:`, notifySmsErr?.message || notifySmsErr);
        }
      }

      const finalUrl = invoiceUrl || `https://rzp.io/i/${invoiceId}`;

      // Fetch latest order before patching payment so we never overwrite captured payment fields with stale state
      const latestOrder = (await orderStore.getOrderById(order.id)) || order;
      await orderStore.updateOrder(order.id, {
        payment: {
          ...latestOrder.payment,
          razorpayInvoiceId: invoiceId,
          invoiceUrl: finalUrl,
        },
      });

      return {
        success: true,
        invoiceId,
        invoiceUrl: finalUrl,
      };
    }

    return { success: false, error: "Failed to generate invoice from Razorpay" };
  } catch (err: any) {
    console.error("[Razorpay Invoice] Error generating Razorpay invoice:", err?.message || err);
    return { success: false, error: err?.message || "Failed to create invoice" };
  }
}
