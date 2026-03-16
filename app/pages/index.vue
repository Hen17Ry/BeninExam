<template>
  <div class="min-h-screen" style="background: var(--cream)">

    <!-- Header -->
    <header class="sticky top-0 z-40 border-b" style="background: rgba(250,248,245,0.92); backdrop-filter: blur(12px); border-color: var(--border)">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style="background: var(--navy)">E</div>
          <span class="font-semibold text-lg tracking-tight" style="font-family: 'DM Serif Display', serif; color: var(--navy)">ExamensBénin</span>
        </div>
        <NuxtLink to="/admin" class="text-xs px-3 py-1.5 rounded-full border transition hover:bg-white" style="color: var(--text-muted); border-color: var(--border)">
          Admin
        </NuxtLink>
      </div>
    </header>

    <!-- Hero -->
    <section class="py-20 px-6 text-center" style="background: var(--navy)">
      <div class="max-w-3xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6" style="background: rgba(201,150,42,0.15); color: var(--gold)">
          ✦ BEPC • BAC • Concours
        </div>
        <h1 class="text-5xl md:text-6xl mb-5 leading-tight" style="font-family: 'DM Serif Display', serif; color: white">
          Révisez avec les<br>
          <em style="color: var(--gold)">meilleures ressources</em>
        </h1>
        <p class="text-lg mb-10" style="color: rgba(255,255,255,0.65); max-width: 480px; margin: 0 auto 2.5rem">
          Épreuves officielles et corrigés détaillés par l'IA — complets, expliqués, pédagogiques.
        </p>

        <!-- Recherche -->
        <div class="max-w-md mx-auto relative">
          <input
            v-model="recherche"
            type="text"
            placeholder="Rechercher une matière, un niveau..."
            class="w-full px-5 py-3.5 pr-12 rounded-xl text-sm outline-none"
            style="background: white; border: 1.5px solid transparent; color: var(--text); box-shadow: 0 4px 20px rgba(0,0,0,0.15)"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>
    </section>

    <!-- Stats bar -->
    <div class="border-b border-t" style="background: white; border-color: var(--border)">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center gap-8 text-sm" style="color: var(--text-muted)">
        <span><strong style="color: var(--text)">{{ examens.length }}</strong> examens disponibles</span>
        <span>•</span>
        <span><strong style="color: var(--text)">Corrigé IA</strong> inclus sur chaque document</span>
        <span>•</span>
        <span><strong style="color: var(--text)">500 FCFA</strong> par document</span>
      </div>
    </div>

    <!-- Filtres -->
    <section class="max-w-6xl mx-auto px-6 pt-8 pb-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="niveau in ['Tous', 'BEPC', 'BAC', 'CONCOURS']"
          :key="niveau"
          @click="filtreNiveau = niveau === 'Tous' ? '' : niveau"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all"
          :style="(niveau === 'Tous' && !filtreNiveau) || filtreNiveau === niveau
            ? 'background: var(--navy); color: white; border: 1.5px solid var(--navy)'
            : 'background: white; color: var(--text-muted); border: 1.5px solid var(--border)'"
        >
          {{ niveau }}
        </button>
      </div>
    </section>

    <!-- Grille -->
    <section class="max-w-6xl mx-auto px-6 pb-20 pt-4">
      <div v-if="examensFiltres.length === 0" class="text-center py-24" style="color: var(--text-muted)">
        <div class="text-4xl mb-3">📭</div>
        <p>Aucun examen trouvé</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="examen in examensFiltres"
          :key="examen.id"
          @click="examanSelectionne = examen"
          class="group rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          style="background: white; border-color: var(--border); box-shadow: 0 1px 4px rgba(0,0,0,0.04)"
          onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'; this.style.borderColor='#C9962A'"
          onmouseout="this.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'; this.style.borderColor='var(--border)'"
        >
          <div class="p-5">
            <div class="flex items-start justify-between mb-4">
              <span class="px-2.5 py-1 rounded-md text-xs font-semibold"
                :style="examen.niveau === 'BEPC'
                  ? 'background: #EEF3FF; color: #1d4ed8'
                  : examen.niveau === 'BAC'
                  ? 'background: #F3EEFF; color: #7C3AED'
                  : 'background: #FFF3E8; color: #C2410C'"
              >
                {{ examen.niveau }}
              </span>
              <span class="text-xs font-medium px-2 py-0.5 rounded" style="background: var(--cream); color: var(--text-muted)">
                {{ examen.annee }}
              </span>
            </div>

            <h3 class="font-semibold text-base mb-1 leading-snug" style="font-family: 'DM Serif Display', serif; color: var(--navy)">
              {{ examen.titre }}
            </h3>
            <p class="text-sm mb-5" style="color: var(--text-muted)">
              {{ examen.matiere }}{{ examen.serie ? ' — Série ' + examen.serie : '' }}
            </p>

            <div class="flex items-center justify-between">
              <span class="text-lg font-bold" style="font-family: 'DM Serif Display', serif; color: var(--navy)">
                {{ examen.prix }} FCFA
              </span>
              <span class="text-xs flex items-center gap-1 px-2 py-1 rounded-full" style="background: var(--gold-light); color: var(--gold)">
                ✦ IA inclus
              </span>
            </div>
          </div>

          <div class="border-t px-5 py-3 flex items-center justify-between" style="border-color: var(--border)">
            <span class="text-xs" style="color: var(--text-muted)">Épreuve + Corrigé PDF</span>
            <span class="text-sm font-medium transition-colors group-hover:text-yellow-600" style="color: var(--blue)">
              Télécharger →
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t py-8 text-center text-xs" style="border-color: var(--border); color: var(--text-muted)">
      ExamensBénin — Paiement sécurisé via KkiaPay · MTN · Moov · Carte
    </footer>

    <!-- Modal paiement -->
    <Transition name="modal">
      <div v-if="examanSelectionne" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(15,27,45,0.6); backdrop-filter: blur(4px)">
        <div class="w-full max-w-md rounded-2xl overflow-hidden" style="background: white; box-shadow: 0 24px 64px rgba(0,0,0,0.2)">

          <!-- Modal header -->
          <div class="p-6 border-b" style="border-color: var(--border); background: var(--cream)">
            <div class="flex items-start justify-between">
              <div>
                <span class="text-xs font-medium px-2 py-0.5 rounded mb-2 inline-block"
                  :style="examanSelectionne.niveau === 'BEPC'
                    ? 'background: #EEF3FF; color: #1d4ed8'
                    : examanSelectionne.niveau === 'BAC'
                    ? 'background: #F3EEFF; color: #7C3AED'
                    : 'background: #FFF3E8; color: #C2410C'"
                >{{ examanSelectionne.niveau }}</span>
                <h3 class="text-xl font-semibold leading-tight" style="font-family: 'DM Serif Display', serif; color: var(--navy)">
                  {{ examanSelectionne.titre }}
                </h3>
                <p class="text-sm mt-0.5" style="color: var(--text-muted)">
                  {{ examanSelectionne.matiere }} • {{ examanSelectionne.annee }}
                </p>
              </div>
              <button @click="examanSelectionne = null" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition" style="color: var(--text-muted)">✕</button>
            </div>
          </div>

          <!-- Modal body -->
          <div class="p-6 space-y-5">
            <!-- Ce que vous recevrez -->
            <div class="rounded-xl p-4 space-y-2" style="background: var(--navy); color: white">
              <p class="text-xs font-semibold uppercase tracking-wider mb-3" style="color: rgba(255,255,255,0.5)">Ce que vous recevrez</p>
              <div class="flex items-center gap-2 text-sm"><span>📄</span> Épreuve officielle en PDF</div>
              <div class="flex items-center gap-2 text-sm"><span style="color: var(--gold)">✦</span> Corrigé détaillé par l'IA en PDF</div>
              <div class="flex items-center gap-2 text-sm"><span>🔗</span> Lien de téléchargement valable 24h</div>
            </div>

            <!-- Téléphone -->
            <div>
              <label class="block text-xs font-semibold mb-2 uppercase tracking-wider" style="color: var(--text-muted)">
                Votre numéro de téléphone
              </label>
              <input
                v-model="telephone"
                type="tel"
                placeholder="Ex: 97000000"
                class="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                style="background: var(--cream); border: 1.5px solid var(--border); color: var(--text)"
                onfocus="this.style.borderColor='var(--gold)'"
                onblur="this.style.borderColor='var(--border)'"
              />
            </div>

            <p v-if="erreurPaiement" class="text-sm text-red-500 rounded-lg p-3" style="background: #FFF1F1">
              {{ erreurPaiement }}
            </p>

            <!-- Bouton payer -->
            <button
              @click="payer"
              :disabled="!telephone || paiementLoading"
              class="w-full py-3.5 rounded-xl font-semibold text-white transition-all"
              style="background: var(--navy); font-family: 'DM Serif Display', serif; font-size: 1.1rem; letter-spacing: 0.01em"
              :style="(!telephone || paiementLoading) ? 'opacity: 0.5; cursor: not-allowed' : 'opacity: 1'"
              onmouseover="if(!this.disabled) this.style.background='var(--navy-mid)'"
              onmouseout="this.style.background='var(--navy)'"
            >
              {{ paiementLoading ? 'Ouverture...' : `Payer ${examanSelectionne.prix} FCFA` }}
            </button>

            <p class="text-center text-xs" style="color: var(--text-muted)">
              Paiement sécurisé · KkiaPay · MTN · Moov · Carte
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
  <PwaInstallBanner />
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const config = useRuntimeConfig()

interface Examen {
  id: string
  titre: string
  matiere: string
  niveau: string
  serie: string
  annee: number
  prix: number
  statut: string
}

const examens = ref<Examen[]>([])
const recherche = ref('')
const filtreNiveau = ref('')
const examanSelectionne = ref<Examen | null>(null)
const telephone = ref('')
const erreurPaiement = ref('')
const paiementLoading = ref(false)

const { data } = await useAsyncData('examens-public', async () => {
  const { data } = await supabase
    .from('examens')
    .select('id, titre, matiere, niveau, serie, annee, prix')
    .eq('statut', 'publie')
    .order('created_at', { ascending: false })
  return data
})

examens.value = (data.value as Examen[]) || []

const examensFiltres = computed(() => {
  return examens.value.filter(e => {
    const matchNiveau = !filtreNiveau.value || e.niveau === filtreNiveau.value
    const matchRecherche = !recherche.value ||
      e.titre.toLowerCase().includes(recherche.value.toLowerCase()) ||
      e.matiere.toLowerCase().includes(recherche.value.toLowerCase())
    return matchNiveau && matchRecherche
  })
})

async function payer() {
  if (!telephone.value || !examanSelectionne.value) return
  erreurPaiement.value = ''
  paiementLoading.value = true

  await nextTick()
  const win = window as any

  if (typeof win.openKkiapayWidget !== 'function') {
    erreurPaiement.value = 'Widget de paiement non chargé. Rechargez la page.'
    paiementLoading.value = false
    return
  }

  win.addKkiapayListener('success', onPaiementSuccess)
  win.addKkiapayListener('failed', onPaiementFailed)

  win.openKkiapayWidget({
    amount: examanSelectionne.value.prix,
    sandbox: true,
    key: config.public.kkiapayPublicKey,
    phone: '229' + telephone.value,
    name: 'ExamensBénin',
    data: examanSelectionne.value.id,
  })

  paiementLoading.value = false
}

async function onPaiementSuccess(response: any) {
  const win = window as any
  win.removeKkiapayListener('success')
  win.removeKkiapayListener('failed')
  try {
    const result = await $fetch<{ token: string }>('/api/payment/verify', {
      method: 'POST',
      body: {
        transactionId: response.transactionId,
        examenId: examanSelectionne.value?.id,
        telephone: telephone.value,
      }
    })
    await navigateTo(`/download/${result.token}`)
  } catch (e: any) {
    erreurPaiement.value = 'Paiement reçu mais erreur lors de la génération du lien. Contactez le support.'
  }
}

function onPaiementFailed() {
  const win = window as any
  win.removeKkiapayListener('success')
  win.removeKkiapayListener('failed')
  erreurPaiement.value = 'Paiement échoué. Veuillez réessayer.'
  paiementLoading.value = false
}

onUnmounted(() => {
  const win = window as any
  if (typeof win.removeKkiapayListener === 'function') {
    win.removeKkiapayListener('success')
    win.removeKkiapayListener('failed')
  }
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .max-w-md, .modal-leave-to .max-w-md { transform: scale(0.95) translateY(8px); }
</style>