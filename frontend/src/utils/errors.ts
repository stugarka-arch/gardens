export const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Сталася неочікувана помилка";
