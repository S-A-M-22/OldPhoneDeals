import './ItemView.css';
import React, { useState } from 'react';

// ItemView component for displaying details of a selected phone and its reviews
function ItemView({ selectedPhone, setSearchQuery, handleSearch, addToCart, addToWishlist, BackToWishlist, BackToHome, BackToCheckOut, user, onLoginClick, onBack }) {
  // State for showing quantity dialog, selected quantity, and expanded comments
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [expandedComments, setExpandedComments] = useState({});

  // Handles adding the selected phone to the cart
  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= selectedPhone.stock) {
      addToCart(selectedPhone._id, quantity);
      setShowQuantityDialog(false);
      setQuantity(1); // Reset quantity for next time
    } else {
      alert("Invalid quantity entered. Only " + selectedPhone.stock + " left in stock! Please try again.");
    }
  };

  // Toggles the expanded/collapsed state of a review comment
  const toggleComment = (index) => {
    setExpandedComments(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Truncates long comments and provides show more/less functionality
  const truncateComment = (comment, index) => {
    if (comment.length <= 200) return comment;
    
    return (
      <>
        {expandedComments[index] ? (
          <>
            {comment}
            <button className="show-more-btn" onClick={() => toggleComment(index)}>Show less</button>
          </>
        ) : (
          <>
            {comment.substring(0, 200)}...
            <button className="show-more-btn" onClick={() => toggleComment(index)}>Show more</button>
          </>
        )}
      </>
    );
  };

  // Renders the item details, reviews, and quantity dialog
  return (
    <>
      <div className="topBar">
        <button onClick={onBack} className='back'>Back</button>
        <button onClick={BackToHome} className='home'>Home</button>
        <div className="search">
          <input
            type="text"
            placeholder="Search Phone"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" onClick={handleSearch}>Search</button>
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
        <div>
          <img src={`http://localhost:${process.env.REACT_APP_API_PORT}/images/brandLogo-1.png`} className='logo' alt="logo" />
        </div>
      </div>
      <hr />

      <div key={selectedPhone.id} className="phoneDetails">
        <div className="itemImg">
          <img src={`http://localhost:${process.env.REACT_APP_API_PORT}${selectedPhone.image}`} alt={selectedPhone.title} className="image" />
        </div>
        <h2>{selectedPhone.brand}</h2>
        <h5><i>{selectedPhone.title}</i></h5>
        <h5><i>${selectedPhone.price.toFixed(2)}</i></h5>
        <h5>{selectedPhone.rating.toFixed(2)}<img src={`http://localhost:${process.env.REACT_APP_API_PORT}/images/star-16.ico`} alt="rate_star" className="star" /></h5>
        <h5><b>In Stock</b> {selectedPhone.stock}</h5>
        <button type='submit' onClick={() => setShowQuantityDialog(true)}>Add to Cart</button>
        <button className='listBtn' type='submit' onClick={async () => {
          const msg = await addToWishlist(selectedPhone._id);
          alert(msg);
        }}
          >Add to Wishlist?</button>
        <h5><i>Seller: {selectedPhone.seller}</i></h5>
        <h5><i>Reviews:</i></h5>
        <ul>
          {selectedPhone.reviews
            .filter(review => !review.hidden)
            .slice(0, 3) // Show only first 3 visible reviews
            .map((review, index) => (
                <li key={index}>
                  <p><b>Reviewer: {review.reviewer}</b></p>
                  <p className="review-comment">
                    {truncateComment(review.comment, index)}
                  </p>
                  <p>Rating: {review.rating}</p>
                </li>
            ))}
        </ul>
      </div>

      {/* Quantity Dialog */}
      {showQuantityDialog && (
        <div className="quantity-dialog-overlay">
          <div className="quantity-dialog">
            <h3>Select Quantity</h3>
            <p>Available in stock: {selectedPhone.stock}</p>
            <input
              type="number"
              min="1"
              max={selectedPhone.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <div className="dialog-buttons">
              <button onClick={handleAddToCart}>Add to Cart</button>
              <button onClick={() => {
                setShowQuantityDialog(false);
                setQuantity(1);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ItemView;
