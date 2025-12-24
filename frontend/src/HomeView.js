import './HomeView.css';
import React from 'react';
// import cart from './backend/public/images/shopping_cart.png';

// HomeView component for displaying the homepage with best sellers and sold out soon phones
function HomeView({ soldOut, bestSeller, selectPhone, handleSearch, searchQuery, setSearchQuery, BackToWishlist, BackToCheckOut, user, onLoginClick }) {
  // Phones - best sellers
  const bestSellers = bestSeller;

  // Phones - sold out soon
  const soldOutSoon = soldOut;

  // Helper function to format title from image path
  const formatTitle = (imagePath) => {
    const title = imagePath.replace("/images/", "").replace(".jpeg", "");
    return title.length > 48 ? title.slice(0, 45) + '...' : title;
  };

  // Renders the homepage UI with search, best sellers, and sold out soon sections
  return (
    <>
      <div className="topBar">
        <div className="search">
          <input
            type="text"
            placeholder="Search Phone"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" onClick={handleSearch}>Search</button>
        </div>
        <div className="checkOut">
          <button className="checkOutBtn" type="submit" onClick={BackToCheckOut}>
            Checkout
            <img src={`http://localhost:${process.env.REACT_APP_API_PORT}/images/shopping_cart.png`} alt="checkOut" />
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
        <h2>BEST SELLERS!</h2>
        <hr/>
        <ol className="bestPhones">
          {bestSellers.map(phone => (
            <li key={phone._id} onClick={() => selectPhone(phone)}>
              <img src={`http://localhost:${process.env.REACT_APP_API_PORT}${phone.image}`} alt={phone.title} className="image"/>
              <h3>{phone.title}</h3>
              <p className="brand">{phone.brand}</p>
              <p className="price"><i>${phone.price.toFixed(2)}</i></p>
              <p className="rating">
                <i>{phone.avgRate.toFixed(2)}</i>
                <img src={`http://localhost:${process.env.REACT_APP_API_PORT}/images/star-16.ico`} alt="rate_star" className="star" />
              </p>
            </li>
          ))}
        </ol>
      </div>
      <hr/>
      <div className="SoldOutSoon">
        <h2>SOLD OUT SOON!</h2>
        <hr/>
        <ol className="soldSoonPhones">
          {soldOutSoon.map(phone => (
            <li key={phone._id} onClick={() => selectPhone(phone)}>
              <img src={`http://localhost:${process.env.REACT_APP_API_PORT}${phone.image}`} alt={phone.title} className="image"/>
              <h3>{phone.title}</h3>
              <p className="brand">{phone.brand}</p>
              <p className="price"><i>${phone.price.toFixed(2)}</i></p>
              <p className="stock">Only {phone.stock} left!</p>
            </li>
          ))}
        </ol>
      </div>
      <hr />
    </>
  );
}

export default HomeView;
