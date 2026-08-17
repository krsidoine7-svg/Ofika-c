// ==========================================
// OFIKA OFFLINE STORE - INDEXEDDB
// Pure TypeScript Implementation (Zero Dependencies)
// ==========================================

const DB_NAME = 'ofika_offline_db'
const DB_VERSION = 1

export interface PendingMutation {
  id?: number
  type: 'CREATE_PROFILE' | 'UPDATE_PROFILE' | 'DELETE_PROFILE' | 'ADD_REVIEW'
  entity: 'profiles' | 'reviews' | 'cards'
  data: any
  createdAt: string
  blobId?: string
}

export interface PendingBlob {
  id: string
  blob: Blob
  fileName: string
  mimeType: string
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Store pour les profils mis en cache
      if (!db.objectStoreNames.contains('profiles')) {
        db.createObjectStore('profiles', { keyPath: 'id' })
      }

      // Store pour les avis mis en cache
      if (!db.objectStoreNames.contains('reviews')) {
        db.createObjectStore('reviews', { keyPath: 'id' })
      }

      // Store pour la file d'attente des mutations hors-ligne
      if (!db.objectStoreNames.contains('pendingMutations')) {
        db.createObjectStore('pendingMutations', { keyPath: 'id', autoIncrement: true })
      }

      // Store pour les médias/images temporaires
      if (!db.objectStoreNames.contains('pendingBlobs')) {
        db.createObjectStore('pendingBlobs', { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ------------------------------------------
// GESTION DES PROFILS HORS-LIGNE
// ------------------------------------------

export async function saveOfflineProfiles(profiles: any[]): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction('profiles', 'readwrite')
    const store = tx.objectStore('profiles')
    for (const profile of profiles) {
      if (profile.id) {
        store.put(profile)
      }
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('[OfflineStore] Erreur sauvegarde profils:', err)
  }
}

export async function getOfflineProfiles(): Promise<any[]> {
  try {
    const db = await openDB()
    const tx = db.transaction('profiles', 'readonly')
    const store = tx.objectStore('profiles')
    const request = store.getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    console.warn('[OfflineStore] Erreur lecture profils:', err)
    return []
  }
}

// ------------------------------------------
// GESTION DE LA QUEUE DE MUTATIONS HORS-LIGNE
// ------------------------------------------

export async function addPendingMutation(mutation: Omit<PendingMutation, 'id' | 'createdAt'>): Promise<number> {
  const db = await openDB()
  const tx = db.transaction('pendingMutations', 'readwrite')
  const store = tx.objectStore('pendingMutations')
  const fullMutation: Omit<PendingMutation, 'id'> = {
    ...mutation,
    createdAt: new Date().toISOString()
  }
  const request = store.add(fullMutation)
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

export async function getPendingMutations(): Promise<PendingMutation[]> {
  try {
    const db = await openDB()
    const tx = db.transaction('pendingMutations', 'readonly')
    const store = tx.objectStore('pendingMutations')
    const request = store.getAll()
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    console.warn('[OfflineStore] Erreur lecture pendingMutations:', err)
    return []
  }
}

export async function removePendingMutation(id: number): Promise<void> {
  const db = await openDB()
  const tx = db.transaction('pendingMutations', 'readwrite')
  const store = tx.objectStore('pendingMutations')
  store.delete(id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function clearPendingMutations(): Promise<void> {
  const db = await openDB()
  const tx = db.transaction('pendingMutations', 'readwrite')
  const store = tx.objectStore('pendingMutations')
  store.clear()
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ------------------------------------------
// GESTION DES BLOBS / IMAGES HORS-LIGNE
// ------------------------------------------

export async function savePendingBlob(pendingBlob: PendingBlob): Promise<void> {
  const db = await openDB()
  const tx = db.transaction('pendingBlobs', 'readwrite')
  const store = tx.objectStore('pendingBlobs')
  store.put(pendingBlob)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingBlob(id: string): Promise<PendingBlob | null> {
  try {
    const db = await openDB()
    const tx = db.transaction('pendingBlobs', 'readonly')
    const store = tx.objectStore('pendingBlobs')
    const request = store.get(id)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  } catch (err) {
    console.warn('[OfflineStore] Erreur lecture pendingBlob:', err)
    return null
  }
}

export async function removePendingBlob(id: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction('pendingBlobs', 'readwrite')
  const store = tx.objectStore('pendingBlobs')
  store.delete(id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
