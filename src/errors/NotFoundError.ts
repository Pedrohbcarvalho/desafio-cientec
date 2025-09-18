import { HttpError } from "./HttpError.js";

export class NotFoundError extends HttpError {
    constructor(message: string) {
        super(message, 404);
    }
}
