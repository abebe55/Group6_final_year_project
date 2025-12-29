// frontend/src/types/guider.ts

export interface LanguageGuiderDto {
  id: number;
  fullName: string;
  contactInfo: string;
  languages: string[];
  active: boolean;
  tourismPlaceId?: number;
  tourismPlaceName?: string;
}
