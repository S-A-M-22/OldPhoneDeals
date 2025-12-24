import './SearchView.css';
import React, { useEffect, useState } from 'react';

// SearchView component for searching, filtering, and paginating phone listings
function SearchView({
  phones, totalPhones, selectPhone, handleSearch, searchQuery, setSearchQuery,
  filterBrand, setFilterBrand, maxPrice, setMaxPrice, BackToWishlist, BackToHome, 
  BackToCheckOut, user, onLoginClick, currentPage, totalPages, itemsPerPage,
  onPageChange, onItemsPerPageChange
}) {

    // State for all brands and the maximum possible price
    const [allBrands, setAllBrands] = useState([]);
    const [maxPossiblePrice, setMaxPossiblePrice] = useState(1000);

    // On mount, fetch all listings to determine the max price and all brands
    useEffect(() => {
      fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/listings/searchListings`)
        .then(res => res.json())
        .then(data => {
          if (data.listings && data.listings.length > 0) {
            const maxPriceFound = Math.max(...data.listings.map(phone => phone.price));
            const roundedMax = Math.ceil(maxPriceFound / 100) * 100 + 100; // next $100 above max
            setMaxPossiblePrice(roundedMax);
            setMaxPrice(roundedMax);
          }
        });
      // Fetch all brands independently of search results
      fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/listings/brands`)
        .then(res => res.json())
        .then(data => {
          if (data.brands) {
            setAllBrands(data.brands);
          }
        })
        .catch(err => {
          console.error("Failed to fetch brands:", err);
        });
    }, []); // Only run once on mount

    return (
      <>
        <div className="topBar">
          <button onClick={() => {
            window.history.pushState({}, '', '/');
            BackToHome();
          }} className='home'>Home</button>
          <div className="search">
            <input type="text" placeholder="Search Phone" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            <button type="submit" onClick={handleSearch}> Search </button>
          </div>
          <div className="filter">
            <select id="brand" name="Brand" value={filterBrand} 
              onChange={(e) => {setFilterBrand(e.target.value); handleSearch();}}>
              <option value="">All</option>
              {allBrands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <div className="priceRange">
              <label htmlFor="priceRange">Price Range (0 - ${maxPossiblePrice}): </label>
              <input type="range" id="priceRange" name="priceRange" 
                min="0" max={maxPossiblePrice} value={maxPrice} step="50"
                onChange={(e) => setMaxPrice(Number(e.target.value))}/>
              <input 
                type="number" 
                value={maxPrice}
                onChange={(e) => {
                  const value = Math.min(Math.max(0, Number(e.target.value)), maxPossiblePrice);
                  setMaxPrice(value);
                }}
                min="0"
                max={maxPossiblePrice}
                step="50"
                className="price-input"
              />
            </div>
            <button type="submit" onClick={handleSearch}>Apply</button>
          </div>
          <div className="checkOut">
            <button className="checkOutBtn" type="submit" onClick={BackToCheckOut}>
              Checkout<img src={`http://localhost:${process.env.REACT_APP_API_PORT}/images/shopping_cart.png`} alt="checkOut" />
            </button>
            <img src={`http://localhost:${process.env.REACT_APP_API_PORT}/images/wishlist.png`} 
                alt="wishlist" className='wishlist' onClick={BackToWishlist}/>
          </div>
          <div className="login">
            {user ? (
              <span className="welcome-text">Welcome, {user.firstname}!</span>
            ) : (
              <button className="loginBtn" onClick={onLoginClick}>Sign Up/Login</button>
            )}
          </div>
          <img src={`http://localhost:${process.env.REACT_APP_API_PORT}/images/brandLogo-1.png`} className="logo" alt="logo" />
        </div>
        <hr />
        <div className="bestDeals">
          <h2>Search Results ({totalPhones?.length || 0} items found)</h2>
          <hr />
          <ol className="bestPhones">
            {phones?.length > 0 ? (
              phones.map((phone) => {
                const displayTitle = phone.title.length > 48 ? phone.title.slice(0, 45) + '...' : phone.title;
                return (
                  <li key={phone._id} onClick={() => selectPhone(phone)}>
                    <img src={`http://localhost:${process.env.REACT_APP_API_PORT}${phone.image}`} alt={phone.title} className="image" />
                    <h3>{displayTitle}</h3>
                    <p className="brand">{phone.brand}</p>
                    <p className="price"><i>${phone.price.toFixed(2)}</i></p>
                  </li>
                );
              })
            ) : (
              <>
                <br/>
                <br/>
                <h3>No matching results found!</h3>
                <br/>
                <br/>
                <br/>
                <br/>
              </>
            )}
          </ol>
          <hr/>
          
          {/* Pagination Controls */}
          <div className="pagination-controls">
            <div className="results-per-page">
              <label>Items per page:</label>
              <select 
                value={itemsPerPage} 
                onChange={(e) => onItemsPerPageChange(e.target.value)}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            
            <div className="page-navigation">
              <button 
                className="previousBtn" 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-count">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="nextBtn" 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </>
    );
}

export default SearchView;
