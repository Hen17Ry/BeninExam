import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceKey
  )

  const { transactionId, status, data: paiementId } = body

  if (status !== 'SUCCESS') {
    await supabase
      .from('paiements')
      .update({ statut: 'echoue' })
      .eq('id', paiementId)
    return { ok: false }
  }

  // Marquer le paiement comme confirmé
  const { data: paiement, error } = await supabase
    .from('paiements')
    .update({
      statut: 'confirme',
      kkiapay_transaction_id: transactionId,
      token_expire_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', paiementId)
    .select()
    .single()

  if (error || !paiement) return { ok: false }

  // Rediriger vers la page de téléchargement
  return sendRedirect(event, `/download/${paiement.token}`, 302)
})