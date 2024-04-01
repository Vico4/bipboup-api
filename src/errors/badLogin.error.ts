export class BadLoginError extends Error {
  constructor() {
    super("Incorrect login informations");
  }
}
