import { HttpError } from "./HttpError.js";

export class BusinessLogicError extends HttpError {
    constructor(message: string) {
        super(message, 400);
    }
}
