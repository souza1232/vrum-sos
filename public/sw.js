self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Vrum SOS'
  const options = {
    body: data.body || 'Novo chamado SOS!',
    icon: '/logo-icon.svg',
    badge: '/logo-icon.svg',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'vrum-sos-' + Date.now(),
    data: { url: data.url || '/painel/solicitacoes' },
    actions: [{ action: 'open', title: 'Ver chamado' }],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url || '/painel/solicitacoes'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
