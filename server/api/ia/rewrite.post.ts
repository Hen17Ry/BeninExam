import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { marked } from 'marked'
import puppeteer from 'puppeteer'

export default defineEventHandler(async (event) => {
  const { examenId } = await readBody(event)
  const config = useRuntimeConfig()

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceKey
  )

  // 1. Récupérer l'examen
  const { data: examen, error } = await supabase
    .from('examens')
    .select('*')
    .eq('id', examenId)
    .single()

  if (error || !examen) throw createError({ statusCode: 404, message: 'Examen non trouvé' })

  // 2. Télécharger les PDFs
  const { data: epData } = await supabase.storage
    .from('epreuves')
    .download(examen.epreuve_url)

  const { data: corData } = await supabase.storage
    .from('corriges-originaux')
    .download(examen.corrige_original_url)

  if (!epData || !corData) throw createError({ statusCode: 500, message: 'Fichiers introuvables' })

  // 3. Convertir en base64
  const toBase64 = async (blob: Blob) => {
    const buffer = await blob.arrayBuffer()
    return Buffer.from(buffer).toString('base64')
  }

  const epBase64 = await toBase64(epData)
  const corBase64 = await toBase64(corData)

  // 4. Envoyer à OpenRouter
  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: config.openrouterApiKey,
  })

  const response = await client.chat.completions.create({
    model: 'openrouter/auto',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Tu es un professeur expérimenté au Bénin. On te donne une épreuve d'examen et son corrigé officiel.

Ton travail : réécrire le corrigé de zéro, en te basant sur l'épreuve ET le corrigé officiel, mais en le rendant beaucoup plus complet, clair et pédagogique pour un élève béninois qui révise seul.

RÈGLES STRICTES :
- Ne saute AUCUNE question ou exercice de l'épreuve
- Pour chaque question, rappelle brièvement l'énoncé avant de corriger
- Explique POURQUOI chaque étape est faite, pas seulement COMMENT
- Si c'est un calcul, détaille chaque opération ligne par ligne
- Si c'est une rédaction, explique le plan et les idées clés attendues
- Si c'est une démonstration, justifie chaque étape avec la propriété ou règle utilisée
- Utilise un langage simple et accessible à un élève de terminale
- Mets en valeur les pièges courants et les erreurs à éviter
- Encadre chaque résultat final avec **Résultat : ...**

FORMAT MARKDOWN :
- ## Exercice N ou ## Partie N pour chaque grande partie
- ### Question N pour chaque sous-question
- Utilise les formules mathématiques entre balises : $formule$
- Utilise des listes numérotées pour les étapes
- Gras pour les mots clés et résultats importants

Commence directement par le premier exercice sans introduction ni conclusion.`
          },
          {
            type: 'image_url',
            image_url: { url: `data:application/pdf;base64,${epBase64}` }
          },
          {
            type: 'image_url',
            image_url: { url: `data:application/pdf;base64,${corBase64}` }
          },
        ]
      }
    ],
  })

  const corrigeMarkdown = response.choices[0].message.content || ''

  // 5. Convertir Markdown → HTML → PDF
  const corrigeHtml = await marked(corrigeMarkdown)

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Georgia', serif;
          font-size: 13px;
          line-height: 1.8;
          color: #1a1a1a;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 50px;
        }
        h1 { font-size: 22px; color: #1a3a6b; border-bottom: 2px solid #1a3a6b; padding-bottom: 8px; }
        h2 { font-size: 18px; color: #1a3a6b; margin-top: 32px; border-left: 4px solid #1a3a6b; padding-left: 10px; }
        h3 { font-size: 15px; color: #2c5282; margin-top: 20px; }
        p { margin: 10px 0; text-align: justify; }
        strong { color: #1a3a6b; }
        ol, ul { padding-left: 24px; margin: 10px 0; }
        li { margin: 6px 0; }
        code { background: #f0f4ff; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
        pre { background: #f0f4ff; padding: 16px; border-radius: 6px; overflow-x: auto; }
        blockquote { border-left: 4px solid #e2e8f0; margin: 0; padding-left: 16px; color: #555; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1a3a6b;
        }
        .header h1 { border: none; font-size: 20px; }
        .header p { color: #555; font-size: 12px; margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Corrigé — ${examen.titre}</h1>
        <p>${examen.matiere} • ${examen.niveau}${examen.serie ? ' ' + examen.serie : ''} • ${examen.annee}</p>
        <p style="color:#888; font-size:11px;">Corrigé détaillé et pédagogique — ExamensBénin</p>
      </div>
      ${corrigeHtml}
    </body>
    </html>
  `

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' })

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  })

  await browser.close()

  // 6. Sauvegarder le PDF dans Storage
  const { data: iaData, error: iaErr } = await supabase.storage
    .from('corriges-ia')
    .upload(`${examenId}/corrige-ia.pdf`, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (iaErr) throw createError({ statusCode: 500, message: 'Erreur sauvegarde corrigé IA' })

  // 7. Mettre à jour le statut
  await supabase
    .from('examens')
    .update({ corrige_ia_url: iaData.path, statut: 'en_revision' })
    .eq('id', examenId)

  return { success: true }
})