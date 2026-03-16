<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/admin" class="text-gray-400 hover:text-gray-600">←</NuxtLink>
      <h1 class="text-2xl font-bold text-gray-800">Nouvel examen</h1>
    </div>

    <form @submit.prevent="soumettre" class="bg-white rounded-xl shadow-sm p-6 space-y-5">

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input v-model="form.titre" type="text" required
          placeholder="Ex: Mathématiques BAC C 2023"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Matière</label>
          <input v-model="form.matiere" type="text" required
            placeholder="Mathématiques"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Année</label>
          <input v-model="form.annee" type="number" required
            placeholder="2023"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
          <select v-model="form.niveau" required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Choisir --</option>
            <option value="BEPC">BEPC</option>
            <option value="BAC">BAC</option>
            <option value="CONCOURS">CONCOURS</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Série / Filière</label>
          <input v-model="form.serie" type="text"
            placeholder="C, D, A1, Sciences..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
        <textarea v-model="form.description" rows="3"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Épreuve (PDF)</label>
        <input type="file" accept="application/pdf" @change="e => fichierEpreuve = (e.target as HTMLInputElement).files?.[0] || null"
          class="w-full border border-gray-300 rounded-lg px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Corrigé (PDF)</label>
        <input type="file" accept="application/pdf" @change="e => fichierCorrige = (e.target as HTMLInputElement).files?.[0] || null"
          class="w-full border border-gray-300 rounded-lg px-3 py-2" />
      </div>

      <p v-if="erreur" class="text-red-500 text-sm">{{ erreur }}</p>

      <button type="submit" :disabled="loading"
        class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
        {{ loading ? progression : 'Soumettre et analyser avec l\'IA' }}
      </button>

    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const supabase = useSupabaseClient()
const erreur = ref('')
const loading = ref(false)
const progression = ref('')

const form = reactive({
  titre: '',
  matiere: '',
  annee: new Date().getFullYear(),
  niveau: '',
  serie: '',
  description: '',
})

const fichierEpreuve = ref<File | null>(null)
const fichierCorrige = ref<File | null>(null)

async function soumettre() {
  if (!fichierEpreuve.value || !fichierCorrige.value) {
    erreur.value = 'Veuillez uploader les deux fichiers PDF.'
    return
  }

  loading.value = true
  erreur.value = ''

  try {
    const id = crypto.randomUUID()

    // 1. Upload épreuve
    progression.value = 'Upload de l\'épreuve...'
    const { data: epData, error: epErr } = await supabase.storage
      .from('epreuves')
      .upload(`${id}/epreuve.pdf`, fichierEpreuve.value)
    if (epErr) throw epErr

    // 2. Upload corrigé original
    progression.value = 'Upload du corrigé...'
    const { data: corData, error: corErr } = await supabase.storage
      .from('corriges-originaux')
      .upload(`${id}/corrige.pdf`, fichierCorrige.value)
    if (corErr) throw corErr

    // 3. Créer l'entrée en DB avec statut brouillon
    progression.value = 'Sauvegarde...'
    const { error: dbErr } = await supabase.from('examens').insert({
      id,
      ...form,
      annee: Number(form.annee),
      epreuve_url: epData.path,
      corrige_original_url: corData.path,
      statut: 'brouillon',
      prix: 500,
    })
    if (dbErr) throw dbErr

    // 4. Lancer l'analyse IA côté serveur
    progression.value = 'Analyse IA en cours... (peut prendre 30s)'
    await $fetch('/api/ia/rewrite', {
      method: 'POST',
      body: { examenId: id },
    })

    await navigateTo(`/admin/examens/${id}`)

  } catch (e: any) {
    erreur.value = e.message || 'Une erreur est survenue'
    loading.value = false
  }
}
</script>