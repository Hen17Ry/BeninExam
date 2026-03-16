<template>
  <div>
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/admin" class="text-gray-400 hover:text-gray-600">←</NuxtLink>
      <h1 class="text-2xl font-bold text-gray-800">Révision du corrigé IA</h1>
      <span class="px-2 py-1 rounded-full text-xs font-medium"
        :class="{
          'bg-yellow-100 text-yellow-700': examen?.statut === 'brouillon',
          'bg-orange-100 text-orange-700': examen?.statut === 'en_revision',
          'bg-green-100 text-green-700': examen?.statut === 'publie',
        }">
        {{ examen?.statut }}
      </span>
    </div>

    <div v-if="loading" class="text-center py-20 text-gray-400">
      Chargement...
    </div>

    <div v-else-if="examen">
      <div class="bg-white rounded-xl shadow-sm p-5 mb-6 flex flex-wrap gap-4">
        <div><span class="text-xs text-gray-400 block">Titre</span><span class="font-medium">{{ examen.titre }}</span></div>
        <div><span class="text-xs text-gray-400 block">Matière</span><span class="font-medium">{{ examen.matiere }}</span></div>
        <div><span class="text-xs text-gray-400 block">Niveau</span><span class="font-medium">{{ examen.niveau }}</span></div>
        <div><span class="text-xs text-gray-400 block">Série</span><span class="font-medium">{{ examen.serie || '—' }}</span></div>
        <div><span class="text-xs text-gray-400 block">Année</span><span class="font-medium">{{ examen.annee }}</span></div>
        <div><span class="text-xs text-gray-400 block">Prix</span><span class="font-medium">{{ examen.prix }} FCFA</span></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <!-- Corrigé original -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 class="font-semibold text-gray-700">📄 Corrigé original (PDF)</h2>
            <a v-if="corrigeOriginalUrl" :href="corrigeOriginalUrl" target="_blank" class="text-xs text-blue-600 hover:underline">Ouvrir</a>
          </div>
          <div class="p-4">
            <iframe v-if="corrigeOriginalUrl" :src="corrigeOriginalUrl" class="w-full h-[600px] rounded border border-gray-200" />
            <p v-else class="text-gray-400 text-sm py-10 text-center">PDF non disponible</p>
          </div>
        </div>

        <!-- Corrigé IA -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="bg-blue-50 px-5 py-3 border-b border-blue-100 flex items-center justify-between">
            <h2 class="font-semibold text-blue-700">🤖 Corrigé réécrit par l'IA</h2>
            <div class="flex items-center gap-2">
              <span v-if="examen.statut === 'en_revision'" class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">En attente de validation</span>
              <a v-if="corrigeIaUrl" :href="corrigeIaUrl" target="_blank" class="text-xs text-blue-600 hover:underline">Ouvrir</a>
            </div>
          </div>
          <div class="p-4">
            <iframe v-if="corrigeIaUrl" :src="corrigeIaUrl" class="w-full h-[600px] rounded border border-gray-200" />
            <p v-else class="text-gray-400 text-sm py-10 text-center">Corrigé IA non disponible</p>
          </div>
        </div>

      </div>

      <div v-if="examen.statut !== 'publie'" class="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
        <div>
          <p class="font-medium text-gray-800">Prêt à publier ?</p>
          <p class="text-sm text-gray-500">Une fois publié, cet examen sera visible et achetable.</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="relancerIA"
            :disabled="actionLoading !== false"
            class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition text-sm"
          >
            {{ actionLoading === 'ia' ? 'Analyse en cours...' : '🔄 Relancer l\'IA' }}
          </button>
          <button
            @click="publier"
            :disabled="actionLoading !== false"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
          >
            {{ actionLoading === 'publier' ? 'Publication...' : '✅ Valider et publier' }}
          </button>
        </div>
      </div>

      <div v-else class="bg-green-50 border border-green-200 rounded-xl p-5 text-green-700 font-medium text-center">
        ✅ Cet examen est publié et disponible à l'achat.
      </div>

      <p v-if="erreur" class="text-red-500 text-sm mt-4">{{ erreur }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const route = useRoute()
const supabase = useSupabaseClient()
const id = route.params.id as string

interface Examen {
  id: string
  titre: string
  matiere: string
  niveau: string
  serie: string
  annee: number
  prix: number
  statut: string
  epreuve_url: string
  corrige_original_url: string
  corrige_ia_url: string
}

const examen = ref<Examen | null>(null)
const corrigeOriginalUrl = ref('')
const corrigeIaUrl = ref('')
const loading = ref(true)
const actionLoading = ref<string | false>(false)
const erreur = ref('')

onMounted(async () => {
  await charger()
})

async function charger() {
  loading.value = true

  const { data } = await supabase
    .from('examens')
    .select('*')
    .eq('id', id)
    .single()

  // @ts-ignore
  examen.value = data

  // @ts-ignore
  if (data?.corrige_original_url) {
    const { data: url } = await supabase.storage
      .from('corriges-originaux')
      // @ts-ignore
      .createSignedUrl(data.corrige_original_url, 3600)
    corrigeOriginalUrl.value = url?.signedUrl || ''
  }

  // @ts-ignore
  if (data?.corrige_ia_url) {
    const { data: url } = await supabase.storage
      .from('corriges-ia')
      // @ts-ignore
      .createSignedUrl(data.corrige_ia_url, 3600)
    corrigeIaUrl.value = url?.signedUrl || ''
  }

  loading.value = false
}

async function publier() {
  actionLoading.value = 'publier'
  erreur.value = ''
  const { error } = await supabase
    .from('examens')
    // @ts-ignore
    .update({ statut: 'publie' })
    .eq('id', id)
  if (error) {
    erreur.value = error.message
  } else {
    if (examen.value) examen.value.statut = 'publie'
  }
  actionLoading.value = false
}

async function relancerIA() {
  actionLoading.value = 'ia'
  erreur.value = ''
  try {
    await $fetch('/api/ia/rewrite', {
      method: 'POST',
      body: { examenId: id },
    })
    await charger()
  } catch (e: any) {
    erreur.value = e.message
  }
  actionLoading.value = false
}
</script>