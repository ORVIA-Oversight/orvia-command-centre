export class V2InvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'V2InvariantError';
  }
}
