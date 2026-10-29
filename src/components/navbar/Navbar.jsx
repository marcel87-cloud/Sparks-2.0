import React from 'react'

import './Navbar.css';
import DarkMode from "../movie_list/DarkMode/DarkMode.jsx";
import { CATEGORIES } from "../../api/tmdb";

const Navbar = ({ searchQuery, onSearchChange, category, onCategoryChange }) => {
  return (
    <div className="Navbar">
      <h1>Sparks</h1>
      <DarkMode />

      <input
        type="search"
        className="Navbar_search"
        placeholder="Search movies..."
        aria-label="Search movies"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className="Navbar_links">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              !searchQuery && category === item.id
                ? "Navbar_link active"
                : "Navbar_link"
            }
            onClick={() => onCategoryChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Navbar;
