// src/services/Database.ts
import DATABASE_CONFIG from '../Config/DatabaseConfig';
class Database {
    private static instance: Database;
    private db: IDBDatabase | null = null;

    private constructor() {}

    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connect(config?: any): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DATABASE_CONFIG.name, DATABASE_CONFIG.version);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object stores
                for (const [storeName, config] of Object.entries(DATABASE_CONFIG.stores)) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, config);
                    }
                }
            };
        });
    }

    getDb(): IDBDatabase {
        if (!this.db) {
            throw new Error('Database not initialized. Call connect() first.');
        }
        return this.db;
    }
}

export default Database;