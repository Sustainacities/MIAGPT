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



function updateList() {
  // Update the Alpine.js data object
  Alpine.store('myApp', () => ({
    chats: JSON.parse(localStorage.getItem('chats')) || [],
    
  }));
}

window.addEventListener('storage', (event) => {
  if (event.key === 'chats') {
    updateList();
  }
});

async function send() {
  console.log('send')
  const input = {
    chats:localStorage.getItem('chats'),
    activeTab: localStorage.getItem('activeTab') || 'train'
  }
  console.log(input)
  let resp = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ input: input }),
    headers: {
      "Content-Type": "application/json"
    }
  })

  let data = await resp.json()
  console.log(Alpine.store('myApp').activeTab)
}

// Basic Store Example in Alpine.
window.addEventListener('alpine:init', () => {
  Alpine.store('chats',JSON.parse(localStorage.getItem('chats')) || []);
  Alpine.store('tabs', [
      {calltoaction:'Add data or a link for me to respond',name:'Train'},
      {calltoaction:'Ask me anything and I will do my best to respond',name:'Prompt'},
      {calltoaction:'Ask me to graph or chart something and I will do my best to generate it',name:'Graph'},
      {calltoaction:'Ask me what you would like me to map',name:'Map'},
      {calltoaction:'Ask me to generate a table of data you would like.',name:'Table'}
    ]);
  
  Alpine.store('nav', {
    isOpen: false,
    close() { return this.isOpen = false },
    open() { return this.isOpen = true },
    toggle() { return this.isOpen = !this.isOpen }
  })
});
