import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = 'Builty <noreply@builty.fr>';
const APP_URL = Deno.env.get('APP_URL') ?? 'https://app.builty.fr';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function corsResponse(body: object | null, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendResendEmail(to: string, subject: string, html: string) {
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
    console.error('Resend API error:', error);
    throw new Error(`Failed to send email: ${error}`);
  }

  return res.json();
}

// ─── Templates ────────────────────────────────────────────────────────────────

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0D47A1 0%,#1976D2 100%);padding:40px 48px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Builty</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Gestion de chantiers</p>
    </div>
    <!-- Content -->
    <div style="padding:48px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="padding:24px 48px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 Builty · Tous droits réservés</p>
      <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">Vous recevez cet email car vous avez un compte Builty.</p>
    </div>
  </div>
</body>
</html>`;
}

function welcomeTemplate(firstName: string) {
  return baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">Bienvenue sur Builty, ${firstName} ! 🎉</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">Votre compte est prêt. Voici ce que vous pouvez faire dès maintenant :</p>

    <div style="display:grid;gap:12px;">
      ${[
        ['📋', 'Gérer vos projets', 'Créez et suivez tous vos chantiers en temps réel'],
        ['👥', 'Inviter votre équipe', 'Ajoutez collaborateurs et ouvriers à vos projets'],
        ['💰', 'Devis & Factures', 'Générez des documents professionnels en un clic'],
        ['📸', 'Photos de chantier', 'Partagez l\'avancement directement avec vos clients'],
      ].map(([icon, title, desc]) => `
        <div style="padding:16px;background:#f9fafb;border-radius:12px;border-left:4px solid #1976D2;">
          <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${icon} ${title}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${desc}</p>
        </div>
      `).join('')}
    </div>

    <div style="margin-top:36px;text-align:center;">
      <a href="${APP_URL}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#0D47A1,#1976D2);color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;">
        Accéder à mon espace →
      </a>
    </div>

    <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
      Une question ? Répondez à cet email, nous vous répondons sous 24h.
    </p>
  `);
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return corsResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Missing authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return corsResponse({ error: 'Unauthorized' }, 401);
    }

    const { type } = await req.json();

    if (type === 'welcome') {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const firstName = profile?.full_name?.split(' ')[0] ?? 'là';

      await sendResendEmail(
        user.email!,
        `Bienvenue sur Builty, ${firstName} ! 🎉`,
        welcomeTemplate(firstName),
      );

      return corsResponse({ success: true });
    }

    return corsResponse({ error: `Unknown email type: ${type}` }, 400);
  } catch (error: any) {
    console.error('send-email error:', error);
    return corsResponse({ error: error.message }, 500);
  }
});
