import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface Photo {
  url: string
  fileName: string
  description: string | null
}

interface RequestBody {
  clientEmail: string
  clientName: string
  projectName: string
  photos: Photo[]
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { clientEmail, clientName, projectName, photos }: RequestBody = await req.json()

    if (!clientEmail || !projectName || !photos || photos.length === 0) {
      throw new Error('Missing required fields')
    }

    // Get user profile for sender info
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, company_id')
      .eq('id', user.id)
      .single()

    const { data: company } = await supabaseClient
      .from('companies')
      .select('name, email, phone')
      .eq('id', profile?.company_id)
      .single()

    // Build email HTML
    const photosHTML = photos
      .map(
        (photo) => `
        <div style="margin-bottom: 30px; border: 2px solid #f1f1f1; border-radius: 12px; overflow: hidden; background: white;">
          <img 
            src="${photo.url}" 
            alt="${photo.fileName}"
            style="width: 100%; height: auto; display: block; max-height: 500px; object-fit: cover;"
          />
          <div style="padding: 16px;">
            <p style="margin: 0; font-weight: 600; color: #1f2937;">${photo.fileName}</p>
            ${photo.description ? `<p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">${photo.description}</p>` : ''}
          </div>
        </div>
      `
      )
      .join('')

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Photos de votre chantier</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0D47A1 0%, #1976D2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
                Photos de votre chantier
              </h1>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
                Bonjour ${clientName},
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Nous vous transmettons ${photos.length} photo${photos.length > 1 ? 's' : ''} de l'avancement de votre chantier <strong>${projectName}</strong>.
              </p>

              <!-- Photos -->
              ${photosHTML}

              <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #0D47A1;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                  Pour toute question, n'hésitez pas à nous contacter :
                </p>
                <p style="margin: 0; font-size: 14px; color: #374151;">
                  <strong>${company?.name || 'Votre entreprise'}</strong><br>
                  ${company?.email ? `📧 ${company.email}<br>` : ''}
                  ${company?.phone ? `📞 ${company.phone}` : ''}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Email envoyé depuis Builty - Gestion de chantiers
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: company?.email || 'noreply@builty.fr',
        to: [clientEmail],
        subject: `Photos du chantier : ${projectName}`,
        html: emailHTML,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Resend API error:', error)
      throw new Error('Failed to send email')
    }

    const data = await res.json()

    return new Response(JSON.stringify({ success: true, messageId: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
