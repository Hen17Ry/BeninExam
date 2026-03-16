import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { examenId, telephone } = await readBody(event)
  const config = useRuntimeConfig()

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceKey
  )

  // Vérifier que l'examen existe et est publié
  const { data: examen, error } = await supabase
    .from('examens')
    .select('id, titre, prix')
    .eq('id', examenId)
    .eq('statut', 'publie')
    .single()

  if (error || !examen) {
    throw createError({ statusCode: 404, message: 'Examen non trouvé' })
  }

  // Créer l'entrée paiement en attente
  const { data: paiement, error: pErr } = await supabase
    .from('paiements')
    .insert({
      examen_id: examenId,
      montant: examen.prix,
      telephone,
      statut: 'en_attente',
    })
    .select()
    .single()

  if (pErr || !paiement) {
    throw createError({ statusCode: 500, message: 'Erreur création paiement' })
  }

  // Construire l'URL KkiaPay
  const params = new URLSearchParams({
    amount: String(examen.prix),
    key: config.public.kkiapayPublicKey,
    callback: `${config.public.appUrl}/api/payment/webhook`,
    data: paiement.id,
    phone: telephone,
    name: examen.titre,
    theme: '0369c7',
  })

  return {
    data: {
      kkiapayUrl: `https://widget.kkiapay.me?${params.toString()}`
    }
  }
})