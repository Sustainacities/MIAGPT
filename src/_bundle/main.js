import Alpine from 'alpinejs'

window.Alpine = Alpine

window.miagptApp = function() {
  return {
    userInput: '',
    selectedDataset: '',
    submitQuery() {
      // Handle query submission and interaction with Cloudflare Pages Functions
    }
  };
}
// Start Alpine when the page is ready.
window.addEventListener('DOMContentLoaded', () => {
  Alpine.start()
});

// Basic Store Example in Alpine.
window.addEventListener('alpine:initializing', () => {
  Alpine.store('nav', {
    isOpen: false,
    close() { return this.isOpen = false },
    open() { return this.isOpen = true },
    toggle() { return this.isOpen = !this.isOpen }
  })
});
