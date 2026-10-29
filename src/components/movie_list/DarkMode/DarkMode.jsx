import React, { useEffect, useState } from "react";

import "./DarkMode.css";

const getInitialTheme = () =>
    localStorage.getItem("selectedTheme") === "light" ? "light" : "dark";

const DarkMode = () => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("selectedTheme", theme);
    }, [theme]);

    return (
        <div className='dark_mode'>
            <input
                className='dark_mode_input'
                type='checkbox'
                id='darkmode-toggle'
                checked={theme === "dark"}
                onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
            />
            <label
                className='dark_mode_label'
                htmlFor='darkmode-toggle'
                aria-label='Toggle dark mode'
            ></label>
        </div>
    );
};

export default DarkMode;
