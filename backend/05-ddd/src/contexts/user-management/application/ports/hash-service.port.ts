export interface IHashService {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}

export const IHashService = Symbol('IHashService');
