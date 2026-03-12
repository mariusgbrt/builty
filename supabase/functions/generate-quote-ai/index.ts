import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface QuoteRequest {
  type: 'text' | 'image';
  content: string | string[];
  clientInfo?: string;
  companyId?: string;
}

interface QuoteItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

interface QuoteResponse {
  title: string;
  description: string;
  items: QuoteItem[];
  notes?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, content, clientInfo, companyId }: QuoteRequest = await req.json();

    if (!type || !content) {
      throw new Error('Missing required fields: type and content');
    }

    let servicesContext = '';
    if (companyId) {
      const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (!error && services && services.length > 0) {
        servicesContext = '\n\n📋 CATALOGUE DES TARIFS DE L\'ENTREPRISE (BASE DE CONNAISSANCES) :\n';
        servicesContext += 'IMPORTANT : Ces tarifs ont été configurés par l\'entreprise. UTILISE-LES EN PRIORITÉ ABSOLUE.\n\n';
        services.forEach((service: any) => {
          servicesContext += `• ${service.name}: ${service.unit_price_ht}€ HT par ${service.unit}`;
          if (service.description) {
            servicesContext += ` - ${service.description}`;
          }
          servicesContext += '\n';
        });
        servicesContext += '\n⚠️ Si un service correspond à la demande, tu DOIS utiliser exactement ce prix.\n';
      } else {
        servicesContext = '\n\n⚠️ Aucun tarif n\'a été configuré dans le catalogue de l\'entreprise. Estime des prix de marché raisonnables pour le secteur du bâtiment.\n';
      }
    }

    const systemPrompt = `Tu es un assistant expert en création de devis pour le secteur du bâtiment. Ta mission est d'analyser la demande du client et de générer un devis structuré et professionnel.${servicesContext}

Règles importantes :
- Génère un devis détaillé avec des postes de travail clairs et professionnels
- 🎯 PRIORITÉ ABSOLUE : Utilise EN PREMIER LIEU les tarifs du catalogue ci-dessus
- Si un service du catalogue correspond même partiellement à un poste, utilise son prix exact
- Pour les postes non couverts par le catalogue, estime des prix de marché raisonnables
- Utilise des unités appropriées (m², ml, u, forfait, Heure, Jour, etc.)
- Sois précis, professionnel et cohérent avec les tarifs de l'entreprise
- Si des informations manquent, fais des estimations raisonnables basées sur les standards du bâtiment

Tu dois TOUJOURS répondre avec un JSON valide au format suivant (sans markdown, juste le JSON brut) :
{
  "title": "Titre du devis",
  "description": "Description générale des travaux",
  "items": [
    {
      "description": "Description du poste",
      "quantity": 10,
      "unit": "m²",
      "unit_price": 50.00
    }
  ],
  "notes": "Notes ou conditions particulières (optionnel)"
}`;

    let messages: any[];

    if (type === 'image') {
      const imageContents = Array.isArray(content) ? content : [content];
      const imageCount = imageContents.length;
      const textPrompt = clientInfo
        ? `Informations client: ${clientInfo}\n\nAnalyse ${imageCount > 1 ? `ces ${imageCount} images` : 'cette image'} et génère un devis détaillé basé sur ce que tu vois.`
        : `Analyse ${imageCount > 1 ? `ces ${imageCount} images` : 'cette image'} et génère un devis détaillé basé sur ce que tu vois.`;

      const userContent: any[] = [
        {
          type: 'text',
          text: textPrompt
        }
      ];

      imageContents.forEach((imageUrl) => {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        });
      });

      messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userContent
        }
      ];
    } else {
      messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: clientInfo ? `Informations client: ${clientInfo}\n\nDemande: ${content}` : content as string
        }
      ];
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: type === 'image' ? 'gpt-4o' : 'gpt-4o',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    let quoteData: QuoteResponse;
    try {
      quoteData = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(
      JSON.stringify(quoteData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in generate-quote-ai:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});