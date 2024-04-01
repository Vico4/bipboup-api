export interface AuthenticatedRequestParams {
  userId: string;
  connectedUser?: { userId: string; isAdmin: boolean };
}
