export class ForbiddenActionError extends Error {
  constructor() {
    super("You do not have rights to perform this action");
  }
}
