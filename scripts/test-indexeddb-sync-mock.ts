// ==========================================
// TEST SUITE 2: INDEXEDDB MOCK & OFFLINE QUEUE
// ==========================================

let passed = 0
let failed = 0

function assert(cond: boolean, name: string) {
  if (cond) {
    console.log(`  ✅ PASSED: ${name}`)
    passed++
  } else {
    console.error(`  ❌ FAILED: ${name}`)
    failed++
  }
}

console.log('==============================================')
console.log('🧪 DÉBUT DU TEST UNITAIRE: FILE D\'ATTENTE & SYNCHRO HORS-LIGNE')
console.log('==============================================\n')

// Simulation d'une file d'attente FIFO IndexedDB (In-Memory Queue)
interface PendingMutationMock {
  id: number
  type: string
  entity: string
  data: any
  createdAt: string
  blobId?: string
}

class IndexedDBQueueMock {
  private store: PendingMutationMock[] = []
  private autoInc = 1

  async addPendingMutation(mutation: Omit<PendingMutationMock, 'id' | 'createdAt'>): Promise<number> {
    const item: PendingMutationMock = {
      ...mutation,
      id: this.autoInc++,
      createdAt: new Date().toISOString()
    }
    this.store.push(item)
    return item.id
  }

  async getPendingMutations(): Promise<PendingMutationMock[]> {
    return [...this.store]
  }

  async removePendingMutation(id: number): Promise<void> {
    this.store = this.store.filter(m => m.id !== id)
  }

  async clear(): Promise<void> {
    this.store = []
  }
}

async function runQueueTest() {
  const queue = new IndexedDBQueueMock()

  // 1. Ajouter 3 mutations hors-ligne
  const id1 = await queue.addPendingMutation({
    type: 'CREATE_PROFILE',
    entity: 'profiles',
    data: { name: 'Profil Designer Off-line', custom_url: 'designer-offline' },
    blobId: 'blob-123'
  })

  const id2 = await queue.addPendingMutation({
    type: 'UPDATE_PROFILE',
    entity: 'profiles',
    data: { id: 'prof-99', title: 'Nouveau Titre' }
  })

  const id3 = await queue.addPendingMutation({
    type: 'ADD_REVIEW',
    entity: 'reviews',
    data: { rating: 5, comment: 'Super service PWA !' }
  })

  const items = await queue.getPendingMutations()
  assert(items.length === 3, 'La file d\'attente contient exactement 3 mutations')
  assert(items[0].blobId === 'blob-123', 'La première mutation possède le blobId associé')
  assert(items[0].type === 'CREATE_PROFILE', 'L\'ordre FIFO est préservé')

  // 2. Simuler la synchronisation réussie de la 1ère et 2ème mutation
  await queue.removePendingMutation(id1)
  await queue.removePendingMutation(id2)

  const remaining = await queue.getPendingMutations()
  assert(remaining.length === 1, 'Il reste exactement 1 mutation après la synchro de 2 items')
  assert(remaining[0].id === id3, 'L\'item restant est bien la 3ème mutation')

  // 3. Vider la file
  await queue.clear()
  const emptyQueue = await queue.getPendingMutations()
  assert(emptyQueue.length === 0, 'La file d\'attente est totalement purgée')
}

runQueueTest().then(() => {
  console.log('\n==============================================')
  console.log(`📊 RÉSULTAT DU TEST SYNCHRO : ${passed} SUCCÈS, ${failed} ÉCHECS`)
  console.log('==============================================\n')
  if (failed > 0) process.exit(1)
  process.exit(0)
}).catch((err) => {
  console.error('Erreur durant l\'exécution:', err)
  process.exit(1)
})
