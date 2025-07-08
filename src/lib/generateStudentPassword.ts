export function generatePassword(): string {
  const getRandomDigits = (length: number) =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const getRandomLetters = (length: number) =>
    Array.from({ length }, () =>
      letters.charAt(Math.floor(Math.random() * letters.length))
    ).join("");

  const numericPart = getRandomDigits(4);
  const letterPart = getRandomLetters(4);

  return `${numericPart}@${letterPart}`;
}
