import { api } from "./api";

// ✅ Pagination interface - matches Spring Boot Page<T>
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ========================
// Tourism card - for homepage / listing
// ========================
export interface TourismPublicCardDto {
  id?: number; // homepage may not return ID
  name: string;
  imageUrl?: string;
  viewersCount: number;
  category?: string;
  wereda?: string;
  kebele?: string;
  description?: string;
}

// ✅ Alias for frontend convenience
export type TourismPublicCard = TourismPublicCardDto;

// ========================
// Fetch params for listing
// ========================
interface FetchParams {
  categories?: string[];
  keyword?: string;
  wereda?: string;
  kebele?: string;
  page?: number;
  size?: number;
}

// ========================
// Fetch homepage tourism - categories only
// ========================
export const fetchHomepageTourism = async (categories: string[]): Promise<TourismPublicCard[]> => {
  const query = new URLSearchParams();
  categories.forEach((c) => query.append("categories", c));

  const res = await api.get<TourismPublicCard[]>(`/tourisms/public/homepage?${query.toString()}`);
  return res as unknown as TourismPublicCard[];
};

// ========================
// Fetch tourism with filters (search / listing page)
// ========================
export const fetchTourismPlaces = async (params: Partial<FetchParams> = {}): Promise<Page<TourismPublicCard>> => {
  const {
    categories = [],
    keyword = "",
    wereda = "",
    kebele = "",
    page = 0,
    size = 12,
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (categories.length > 0) {
    // append categories individually so backend receives multiple `categories` params
    categories.forEach(c => queryParams.append("categories", c));
  }
  if (keyword.trim()) queryParams.append("keyword", keyword.trim());
  if (wereda.trim()) queryParams.append("wereda", wereda.trim());
  if (kebele.trim()) queryParams.append("kebele", kebele.trim());
  const queryString = queryParams.toString();
  console.debug("Tourism search query:", queryString);
  const res = await api.get<any>(`/tourisms/public/search?${queryString}`);

  // Expose debug info to window for quick inspection in browser console
  if (typeof window !== "undefined") {
    try {
      (window as any).__lastTourismQuery = queryString;
    } catch (e) {
      /* ignore */
    }
  }

  // Normalize response: backend may return either a Page<T> or a raw array of items.
  const data = res as unknown as any;

  if (typeof window !== "undefined") {
    try {
      (window as any).__lastTourismResponse = data;
    } catch (e) {
      /* ignore */
    }
  }
  if (Array.isArray(data)) {
    const content = data as TourismPublicCard[];
    return {
      content,
      pageable: {
        pageNumber: page,
        pageSize: size,
        offset: page * size,
        paged: true,
        unpaged: false,
      },
      totalPages: 1,
      totalElements: content.length,
      number: page,
      size,
      numberOfElements: content.length,
      first: true,
      last: true,
      empty: content.length === 0,
    } as Page<TourismPublicCard>;
  }

  return data as Page<TourismPublicCard>;
};

// ========================
// Detail fetch
// ========================
export interface TourismFullDetailDto {
  id: number;
  name: string;
  description: string;
  wereda: string;
  kebele: string;
  bestTime?: string;
  peaceInfo?: string;
  visitTime?: string;
  languages: string[];
  viewersCount: number;
  category?: string;
  createdAt?: string;
  images: string[];
  nearbyPlaces: NearbyTourismDto[];
  ratingSummary: RatingSummaryResponseDto;
  ratings: TourismRatingResponseDto[];
}

export interface NearbyTourismDto {
  id: number;
  name: string;
  imageUrl?: string;
  category?: string;
  wereda?: string;
}

export interface RatingSummaryResponseDto {
  avgRating: number;
  totalRatings: number;
}

export interface TourismRatingResponseDto {
  id: number;
  rating: number;
  comment?: string;
  userFullName: string;
  createdAt: string;
}

export const fetchTourismDetail = async (tourismId: number, token?: string): Promise<TourismFullDetailDto> => {
  // If a token is provided, try the authenticated endpoint first (increments viewers).
  // If not provided or the authenticated call fails with 401/403, fall back to public endpoint.
  if (token) {
    try {
      const res = await api.get<TourismFullDetailDto>(`/user/tourism/${tourismId}/details`, token);
      return res as unknown as TourismFullDetailDto;
    } catch (err: any) {
      if (err?.status !== 401 && err?.status !== 403) throw err;
      // else continue to fallback
    }
  }

  const fallback = await api.get<TourismFullDetailDto>(`/tourisms/${tourismId}`);
  return fallback as unknown as TourismFullDetailDto;
};
