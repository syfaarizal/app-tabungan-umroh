export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? Number(value) : value;
  return `Rp${Math.round(num).toLocaleString('id-ID')}`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
