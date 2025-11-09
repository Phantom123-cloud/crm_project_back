import { UpdateEmployeeData } from '../interfaces/update-employee-data';

export const buildUpdateData = (dto: UpdateEmployeeData) => ({
  ...(dto.tradingСode && { tradingСode: dto.tradingСode }),
  ...(dto.birthDate && { birthDate: dto.birthDate }),
  ...(dto.dateFirstTrip && { dateFirstTrip: dto.dateFirstTrip }),
  ...(typeof dto.isInMarriage === 'boolean' && {
    isInMarriage: dto.isInMarriage,
  }),
  ...(typeof dto.isHaveChildren === 'boolean' && {
    isHaveChildren: dto.isHaveChildren,
  }),
  ...(typeof dto.isHaveDriverLicense === 'boolean' && {
    isHaveDriverLicense: dto.isHaveDriverLicense,
  }),
  ...(typeof dto.isHaveInterPassport === 'boolean' && {
    isHaveInterPassport: dto.isHaveInterPassport,
  }),
  ...(dto.drivingExperience && { drivingExperience: dto.drivingExperience }),
  ...(dto.notes && { notes: dto.notes }),
});
