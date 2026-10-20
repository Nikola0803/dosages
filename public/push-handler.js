// Service-worker push event handler — imported by the Workbox-generated SW
// Handles background push delivery and notification clicks

self.addEventListener('push', function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}

  var title   = data.title  || 'VialCalc';
  var body    = data.body   || 'Check your peptide cycle status.';
  var tag     = data.tag    || 'vc-notification';
  var destUrl = data.url    || '/tracker';

  event.waitUntil(
    self.registration.showNotification(title, {
      body:   body,
      icon:   '/icons/icon-192.png',
      badge:  '/icons/icon-96.png',
      tag:    tag,
      renotify: true,
      data:   { url: destUrl },
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/tracker';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      return clients.openWindow(url);
    })
  );
});
