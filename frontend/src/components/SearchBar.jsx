import React, { useState, useCallback } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, placeholder = "Search by name or ID..." }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  }, [onSearch]);

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleChange}
          className="search-input"
        />
        {searchQuery && (
          <button onClick={handleClear} className="clear-btn" title="Clear search">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
