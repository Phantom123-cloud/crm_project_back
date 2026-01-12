import { Transform } from 'class-transformer';

type ToBooleanOptions = {
  defaultValue?: boolean;
  strict?: boolean;
};

export function ToBoolean(options: ToBooleanOptions = {}) {
  const { defaultValue, strict = false } = options;

  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return defaultValue ?? value;
    }

    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;

    if (strict) {
      return NaN;
    }

    return value;
  });
}
