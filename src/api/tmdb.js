const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_KEY;

export const CATEGORIES = [
  { id: "popular", label: "Popular" },
  { id: "top_rated", label: "Top rated" },
  { id: "upcoming", label: "Upcoming" },
];

const request = async (path, params = {}, signal) => {
  if (!API_KEY) {
    throw new Error(
      "Missing TMDB API key. Add VITE_TMDB_KEY to your .env file and restart npm run dev."
    );
  }

  const query = new URLSearchParams({ api_key: API_KEY, language: "en-US", ...params });
  const response = await fetch(`${BASE_URL}${path}?${query}`, { signal });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}). Please try again.`);
  }
  return response.json();
};

export const fetchGenres = async (signal) => {
  const data = await request("/genre/movie/list", {}, signal);
  return data.genres;
};

// The /popular, /top_rated and /upcoming endpoints can't filter by genre,
// so when a genre is chosen we use /discover with matching sort rules.
const discoverParams = (category) => {
  switch (category) {
    case "top_rated":
      return { sort_by: "vote_average.desc", "vote_count.gte": 300 };
    case "upcoming": {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      return { sort_by: "primary_release_date.asc", "primary_release_date.gte": tomorrow };
    }
    default:
      return { sort_by: "popularity.desc" };
  }
};

export const fetchMovies = ({ category, genreId, query, page }, signal) => {
  if (query) {
    return request("/search/movie", { query, page, include_adult: false }, signal);
  }

  if (genreId) {
    return request(
      "/discover/movie",
      { ...discoverParams(category), with_genres: genreId, page, include_adult: false },
      signal
    );
  }

  return request(`/movie/${category}`, { page }, signal);
};
