const ngn = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' });

export function formatKobo(kobo: number): string {
  return ngn.format(kobo / 100);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(date));
}
