import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = 'Builty <noreply@builty.fr>';
const APP_URL = Deno.env.get('APP_URL') ?? 'https://app.builty.fr';

const stripe = new Stripe(stripeSecret, {
  appInfo: { name: 'Bolt Integration', version: '1.0.0' },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// ─── Plan mapping ──────────────────────────────────────────────────────────────

const PRICE_TO_PLAN: Record<string, { name: string; price: string }> = {
  price_1ScTbm9X5XfpDIWavtNRbBKP: { name: 'Builty PRO', price: '169 €/mois' },
  price_1ScTbG9X5XfpDIWaeUCAYwYP: { name: 'Builty REGULAR', price: '89 €/mois' },
};

function getPlanInfo(priceId: string | null | undefined) {
  if (priceId && PRICE_TO_PLAN[priceId]) return PRICE_TO_PLAN[priceId];
  return { name: 'Builty', price: '' };
}

// ─── Email helpers ─────────────────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#0D47A1 0%,#1976D2 100%);padding:40px 48px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Builty</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Gestion de chantiers</p>
    </div>
    <div style="padding:48px;">
      ${content}
    </div>
    <div style="padding:24px 48px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 Builty · Tous droits réservés</p>
      <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">Vous recevez cet email car vous avez un compte Builty.</p>
    </div>
  </div>
</body>
</html>`;
}

function paymentSuccessTemplate(planName: string, planPrice: string, nextBillingDate: string) {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:64px;height:64px;background:#dcfce7;border-radius:50%;line-height:64px;font-size:28px;">✅</div>
    </div>
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;text-align:center;">Paiement confirmé !</h2>
    <p style="margin:0 0 32px;font-size:15px;color:#6b7280;text-align:center;">Votre abonnement est actif. Merci pour votre confiance.</p>

    <div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:32px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#6b7280;">Plan souscrit</td>
          <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;text-align:right;">${planName}</td>
        </tr>
        <tr style="border-top:1px solid #e5e7eb;">
          <td style="padding:8px 0;font-size:14px;color:#6b7280;">Montant</td>
          <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;text-align:right;">${planPrice}</td>
        </tr>
        ${nextBillingDate ? `<tr style="border-top:1px solid #e5e7eb;">
          <td style="padding:8px 0;font-size:14px;color:#6b7280;">Prochain prélèvement</td>
          <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;text-align:right;">${nextBillingDate}</td>
        </tr>` : ''}
      </table>
    </div>

    <div style="text-align:center;">
      <a href="${APP_URL}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#0D47A1,#1976D2);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;">
        Accéder à mon espace →
      </a>
    </div>
  `);
}

function subscriptionCancelledTemplate(planName: string, endDate: string) {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:64px;height:64px;background:#fee2e2;border-radius:50%;line-height:64px;font-size:28px;">😔</div>
    </div>
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;text-align:center;">Abonnement résilié</h2>
    <p style="margin:0 0 32px;font-size:15px;color:#6b7280;text-align:center;">Nous sommes désolés de vous voir partir.</p>

    <div style="background:#fef2f2;border-radius:12px;padding:24px;margin-bottom:32px;border-left:4px solid #ef4444;">
      <p style="margin:0;font-size:14px;color:#374151;">
        Votre abonnement <strong>${planName}</strong> a été résilié.
        ${endDate ? `Vous conservez l'accès à votre espace jusqu'au <strong>${endDate}</strong>.` : 'Votre accès a été désactivé.'}
      </p>
    </div>

    <p style="font-size:14px;color:#6b7280;text-align:center;margin-bottom:24px;">
      Vous pouvez vous réabonner à tout moment pour retrouver toutes vos données.
    </p>

    <div style="text-align:center;">
      <a href="${APP_URL}/subscription" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#0D47A1,#1976D2);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;">
        Se réabonner →
      </a>
    </div>
  `);
}

function paymentFailedTemplate(planName: string, amount: string) {
  return baseTemplate(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:64px;height:64px;background:#fef3c7;border-radius:50%;line-height:64px;font-size:28px;">⚠️</div>
    </div>
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;text-align:center;">Échec du paiement</h2>
    <p style="margin:0 0 32px;font-size:15px;color:#6b7280;text-align:center;">Une action de votre part est nécessaire pour maintenir votre abonnement actif.</p>

    <div style="background:#fffbeb;border-radius:12px;padding:24px;margin-bottom:32px;border-left:4px solid #f59e0b;">
      <p style="margin:0 0 8px;font-size:14px;color:#374151;">
        Le paiement de <strong>${amount}</strong> pour votre abonnement <strong>${planName}</strong> a échoué.
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280;">
        Cela peut être dû à une carte expirée, des fonds insuffisants ou un blocage de votre banque.
      </p>
    </div>

    <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:32px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111827;">Comment résoudre ce problème ?</p>
      ${[
        'Vérifiez que votre carte n\'est pas expirée',
        'Assurez-vous que les fonds sont suffisants',
        'Contactez votre banque si le problème persiste',
        'Mettez à jour votre moyen de paiement ci-dessous',
      ].map((step, i) => `
        <div style="display:flex;align-items:flex-start;margin-bottom:8px;">
          <span style="flex-shrink:0;width:22px;height:22px;background:#1976D2;color:white;border-radius:50%;font-size:12px;font-weight:700;text-align:center;line-height:22px;margin-right:10px;">${i + 1}</span>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:22px;">${step}</p>
        </div>
      `).join('')}
    </div>

    <div style="text-align:center;">
      <a href="${APP_URL}/subscription" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;">
        Mettre à jour mon paiement →
      </a>
    </div>

    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
      Sans mise à jour dans les prochains jours, votre abonnement sera suspendu.
    </p>
  `);
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error('Resend error:', error);
  } else {
    console.info(`Email sent to ${to} – subject: "${subject}"`);
  }
}

async function getCustomerEmail(customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return (customer as Stripe.Customer).email;
  } catch (error) {
    console.error('Failed to retrieve customer email:', error);
    return null;
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) return;

  // ── Invoice payment succeeded → email de confirmation ──────────────────────
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    if (!customerId) return;

    const email = await getCustomerEmail(customerId);
    if (!email) return;

    const priceId = invoice.lines.data[0]?.price?.id;
    const plan = getPlanInfo(priceId);
    const amount = formatAmount(invoice.amount_paid, invoice.currency);
    const nextDate = invoice.lines.data[0]?.period?.end
      ? formatDate(invoice.lines.data[0].period.end)
      : '';

    await sendEmail(
      email,
      `Paiement confirmé – Abonnement ${plan.name} ✅`,
      paymentSuccessTemplate(plan.name, amount, nextDate),
    );

    return;
  }

  // ── Customer subscription deleted → email de résiliation ───────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

    if (!customerId) return;

    const email = await getCustomerEmail(customerId);
    if (!email) return;

    const priceId = subscription.items.data[0]?.price?.id;
    const plan = getPlanInfo(priceId);
    const endDate = subscription.ended_at ? formatDate(subscription.ended_at) : '';

    await sendEmail(
      email,
      `Votre abonnement ${plan.name} a été résilié`,
      subscriptionCancelledTemplate(plan.name, endDate),
    );

    return;
  }

  // ── Invoice payment failed → email de relance ───────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    if (!customerId) return;

    const email = await getCustomerEmail(customerId);
    if (!email) return;

    const priceId = invoice.lines.data[0]?.price?.id;
    const plan = getPlanInfo(priceId);
    const amount = formatAmount(invoice.amount_due, invoice.currency);

    await sendEmail(
      email,
      `⚠️ Échec de paiement – Action requise`,
      paymentFailedTemplate(plan.name, amount),
    );

    return;
  }

  // ── Checkout / subscription sync ─────────────────────────────────────────────
  if (!('customer' in stripeData)) return;

  if (event.type === 'payment_intent.succeeded' && (event.data.object as Stripe.PaymentIntent).invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData as { customer: string };
  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
    return;
  }

  let isSubscription = true;

  if (event.type === 'checkout.session.completed') {
    const { mode } = stripeData as Stripe.Checkout.Session;
    isSubscription = mode === 'subscription';
    console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
  }

  const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

  if (isSubscription) {
    console.info(`Starting subscription sync for customer: ${customerId}`);
    await syncCustomerFromStripe(customerId);
  } else if (mode === 'payment' && payment_status === 'paid') {
    try {
      const {
        id: checkout_session_id,
        payment_intent,
        amount_subtotal,
        amount_total,
        currency,
      } = stripeData as Stripe.Checkout.Session;

      const { error: orderError } = await supabase.from('stripe_orders').insert({
        checkout_session_id,
        payment_intent_id: payment_intent,
        customer_id: customerId,
        amount_subtotal,
        amount_total,
        currency,
        payment_status,
        status: 'completed',
      });

      if (orderError) {
        console.error('Error inserting order:', orderError);
        return;
      }
      console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
    } catch (error) {
      console.error('Error processing one-time payment:', error);
    }
  }
}

// ─── Stripe sync ──────────────────────────────────────────────────────────────

async function syncCustomerFromStripe(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        { customer_id: customerId, subscription_status: 'not_started' },
        { onConflict: 'customer_id' },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
      return;
    }

    const subscription = subscriptions.data[0];

    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method &&
        typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      { onConflict: 'customer_id' },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }

    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}
