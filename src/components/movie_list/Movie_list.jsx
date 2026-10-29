import React, { useEffect, useMemo, useState } from 'react';

import './Movie_list.css';
import Movie_card from './Movie_card';
import FilterGroup from './FilterGroup';
import useDebounce from '../../hooks/useDebounce';
import { CATEGORIES, fetchGenres, fetchMovies } from '../../api/tmdb';

const mergeUnique = (existing, incoming) => {
    const seen = new Set(existing.map(movie => movie.id));
    return [...existing, ...incoming.filter(movie => !seen.has(movie.id))];
};

const Movie_list = ({ category, searchQuery }) => {
    const [genres, setGenres] = useState([]);
    const [genreId, setGenreId] = useState("");
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    // Wait until the user stops typing before hitting the API.
    const query = useDebounce(searchQuery.trim(), 400);

    // Pagination resets to page 1 whenever the category, genre or search changes.
    const filterKey = `${category}|${genreId}|${query}`;
    const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
    const page = pageState.key === filterKey ? pageState.page : 1;
    const requestKey = `${filterKey}|${page}`;

    const [result, setResult] = useState({
        key: null,
        movies: [],
        totalPages: 1,
        error: "",
    });
    const loading = result.key !== requestKey;

    // Genre list for the dropdown
    useEffect(() => {
        const controller = new AbortController();
        fetchGenres(controller.signal)
            .then(setGenres)
            .catch(error => {
                if (error.name !== "AbortError") console.error(error);
            });
        return () => controller.abort();
    }, []);

    // Movies
    useEffect(() => {
        const controller = new AbortController();

        fetchMovies({ category, genreId, query, page }, controller.signal)
            .then(data => {
                setResult(previous => ({
                    key: requestKey,
                    movies: page === 1 ? data.results : mergeUnique(previous.movies, data.results),
                    totalPages: data.total_pages,
                    error: "",
                }));
            })
            .catch(error => {
                if (error.name === "AbortError") return;
                setResult(previous => ({
                    key: requestKey,
                    movies: page === 1 ? [] : previous.movies,
                    totalPages: 1,
                    error: error.message,
                }));
            });

        return () => controller.abort();
    }, [category, genreId, query, page, requestKey]);

    const handleFilter = rate => {
        setMinRating(rate === minRating ? 0 : rate);
    };

    const visibleMovies = useMemo(() => {
        let list = result.movies.filter(movie => movie.vote_average >= minRating);

        // Search results can't be filtered by genre on the server, so do it here.
        if (query && genreId) {
            list = list.filter(movie => movie.genre_ids?.includes(Number(genreId)));
        }

        if (sortBy) {
            const direction = sortOrder === "asc" ? 1 : -1;
            list = [...list].sort((a, b) => {
                if (sortBy === "rating") {
                    return (a.vote_average - b.vote_average) * direction;
                }
                return (a.release_date || "").localeCompare(b.release_date || "") * direction;
            });
        }

        return list;
    }, [result.movies, minRating, query, genreId, sortBy, sortOrder]);

    const categoryLabel = CATEGORIES.find(item => item.id === category)?.label;
    const genreName = genres.find(genre => String(genre.id) === genreId)?.name;
    const heading = query
        ? `Results for “${query}”${genreName ? ` in ${genreName}` : ""}`
        : `${categoryLabel}${genreName ? ` ${genreName}` : ""} Movies`;

    const showEmpty = !loading && !result.error && visibleMovies.length === 0;
    const canLoadMore = !loading && !result.error && page < result.totalPages;

    return (
        <section className="movie_list">
            <header className="align_center movie_list_header">
                <h2 className="align_center movie_list_heading">{heading}</h2>

                <div className="align_center movie_list_fs">

                    <FilterGroup
                        minRating={minRating}
                        onRatingClick={handleFilter}
                        ratings={[8, 7, 6]} />

                    <select
                        aria-label="Filter by genre"
                        className="movie_sorting"
                        value={genreId}
                        onChange={e => setGenreId(e.target.value)}
                    >
                        <option value="">All genres</option>
                        {genres.map(genre => (
                            <option key={genre.id} value={genre.id}>{genre.name}</option>
                        ))}
                    </select>

                    <select
                        aria-label="Sort by"
                        className="movie_sorting"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="">Sort By</option>
                        <option value="date">Date</option>
                        <option value="rating">Rating</option>
                    </select>

                    <select
                        aria-label="Sort order"
                        className="movie_sorting"
                        value={sortOrder}
                        disabled={!sortBy}
                        onChange={e => setSortOrder(e.target.value)}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
            </header>

            {result.error && <p className="movie_status movie_error">{result.error}</p>}

            <div
                className={loading && page === 1 ? "movie_cards movie_cards_loading" : "movie_cards"}
                aria-busy={loading}
            >
                {visibleMovies.map(movie => (
                    <Movie_card key={movie.id} movie={movie} />
                ))}
            </div>

            {loading && <p className="movie_status">Loading...</p>}
            {showEmpty && (
                <p className="movie_status">
                    No movies found. Try a different search or loosen your filters.
                </p>
            )}

            {canLoadMore && (
                <div className="movie_load_more">
                    <button
                        type="button"
                        className="movie_load_more_button"
                        onClick={() => setPageState({ key: filterKey, page: page + 1 })}
                    >
                        Load more
                    </button>
                </div>
            )}
        </section>
    );
};

export default Movie_list;
