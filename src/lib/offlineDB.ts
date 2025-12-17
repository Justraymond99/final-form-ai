// IndexedDB wrapper for offline data storage

const DB_NAME = "FinalFormOfflineDB";
const DB_VERSION = 1;

interface OfflineStore {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string; unique: boolean }[];
}

const STORES: OfflineStore[] = [
  {
    name: "pendingWorkouts",
    keyPath: "localId",
    indexes: [
      { name: "createdAt", keyPath: "createdAt", unique: false },
      { name: "synced", keyPath: "synced", unique: false },
    ],
  },
  {
    name: "pendingFoodLogs",
    keyPath: "localId",
    indexes: [
      { name: "createdAt", keyPath: "createdAt", unique: false },
      { name: "synced", keyPath: "synced", unique: false },
    ],
  },
  {
    name: "pendingWaterLogs",
    keyPath: "localId",
    indexes: [
      { name: "createdAt", keyPath: "createdAt", unique: false },
      { name: "synced", keyPath: "synced", unique: false },
    ],
  },
  {
    name: "cachedWorkouts",
    keyPath: "id",
  },
  {
    name: "cachedFoodLogs",
    keyPath: "id",
  },
  {
    name: "syncQueue",
    keyPath: "id",
    indexes: [
      { name: "type", keyPath: "type", unique: false },
      { name: "timestamp", keyPath: "timestamp", unique: false },
    ],
  },
];

class OfflineDB {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("[OfflineDB] Failed to open database:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("[OfflineDB] Database opened successfully");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        STORES.forEach((store) => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, {
              keyPath: store.keyPath,
              autoIncrement: store.keyPath === "localId",
            });
            
            store.indexes?.forEach((index) => {
              objectStore.createIndex(index.name, index.keyPath, {
                unique: index.unique,
              });
            });
            
            console.log(`[OfflineDB] Created store: ${store.name}`);
          }
        });
      };
    });

    return this.dbPromise;
  }

  async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<IDBValidKey> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllByIndex<T>(
    storeName: string,
    indexName: string,
    value: IDBValidKey
  ): Promise<T[]> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async count(storeName: string): Promise<number> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineDB = new OfflineDB();

// Types for offline data
export interface PendingWorkout {
  localId?: number;
  userId: string;
  name: string;
  exercisesData: any;
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  synced: boolean;
}

export interface PendingFoodLog {
  localId?: number;
  userId: string;
  foodName: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  mealType: string;
  quantity: number;
  unit: string;
  loggedAt: string;
  createdAt: string;
  synced: boolean;
}

export interface PendingWaterLog {
  localId?: number;
  userId: string;
  amountMl: number;
  date: string;
  createdAt: string;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: "workout" | "foodLog" | "waterLog";
  action: "create" | "update" | "delete";
  data: any;
  timestamp: string;
  retries: number;
}
