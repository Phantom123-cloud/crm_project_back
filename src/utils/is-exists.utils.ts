import { BadRequestException } from '@nestjs/common';

export function ensureNoDuplicates(
  ids: string[],
  existing: Set<string>,
  message: string,
) {
  if (ids.some((id) => existing.has(id))) {
    throw new BadRequestException(message);
  }
}

export function ensureAllExist(
  ids: string[],
  existing: Set<string>,
  message: string,
) {
  if (ids.some((id) => !existing.has(id))) {
    throw new BadRequestException(message);
  }
}
