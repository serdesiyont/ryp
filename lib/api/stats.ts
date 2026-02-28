import { apiFetch } from "./client";

// ── Response types matching the /stats endpoint ──

export interface TopRatedCampus {
  _id: string;
  name: string;
  address: string;
  description?: string;
  overallRating: number;
  count: number;
}

export interface LatestLecturerReview {
  _id: string;
  lecturerId: {
    _id: string;
    name: string;
    university: string;
    department: string;
  };
  userId: string;
  course: string;
  difficulty: number;
  wouldTakeAgain: boolean;
  quality: number;
  creditHr: number;
  grade: string;
  textbook: boolean;
  comment: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StatsData {
  campusCount: number;
  lecturerCount: number;
  totalReviews: number;
  topRatedCampuses: TopRatedCampus[];
  latestLecturerReviews: {
    data: LatestLecturerReview[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Fetch platform statistics from the /stats endpoint.
 * Returns counts, top campuses, and latest lecturer reviews.
 */
export async function fetchStats(page = 1): Promise<StatsData> {
  const res = await apiFetch<{ data: StatsData }>(`/stats?page=${page}`, {
    next: { revalidate: 60 }, // revalidate every 60 seconds
  });
  return res.data;
}
