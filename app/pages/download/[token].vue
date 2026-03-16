<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6" style="background: var(--cream)">

    <!-- Logo -->
    <div class="mb-10 flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style="background: var(--navy)">E</div>
      <span class="font-semibold" style="font-family: 'DM Serif Display', serif; color: var(--navy)">ExamensBénin</span>
    </div>

    <div class="w-full max-w-sm">

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <div class="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4" style="border-color: var(--navy); border-top-color: transparent"></div>
        <p class="text-sm" style="color: var(--text-muted)">Vérification du paiement...</p>
      </div>

      <!-- Erreur -->
      <div v-else-if="erreur" class="rounded-2xl p-8 text-center border" style="background: white; border-color: var(--border)">
        <div class="text-4xl mb-4">⚠️</div>
        <h2 class="text-xl mb-2" style="font-family: 'DM Serif Display', serif; color: var(--navy)">Lien invalide</h2>
        <p class="text-sm mb-6" style="color: var(--text-muted)">{{ erreur }}</p>
        <NuxtLink to="/" class="inline-block px-5 py-2.5 rounded-xl text-sm font-medium text-white" style="background: var(--navy)">
          Retour au catalogue
        </NuxtLink>
      </div>

      <!-- Succès -->
      <div v-else class="rounded-2xl border overflow-hidden" style="background: white; border-color: var(--border); box-shadow: 0 8px 32px rgba(0,0,0,0.08)">

        <!-- Header succès -->
        <div class="p-6 text-center" style="background: var(--navy)">
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-3" style="background: rgba(201,150,42,0.2)">✓</div>
          <h2 class="text-2xl text-white" style="font-family: 'DM Serif Display', serif">Paiement confirmé !</h2>
          <p class="text-sm mt-1" style="color: rgba(255,255,255,0.6)">Vos fichiers sont prêts</p>
        </div>

        <!-- Liens de téléchargement -->
        <div class="p-5 space-y-3">
          <a
            v-if="epreuveUrl"
            :href="epreuveUrl"
            target="_blank"
            class="flex items-center gap-4 p-4 rounded-xl border transition-all hover:-translate-y-0.5"
            style="border-color: var(--border); text-decoration: none"
            onmouseover="this.style.borderColor='var(--navy)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'"
            onmouseout="this.style.borderColor='var(--border)'; this.style.boxShadow='none'"
          >
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style="background: var(--cream)">📄</div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm" style="color: var(--navy)">Épreuve officielle</p>
              <p class="text-xs" style="color: var(--text-muted)">PDF • Téléchargement direct</p>
            </div>
            <span class="text-sm font-medium flex-shrink-0" style="color: var(--blue)">↓</span>
          </a>

          <a
            v-if="corrigeIaUrl"
            :href="corrigeIaUrl"
            target="_blank"
            class="flex items-center gap-4 p-4 rounded-xl border transition-all hover:-translate-y-0.5"
            style="border-color: var(--gold-light); background: #FFFDF7; text-decoration: none"
            onmouseover="this.style.boxShadow='0 4px 12px rgba(201,150,42,0.12)'; this.style.borderColor='var(--gold)'"
            onmouseout="this.style.boxShadow='none'; this.style.borderColor='var(--gold-light)'"
          >
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style="background: var(--gold-light)">✦</div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm" style="color: var(--navy)">Corrigé détaillé par l'IA</p>
              <p class="text-xs" style="color: var(--text-muted)">PDF • Explications complètes</p>
            </div>
            <span class="text-sm font-medium flex-shrink-0" style="color: var(--gold)">↓</span>
          </a>
        </div>

        <!-- Footer modal -->
        <div class="px-5 pb-5">
          <p class="text-center text-xs rounded-lg p-3" style="background: var(--cream); color: var(--text-muted)">
            🕐 Ces liens expirent le {{ expiration }}
          </p>
        </div>
      </div>

      <NuxtLink to="/" class="block text-center text-sm mt-6" style="color: var(--text-muted)">
        ← Retour au catalogue
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const token = route.params.token as string

const loading = ref(true)
const erreur = ref('')
const epreuveUrl = ref('')
const corrigeIaUrl = ref('')
const expiration = ref('')

onMounted(async () => {
  try {
    const result = await $fetch<{
      epreuveUrl: string
      corrigeIaUrl: string
      expireAt: string
    }>(`/api/download/${token}`)
    epreuveUrl.value = result.epreuveUrl
    corrigeIaUrl.value = result.corrigeIaUrl
    expiration.value = new Date(result.expireAt).toLocaleString('fr-FR')
  } catch (e: any) {
    erreur.value = e.data?.message || 'Lien invalide ou expiré.'
  }
  loading.value = false
})
</script>