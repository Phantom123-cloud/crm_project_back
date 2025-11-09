import { LanguageLevel, PhoneSelection } from '@prisma/client';

export class EmployeeUpdateDto {
  tradingСode: string;
  citizenships: string[];
  birthDate: string;
  phones: { number: string; option: PhoneSelection }[];
  dateFirstTrip: string;
  isInMarriage: boolean;
  isHaveChildren: boolean;
  isHaveDriverLicense: boolean;
  drivingExperience: number;
  isHaveInterPassport: boolean;
  foreignLanguages: { languageId: string; level: LanguageLevel }[];
  notes: string;
}
