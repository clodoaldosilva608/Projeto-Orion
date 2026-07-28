/**
 * CNPJ helpers — validação e máscara
 */

export function sanitizeCnpj(cnpj: string): string {
  return cnpj.replace(/[^\d]/g, "");
}

export function formatCnpj(cnpj: string): string {
  const s = sanitizeCnpj(cnpj).padStart(14, "0").slice(0, 14);
  return s.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function validateCnpj(cnpj: string): boolean {
  const s = sanitizeCnpj(cnpj);
  if (s.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(s)) return false; // todos iguais

  const calc = (slice: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) sum += parseInt(slice[i]) * weights[i];
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calc(s.slice(0, 12), w1);
  const d2 = calc(s.slice(0, 13), w2);

  return d1 === parseInt(s[12]) && d2 === parseInt(s[13]);
}

export function slugifyCompany(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40);
}
