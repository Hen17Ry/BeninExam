<template>
  <div class="min-h-screen flex" style="background: var(--cream)">

    <!-- Panel gauche décoratif -->
    <div class="hidden lg:flex flex-col justify-between w-2/5 p-12" style="background: var(--navy)">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style="background: rgba(255,255,255,0.1)">E</div>
        <span class="text-white font-semibold" style="font-family: 'DM Serif Display', serif">ExamensBénin</span>
      </div>

      <div>
        <h2 class="text-4xl text-white leading-tight mb-4" style="font-family: 'DM Serif Display', serif">
          La plateforme de<br>
          <em style="color: var(--gold)">référence</em> pour les<br>
          examens au Bénin.
        </h2>
        <p class="text-sm" style="color: rgba(255,255,255,0.5)">BEPC · BAC · Concours · Corrigés IA</p>
      </div>

      <div class="text-xs" style="color: rgba(255,255,255,0.3)">
        Espace administrateur réservé
      </div>
    </div>

    <!-- Panel droit login -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-sm">

        <!-- Mobile logo -->
        <div class="flex items-center gap-2 mb-10 lg:hidden">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style="background: var(--navy)">E</div>
          <span class="font-semibold" style="font-family: 'DM Serif Display', serif; color: var(--navy)">ExamensBénin</span>
        </div>

        <h1 class="text-3xl mb-1" style="font-family: 'DM Serif Display', serif; color: var(--navy)">Connexion</h1>
        <p class="text-sm mb-8" style="color: var(--text-muted)">Accès réservé aux administrateurs</p>

        <form @submit.prevent="login" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--text-muted)">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="admin@exemple.com"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
              style="background: white; border: 1.5px solid var(--border); color: var(--text)"
              onfocus="this.style.borderColor='var(--navy)'"
              onblur="this.style.borderColor='var(--border)'"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--text-muted)">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
              style="background: white; border: 1.5px solid var(--border); color: var(--text)"
              onfocus="this.style.borderColor='var(--navy)'"
              onblur="this.style.borderColor='var(--border)'"
            />
          </div>

          <div v-if="error" class="text-sm p-3 rounded-xl" style="background: #FFF1F1; color: #DC2626">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3.5 rounded-xl font-semibold text-white transition-all mt-2"
            style="background: var(--navy); font-family: 'DM Serif Display', serif; font-size: 1.05rem"
            :style="loading ? 'opacity: 0.6; cursor: not-allowed' : ''"
            onmouseover="if(!this.disabled) this.style.background='var(--navy-mid)'"
            onmouseout="this.style.background='var(--navy)'"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  loading.value = true
  error.value = ''
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (err) {
    error.value = 'Email ou mot de passe incorrect'
  } else {
    await navigateTo('/admin')
  }
  loading.value = false
}
</script>