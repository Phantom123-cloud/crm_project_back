export interface RolesData {
  types: {
    name: string;
    id: string;
    descriptions: string;
  }[];
  rolesData: {
    name: string;
    id: string;
    descriptions: string;
    type: {
      name: string;
      id: string;
    };
  }[];
}
