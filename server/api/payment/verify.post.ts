import { kkiapay } from '@kkiapay-org/nodejs-sdk'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { transactionId, examenId, telephone } = await readBody(event)
  const config = useRuntimeConfig()

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceKey
  )

  // 1. Vérifier la transaction via le SDK KkiaPay
  const k = kkiapay({
    privatekey: config.kkiapayPrivateKey,
    publickey: config.public.kkiapayPublicKey,
    secretkey: config.kkiapaySecretKey,
    sandbox: true,
  })

  let verifyData: any
  try {
    verifyData = await k.verify(transactionId)
  } catch (e: any) {
    throw createError({ statusCode: 400, message: 'Transaction non valide : ' + e.message })
  }

  if (!verifyData || verifyData.status !== 'SUCCESS') {
    throw createError({ statusCode: 400, message: 'Transaction non confirmée' })
  }

  // 2. Vérifier que l'examen existe
  const { data: examen } = await supabase
    .from('examens')
    .select('prix')
    .eq('id', examenId)
    .single()

  if (!examen) throw createError({ statusCode: 404, message: 'Examen non trouvé' })

  // 3. Enregistrer le paiement et générer le token
  const { data: paiement, error } = await supabase
    .from('paiements')
    .insert({
      examen_id: examenId,
      montant: verifyData.amount,
      telephone,
      kkiapay_transaction_id: transactionId,
      statut: 'confirme',
      token_expire_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('token')
    .single()

  if (error) throw createError({ statusCode: 500, message: 'Erreur enregistrement paiement' })

  return { token: paiement.token }
})