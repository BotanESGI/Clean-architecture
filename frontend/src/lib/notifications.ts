// Gestion des notifications push

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Ce navigateur ne supporte pas les notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Ce navigateur ne supporte pas les Service Workers");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker enregistré:", registration);
    return registration;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du Service Worker:", error);
    return null;
  }
}

export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
      ),
    });

    console.log("Abonnement push créé:", subscription);
    return subscription;
  } catch (error) {
    console.error("Erreur lors de l'abonnement push:", error);
    return null;
  }
}

// Convertir la clé VAPID publique en format Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function showLocalNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<void> {
  if (Notification.permission !== "granted") {
    console.warn("Permission de notification non accordée");
    return;
  }

  new Notification(title, {
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    ...options,
  });
}

