<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl" style="font-family: 'DM Serif Display', serif; color: var(--navy)">Tableau de bord</h1>
        <p class="text-sm mt-1" style="color: var(--text-muted)">Gérez vos examens et suivez les ventes</p>
      </div>
      <NuxtLink
        to="/admin/examens/nouveau"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
        style="background: var(--navy)"
      >
        <span>+</span> Nouvel examen
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="rounded-2xl p-6 border" style="background: white; border-color: var(--border)">
        <p class="text-xs font-semibold uppercase tracking-wider mb-3" style="color: var(--text-muted)">Total examens</p>
        <p class="text-4xl" style="font-family: 'DM Serif Display', serif; color: var(--navy)">{{ stats.total }}</p>
      </div>
      <div class="rounded-2xl p-6 border" style="background: white; border-color: var(--border)">
        <p class="text-xs font-semibold uppercase tracking-wider mb-3" style="color: var(--text-muted)">Publiés</p>
        <p class="text-4xl" style="font-family: 'DM Serif Display', serif; color: #16A34A">{{ stats.publie }}</p>
      </div>
      <div class="rounded-2xl p-6 border" style="background: white; border-color: var(--border)">
        <p class="text-xs font-semibold uppercase tracking-wider mb-3" style="color: var(--text-muted)">En révision</p>
        <p class="text-4xl" style="font-family: 'DM Serif Display', serif; color: var(--gold)">{{ stats.en_revision }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-2xl border overflow-hidden" style="background: white; border-color: var(--border)">
      <div class="px-6 py-4 border-b flex items-center justify-between" style="border-color: var(--border)">
        <h2 class="font-semibold" style="font-family: 'DM Serif Display', serif; color: var(--navy)">Tous les examens</h2>
        <span class="text-xs px-2 py-1 rounded-full" style="background: var(--cream); color: var(--text-muted)">{{ examens.length }} examens</span>
      </div>

      <table class="w-full text-sm">
        <thead style="background: var(--cream)">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted)">Titre</th>
            <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted)">Niveau</th>
            <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted)">Année</th>
            <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted)">Statut</th>
            <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted)">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="examen in examens" :key="examen.id" class="border-t hover:bg-gray-50 transition-colors" style="border-color: var(--border)">
            <td class="px-6 py-4 font-medium" style="color: var(--navy)">{{ examen.titre }}</td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-1 rounded-md text-xs font-semibold"
                :style="examen.niveau === 'BEPC'
                  ? 'background: #EEF3FF; color: #1d4ed8'
                  : examen.niveau === 'BAC'
                  ? 'background: #F3EEFF; color: #7C3AED'
                  : 'background: #FFF3E8; color: #C2410C'"
              >{{ examen.niveau }}</span>
            </td>
            <td class="px-6 py-4" style="color: var(--text-muted)">{{ examen.annee }}</td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                :style="examen.statut === 'publie'
                  ? 'background: #F0FDF4; color: #16A34A'
                  : examen.statut === 'en_revision'
                  ? 'background: #FFFBEB; color: #D97706'
                  : 'background: var(--cream); color: var(--text-muted)'"
              >{{ examen.statut }}</span>
            </td>
            <td class="px-6 py-4">
              <NuxtLink :to="`/admin/examens/${examen.id}`" class="text-xs font-medium hover:underline" style="color: var(--blue)">
                Voir →
              </NuxtLink>
            </td>
          </tr>
          <tr v-if="examens.length === 0">
            <td colspan="5" class="px-6 py-16 text-center" style="color: var(--text-muted)">
              <div class="text-3xl mb-2">📂</div>
              Aucun examen pour l'instant
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })

const supabase = useSupabaseClient()
const examens = ref<any[]>([])

const stats = computed(() => ({
  total: examens.value.length,
  publie: examens.value.filter(e => e.statut === 'publie').length,
  en_revision: examens.value.filter(e => e.statut === 'en_revision').length,
}))

const { data } = await useAsyncData('examens-admin', async () => {
  const { data } = await supabase
    .from('examens')
    .select('*')
    .order('created_at', { ascending: false })
  return data
})

examens.value = data.value || []
</script>