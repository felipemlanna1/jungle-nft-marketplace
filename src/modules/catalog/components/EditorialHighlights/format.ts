const editorialDate = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  timeZone: 'UTC',
});
export const formatEditorialDate = (value: string) => editorialDate.format(new Date(value));
