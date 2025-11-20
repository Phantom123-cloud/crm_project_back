import { BadRequestException } from '@nestjs/common';
import { RolesData } from '../interfaces/roles-data.interface';

export const createRolesData = (props: RolesData) => {
  const { types, rolesData } = props;
  const roles = types.reduce(
    (acc, val) => {
      acc.push({
        id: val.id,
        type: val.name,
        descriptions: val.descriptions,
        roles: [],
      });
      return acc;
    },
    [] as {
      id: string;
      type: string;
      descriptions: string;
      roles: { name: string; descriptions: string; id: string }[];
    }[],
  );

  for (const role of rolesData) {
    const index = roles.findIndex((t) => t.id === role.type.id);

    if (index < 0) {
      throw new BadRequestException('Что то пошло не так при сборе данных');
    }

    roles[index].roles.push({
      name: role.name,
      id: role.id,
      descriptions: role.descriptions,
    });
  }

  const filteredData = roles.filter((item) => item.roles.length);

  return filteredData;
};
