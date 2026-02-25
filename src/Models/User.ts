import Model from "./Model";
import Database from "@/Services/Database";

interface Post {
    id: number;
    title: string;
    content: string;
    // Add other post properties as needed
}

interface UserData {
    id?: number;
    name: string;
    email: string;
    createdAt: Date;
    posts?: number[];
}

class User extends Model {
    private static readonly STORE_NAME = 'users';
    private static readonly POSTS_STORE = 'posts';
    protected static storeName = User.STORE_NAME;

    static async create(data: Omit<UserData, 'id' | 'createdAt'>): Promise<UserData> {
        const userData: UserData = {
            ...data,
            createdAt: new Date(),
            posts: []
        };
        return super.create(userData);
    }

    static async getPosts(userId: number): Promise<Post[]> {
        const user = await this.find<UserData>(userId);
        if (!user?.posts?.length) return [];

        return this.executeStoreRequest(
            User.POSTS_STORE,
            'readonly',
            (store) => this.fetchPostsFromStore(store, user.posts!)
        );
    }

    private static async executeStoreRequest<T>(
        storeName: string,
        mode: IDBTransactionMode,
        operation: (store: IDBObjectStore) => Promise<T>
    ): Promise<T> {
        const db = Database.getInstance().getDb();
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        return operation(store);
    }

    private static fetchPostsFromStore(
        store: IDBObjectStore,
        postIds: number[]
    ): Promise<Post[]> {
        return new Promise((resolve, reject) => {
            const requests = postIds.map(id => store.get(id));
            const posts: Post[] = [];

            requests.forEach(request => {
                request.onsuccess = () => {
                    if (request.result) posts.push(request.result);
                    if (posts.length === requests.length) {
                        resolve(posts);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        });
    }
}

export default User;