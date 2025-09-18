import { HttpError } from "./HttpError.js";

export class ConflictError extends HttpError {
    constructor(message: string) {
        super(message, 409);
    }
}
