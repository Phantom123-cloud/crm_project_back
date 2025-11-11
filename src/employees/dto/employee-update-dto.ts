import { LanguageLevel, PhoneSelection } from '@prisma/client';

export class EmployeeUpdateDto {
  phones: { number: string; option: PhoneSelection }[];
  foreignLanguages: { languageId: string; level: LanguageLevel }[];
  citizenships: string[];
  email: string;
  fullName: string;
  tradingСode: string;
  birthDate: string;
  dateFirstTrip: string;
  isInMarriage: boolean;
  isHaveChildren: boolean;
  isHaveDriverLicense: boolean;
  drivingExperience: number;
  isHaveInterPassport: boolean;
  notes: string;
}
