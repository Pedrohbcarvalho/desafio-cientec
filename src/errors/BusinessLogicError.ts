export class BusinessLogicError extends Error {

    private _status: Number;

    constructor(message: string) {
        super(message);
        this._status = 400;
    }

    get status(): Number {
        return this._status;
    }
}
