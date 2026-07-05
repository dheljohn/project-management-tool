declare global {
  namespace Express {
    interface User {
      id: number;
      user_id: string;
    }
  }
}
export {};
