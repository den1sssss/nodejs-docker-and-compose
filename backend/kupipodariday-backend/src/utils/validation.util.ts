import { BadRequestException } from '@nestjs/common';

/**
 * Парсит строку в число с валидацией
 * @param id - строка для парсинга
 * @param fieldName - название поля для сообщения об ошибке
 * @returns число
 * @throws BadRequestException если строка не является валидным числом
 */
export function parseId(id: string, fieldName = 'ID'): number {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new BadRequestException(`Invalid ${fieldName}: must be a positive number`);
  }
  return parsedId;
}

/**
 * Удаляет пароль из объекта пользователя
 */
export function excludePassword<T extends { password?: string }>(obj: T): Omit<T, 'password'> {
  const { password, ...result } = obj;
  return result;
}

/**
 * Удаляет пароль из массива объектов пользователей
 */
export function excludePasswordFromArray<T extends { password?: string }>(
  arr: T[],
): Array<Omit<T, 'password'>> {
  return arr.map((item) => excludePassword(item));
}
