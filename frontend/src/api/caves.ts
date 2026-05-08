export interface Cave {
  id: number;
  registry_id: string;
  plaque_number: string | null;
  name: string;
  latitude: number | null;
  longitude: number | null;
  elevation: number | null;
  length: number | null;
  depth_positive: number | null;
  depth_negative: number | null;
  municipality: string | null;
  valley: string | null;
  geology: string | null;
  description: string | null;
  last_survey_date: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function fetchCaves(params: { search?: string; ordering?: string; page?: number }): Promise<PaginatedResponse<Cave>> {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.ordering) query.append('ordering', params.ordering);
  if (params.page) query.append('page', params.page.toString());

  const response = await fetch(`/api/v1/caves/?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch caves');
  }
  return response.json();
}

export async function fetchCaveGeoJson(): Promise<GeoJSON.FeatureCollection> {
  const response = await fetch('/api/v1/caves/geojson/');
  if (!response.ok) {
    throw new Error('Failed to fetch cave geojson');
  }
  return response.json();
}

export async function fetchCave(registryId: string): Promise<Cave> {
  const response = await fetch(`/api/v1/caves/${registryId}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch cave detail');
  }
  return response.json();
}
