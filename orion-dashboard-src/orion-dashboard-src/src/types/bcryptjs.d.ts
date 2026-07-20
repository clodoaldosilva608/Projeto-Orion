// Declaração local para bcryptjs (compatível com bcryptjs@2.4.3 usado no projeto).
// Evita a dependência de @types/bcryptjs@3 (feito para bcryptjs@3) que não casa
// com a versão 2 instalada.
declare module 'bcryptjs' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>
  export function compare(data: string, encrypted: string): Promise<boolean>
  export function hashSync(data: string, saltOrRounds: string | number): string
  export function compareSync(data: string, encrypted: string): boolean
  export function genSalt(rounds?: number): Promise<string>

  const bcrypt: {
    hash: typeof hash
    compare: typeof compare
    hashSync: typeof hashSync
    compareSync: typeof compareSync
    genSalt: typeof genSalt
  }
  export default bcrypt
}
