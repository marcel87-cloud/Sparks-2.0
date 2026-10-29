import React, { useState } from 'react';

import './App.css';
import Navbar from './components/navbar/Navbar';
import Movie_list from './components/movie_list/Movie_list';

const App = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("popular");

    // Picking a category tab leaves search mode.
    const handleCategoryChange = (id) => {
        setCategory(id);
        setSearchQuery("");
    };

    return (
        <div className = 'app'>
            <Navbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                category={category}
                onCategoryChange={handleCategoryChange}
            />

            <Movie_list category={category} searchQuery={searchQuery} />
        </div>
    )
}

export default App;
