<template>
  <div class="min-h-screen" style="background: var(--cream)">
    <nav class="border-b" style="background: white; border-color: var(--border)">
      <div class="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs" style="background: var(--navy)">E</div>
            <span class="font-semibold text-sm" style="font-family: 'DM Serif Display', serif; color: var(--navy)">ExamensBénin</span>
          </div>
          <div class="hidden md:flex items-center gap-1">
            <NuxtLink to="/admin" class="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-gray-100" style="color: var(--text-muted)">Dashboard</NuxtLink>
            <NuxtLink to="/admin/examens/nouveau" class="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-gray-100" style="color: var(--text-muted)">+ Nouvel examen</NuxtLink>
          </div>
        </div>
        <button @click="logout" class="text-xs px-3 py-1.5 rounded-lg border transition hover:bg-red-50 hover:border-red-200 hover:text-red-600" style="color: var(--text-muted); border-color: var(--border)">
          Déconnexion
        </button>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-6 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}
</script>