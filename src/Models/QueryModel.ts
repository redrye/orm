import Database from "../Services/Database";
import {QueryBuilder} from "../QueryBuilder/QueryBuilder";

class QueryModel {
    protected db: Database;
    static table = '';
    constructor() {
        this.db = Database.getInstance();
    }

    static query<T extends Record<string, any>>(): QueryBuilder<T> {
        return new QueryBuilder<T>(this);
    }

    static where<T extends Record<string, any>>(field: keyof T, operatorOrValue: any, value?: any): QueryBuilder<T> {
        return this.query<T>().where(field, operatorOrValue, value);
    }

    static async all<T>(): Promise<T[]> {
        const db = Database.getInstance().getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.table, 'readonly');
            const store = transaction.objectStore(this.table);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    static async find<T>(id: number): Promise<T | null> {
        const db = Database.getInstance().getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.table, 'readonly');
            const store = transaction.objectStore(this.table);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    static async create<T extends Record<string, any>>(data: T): Promise<T & { id: number }> {
        const db = Database.getInstance().getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.table, 'readwrite');
            const store = transaction.objectStore(this.table);
            const request = store.add(data);

            request.onsuccess = () => {
                resolve({...data, id: request.result as number});
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    static async update<T extends Record<string, any>>(id: number, data: Partial<T>): Promise<T> {
        const db = Database.getInstance().getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.table, 'readwrite');
            const store = transaction.objectStore(this.table);

            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const existingData = getRequest.result;
                if (!existingData) {
                    reject(new Error('Record not found'));
                    return;
                }

                const updatedData = {...existingData, ...data};
                const updateRequest = store.put(updatedData);

                updateRequest.onsuccess = () => {
                    resolve(updatedData);
                };

                updateRequest.onerror = () => {
                    reject(updateRequest.error);
                };
            };

            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        });
    }

    static async delete(id: number): Promise<void> {
        const db = Database.getInstance().getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.table, 'readwrite');
            const store = transaction.objectStore(this.table);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }
}

export default QueryModel;