export class ConflictError extends Error {

    private _status: Number;

    constructor(message: string) {
        super(message);
        this._status = 409;
    }

    get status(): Number {
        return this._status;
    }
}
