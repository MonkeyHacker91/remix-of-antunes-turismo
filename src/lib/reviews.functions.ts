import { createServerFn } from "@tanstack/react-start";

export type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhoto?: string;
  url?: string;
};

export type GoogleReviewsPayload = {
  configured: boolean;
  rating: number | null;
  total: number | null;
  mapsUrl: string | null;
  reviews: GoogleReview[];
};

const EMPTY: GoogleReviewsPayload = {
  configured: false,
  rating: null,
  total: null,
  mapsUrl: null,
  reviews: [],
};

export const getGoogleReviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<GoogleReviewsPayload> => {
    const apiKey = process.env["GOOGLE_PLACES_API_KEY"];
    const placeId = process.env["GOOGLE_PLACE_ID"];
    if (!apiKey || !placeId) return EMPTY;

    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=pt-BR`,
        {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "rating,userRatingCount,googleMapsUri,reviews.rating,reviews.text,reviews.relativePublishTimeDescription,reviews.authorAttribution",
          },
        },
      );
      if (!res.ok) return EMPTY;
      const data = (await res.json()) as any;

      const reviews: GoogleReview[] = (data.reviews ?? [])
        .map((r: any) => ({
          author: r.authorAttribution?.displayName ?? "Cliente Google",
          rating: r.rating ?? 5,
          text: r.text?.text ?? "",
          relativeTime: r.relativePublishTimeDescription ?? "",
          profilePhoto: r.authorAttribution?.photoUri,
          url: r.authorAttribution?.uri,
        }))
        .filter((r: GoogleReview) => r.text.trim().length > 0);

      return {
        configured: true,
        rating: data.rating ?? null,
        total: data.userRatingCount ?? null,
        mapsUrl: data.googleMapsUri ?? null,
        reviews,
      };
    } catch {
      return EMPTY;
    }
  },
);
