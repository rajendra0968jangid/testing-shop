self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: 'Payment Received', body: event.data.text(), url: '/' };
  }

  const title = payload.title || 'New Razorpay Payment';
  const options = {
    body: payload.body || 'A payment has been credited to your QR.',
    tag: payload.data?.paymentId || 'razorpay-payment', // Prevents duplicate alerts for the same payment
    renotify: true,
    requireInteraction: true,
    data: { url: payload.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});