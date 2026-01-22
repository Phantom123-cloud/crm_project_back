// import { LanguageLevel, PhoneSelection } from '@prisma/client';

import { IsOptional, Length } from 'class-validator';

export class UpdateEmployeeFormDto {
  tradingСode: string;
  dateFirstTrip: string;
  isInMarriage: boolean;
  isHaveChildren: boolean;
  isHaveDriverLicense: boolean;
  isCoordinator: boolean;
  drivingExperience: string;
  coordinatorUserId: string;
  isHaveInterPassport: boolean;
  @IsOptional()
  @Length(1, 500, { message: 'Длина от 1 до 500 символов' })
  notes: string;
}
