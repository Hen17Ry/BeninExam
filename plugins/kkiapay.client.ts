export default defineNuxtPlugin(() => {
  // KkiaPay injecte ses fonctions globalement via le script
  // On les expose proprement
  return {
    provide: {
      openKkiapayWidget: (options: any) => {
        // @ts-ignore
        if (typeof window.openKkiapayWidget === 'function') {
          // @ts-ignore
          window.openKkiapayWidget(options)
        }
      },
      addKkiapayListener: (event: string, cb: any) => {
        // @ts-ignore
        if (typeof window.addKkiapayListener === 'function') {
          // @ts-ignore
          window.addKkiapayListener(event, cb)
        }
      },
      removeKkiapayListener: (event: string) => {
        // @ts-ignore
        if (typeof window.removeKkiapayListener === 'function') {
          // @ts-ignore
          window.removeKkiapayListener(event)
        }
      },
    },
  }
})