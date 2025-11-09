import { ConflictException, NotFoundException, Type } from '@nestjs/common';
import { LanguageLevel, PhoneSelection } from '@prisma/client';

type ImportType = 'phone' | 'language' | 'citizen';

interface ValidationContext {
  existing: any[];
  incoming: any[];
}

export const validateImportedField = async (
  type: ImportType,
  { existing, incoming }: ValidationContext,
) => {
  switch (type) {
    case 'phone': {
      const hasDuplicate = existing.some((e) =>
        incoming.some((i) => i.option === e.option && i.number === e.number),
      );

      if (hasDuplicate) {
        throw new ConflictException('Такой номер уже добавлен');
      }

      const allowedOptions = Object.values(PhoneSelection);
      const invalidType = incoming.some(
        (p) => !allowedOptions.includes(p.option),
      );

      if (invalidType) {
        throw new NotFoundException('Некорректный тип телефона');
      }

      break;
    }

    case 'language': {
      const hasDuplicate = existing.some((e) =>
        incoming.some(
          (i) => i.languageId === e.languageId && i.level === e.level,
        ),
      );

      if (hasDuplicate) {
        throw new ConflictException(
          'Некоторые языки из вашего массива уже были добавлены пользователю',
        );
      }

      // проверка есть ли такие языки и такие уровни в БД
      const enumLanguageLevel = Object.values(LanguageLevel);
      const levels = incoming.map(({ level }) => level);

      const isIncorrectLevel = levels.some(
        (l) => !enumLanguageLevel.includes(l),
      );

      if (isIncorrectLevel) {
        throw new NotFoundException(
          'Переданные вами уровень отсутствует на сервере',
        );
      }

      break;
    }

    case 'citizen': {
      const hasDuplicate = existing.some((id) => incoming.includes(id));

      if (hasDuplicate) {
        throw new ConflictException(
          'Некоторые страны из вашего массива уже были добавлены пользователю',
        );
      }
      break;
    }
    default:
      break;
  }
};
