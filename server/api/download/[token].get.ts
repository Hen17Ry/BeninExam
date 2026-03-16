import { createClient } from '@supabase/supabase-js'
import { watermarkPdf } from '../../utils/watermark'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  const config = useRuntimeConfig()

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceKey
  )

  // 1. Vérifier le token
  const { data: paiement, error } = await supabase
    .from('paiements')
    .select('*, examens(*)')
    .eq('token', token)
    .eq('statut', 'confirme')
    .single()

  if (error || !paiement) {
    throw createError({ statusCode: 404, message: 'Lien invalide' })
  }

  // 2. Vérifier expiration
  if (new Date(paiement.token_expire_at) < new Date()) {
    throw createError({ statusCode: 410, message: 'Lien expiré' })
  }

  const examen = paiement.examens as any
  const telephone = paiement.telephone

  // 3. Télécharger les PDFs depuis Supabase Storage
  const { data: epBlob } = await supabase.storage
    .from('epreuves')
    .download(examen.epreuve_url)

  const { data: corBlob } = await supabase.storage
    .from('corriges-ia')
    .download(examen.corrige_ia_url)

  if (!epBlob || !corBlob) {
    throw createError({ statusCode: 500, message: 'Fichiers introuvables' })
  }

  // 4. Appliquer le watermark sur les deux PDFs
  const epBuffer = await epBlob.arrayBuffer()
  const corBuffer = await corBlob.arrayBuffer()

  const epWatermarked = await watermarkPdf(epBuffer, telephone)
  const corWatermarked = await watermarkPdf(corBuffer, telephone)

  // 5. Uploader les PDFs watermarkés dans un bucket temporaire
  const timestamp = Date.now()

  const { data: epData } = await supabase.storage
    .from('telechargements')
    .upload(`${paiement.id}/${timestamp}-epreuve.pdf`, epWatermarked, {
      contentType: 'application/pdf',
      upsert: true,
    })

  const { data: corData } = await supabase.storage
    .from('telechargements')
    .upload(`${paiement.id}/${timestamp}-corrige.pdf`, corWatermarked, {
      contentType: 'application/pdf',
      upsert: true,
    })

  // 6. Générer les URLs signées (1 heure)
  const { data: epUrl } = await supabase.storage
    .from('telechargements')
    .createSignedUrl(epData!.path, 3600)

  const { data: corUrl } = await supabase.storage
    .from('telechargements')
    .createSignedUrl(corData!.path, 3600)

  return {
    epreuveUrl: epUrl?.signedUrl || '',
    corrigeIaUrl: corUrl?.signedUrl || '',
    expireAt: paiement.token_expire_at,
  }
})