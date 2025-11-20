import { UpdateEmployeeFormDto } from '../dto/update-employee-form.dto';

export const buildUpdateData = (dto: Partial<UpdateEmployeeFormDto>) => ({
  ...(dto.tradingСode && { tradingСode: dto.tradingСode }),
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
