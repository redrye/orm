import Model from "./Model.ts";

class User extends Model {
    static table = 'users';
    protected attributes = []
    constructor() {
        super()
    }
}

export default User;