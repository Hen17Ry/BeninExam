<template>
  <Transition name="banner">
    <div v-if="show" class="fixed bottom-0 left-0 right-0 z-50 p-4" style="pointer-events: none">
      <div class="max-w-sm mx-auto rounded-2xl p-4 flex items-center gap-4" style="background: var(--navy); box-shadow: 0 8px 32px rgba(0,0,0,0.3); pointer-events: all">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style="background: rgba(255,255,255,0.1)">E</div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-white leading-tight">Installer ExamensBénin</p>
          <p class="text-xs mt-0.5" style="color: rgba(255,255,255,0.6)">Accès rapide depuis votre écran d'accueil</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button @click="dismiss" class="text-xs px-2 py-1.5 rounded-lg transition" style="color: rgba(255,255,255,0.5)">
            Plus tard
          </button>
          <button @click="install" class="text-xs px-3 py-1.5 rounded-lg font-semibold transition" style="background: var(--gold); color: var(--navy)">
            Installer
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const show = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  // Ne pas afficher si déjà installé ou déjà refusé récemment
  const dismissed = localStorage.getItem('pwa-dismissed')
  if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return

  // Écouter l'événement beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault()
    deferredPrompt = e
    // Afficher la bannière après 2 secondes
    setTimeout(() => { show.value = true }, 2000)
  })

  // Sur iOS, proposer manuellement (pas d'événement beforeinstallprompt)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  if (isIOS && !isStandalone) {
    setTimeout(() => { show.value = true }, 2000)
  }
})

async function install() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    show.value = false
    if (outcome === 'accepted') localStorage.setItem('pwa-dismissed', '0')
  } else {
    // iOS — instructions manuelles
    alert('Sur iOS : appuyez sur le bouton Partager ↑ puis "Sur l\'écran d\'accueil"')
    dismiss()
  }
}

function dismiss() {
  show.value = false
  localStorage.setItem('pwa-dismissed', String(Date.now()))
}
</script>

<style scoped>
.banner-enter-active, .banner-leave-active { transition: all 0.3s ease; }
.banner-enter-from, .banner-leave-to { opacity: 0; transform: translateY(100%); }
</style>