export class NotFoundError extends Error {

    private _status: Number;

    constructor(message: string) {
        super(message);
        this._status = 404;
    }

    get status(): Number {
        return this._status;
    }
}
