export default class ChangeLogError extends Error {
  constructor(message = 'Error generating the changelog') {
    super()
    this.name = 'ChangeLogError';
    this.message = message;
    this.stack = (new Error()).stack;
  }
}
