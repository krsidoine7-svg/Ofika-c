const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('----------------------------------------------------');
console.log('✅ NOUVELLES CLÉS VAPID GÉNÉRÉES :');
console.log('');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('');
console.log('👉 Copiez ces 2 lignes et remplacez-les dans votre fichier .env');
console.log('----------------------------------------------------');
