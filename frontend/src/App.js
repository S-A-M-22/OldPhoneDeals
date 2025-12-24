import './App.css';
import React, { useState, useEffect } from 'react';
import CheckOut from './CheckOut.js';
import WishList from './WishList.js';
import HomeView from './HomeView.js';
import SearchView from './SearchView.js';
import ItemView from './ItemView.js';
import LoginView from './LoginView.js';
import SignupView from './SignupView.js';
import VerifyEmailView from './VerifyEmailView.js';
import ResetPasswordView from './ResetPasswordView.js';
import ResetPasswordConfirmView from './ResetPasswordConfirmView.js';
import ProfileView from './ProfileView.js';
import AdminView from './AdminView.js';
import AdminLoginView from './AdminLoginView.js';

// Main App component for the frontend application
function App() {

  // State variables for phones, views, user, cart, wishlist, and pagination
  const [phones, setPhones] = useState([]);
  const [view, setView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [filterBrand, setFilterBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [soldOutSoon, setSoldOutSoon] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [cart, setCart] = useState({ items: [], totalQuantity: 0, totalPrice: 0 });
  const [wishlist, setWishlist] = useState({ items: [] });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Pagination state and calculations
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = phones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(phones.length / itemsPerPage);

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newSize) => {
    setItemsPerPage(Number(newSize));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handles initial route and authentication logic on mount
  useEffect(() => {
    const path = window.location.pathname;
    const search = window.location.search;
    const pathParts = path.split('/');
    const tokenFromPath = pathParts[pathParts.length - 1];
    const urlParams = new URLSearchParams(search);
    const tokenFromQuery = urlParams.get('token');

    // Handle admin route
    if (path === '/admin') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.role === 'admin') {
          setView('admin');
          return;
        }
      }
      setView('admin-login');
      return;
    }

    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);

      // Handle profile route
      if (path === '/profile') {
        setView('profile');
        return;
      }
    } else {
      // If no user data and trying to access protected routes, redirect to login
      if (path === '/profile') {
        setView('login');
        return;
      }
    }

    if (tokenFromQuery && path.includes('/verify-email')) {
      setView('verify-email');
    } else if (tokenFromPath && path.includes('/auth/reset-password/')) {
      setView('reset-password-confirm');
    } else if (path === '/item') {
      // Only set view to 'item' if we have a selectedPhone
      if (selectedPhone) {
        setView('item');
      } else {
        // If no selectedPhone, redirect to home
        setView('home');
        window.history.pushState({}, '', '/');
      }
    } else if (path === '/search') {
      setView('search');
    } else if (path === '/checkout') {
      setView('checkout');
    } else if (path === '/wishlist') {
      setView('wishlist');
    } else if (path === '/login') {
      setView('login');
    } else if (path === '/signup') {
      setView('signup');
    } else if (path === '/reset-password') {
      setView('reset-password');
    } else {
      setView('home');
      window.history.pushState({}, '', '/');
    }
  }, [selectedPhone]);

  // Fetches best-selling and sold-out soon products when returning to home view
  useEffect(() => {
    if (view === 'home') {
      fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/`)
        .then(res => res.json())
        .then(data => {
          setSoldOutSoon(data.soldOutSoon);
          setBestSellers(data.bestSellers);
        })
        .catch(error => console.error('Error fetching phone data:', error));
    }
  }, [view]); // Re-run effect when view changes

  // Fetches the cart data from backend
  const fetchCart = () => {
    fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/cart`, {
      method: 'GET',
      credentials: 'include' // Important to include cookies for auth
    })
    .then(res => {
      if (res.status === 401) {
        // If user is not authenticated, return empty cart
        setCart({ items: [], totalQuantity: 0, totalPrice: 0 });
        return;
      }
      return res.json();
    })
    .then(data => {
      if (data) setCart(data);
    })
    .catch(error => {
      console.log('Error in fetching cart', error);
      // On error, set empty cart
      setCart({ items: [], totalQuantity: 0, totalPrice: 0 });
    });
  };

  // Resets the cart to empty
  const resetCart = () => {
    if (cart.items.length > 0){
      cart.items.forEach(phone => {
        removeFromCart(phone.listingId);
      });
    }
    setCart({ items: [], totalQuantity: 0, totalPrice: 0 })
    
  }

  // Handles adding an item to the cart
  const [pendingCartItem, setPendingCartItem] = useState(null);

  const addToCart = (productID, quantity) => {
    if (!user) {
      // Store the item to be added after login
      setPendingCartItem({ productID, quantity });
      // Store current view to return to after login
      setPreviousView(view);
      // Show login page
      changeView('login');
      return;
    }

    fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({listingId: productID, quantity})
    })
    .then(res => res.json())
    .then(() => fetchCart())
    .catch(err => console.error('Error adding to cart:', err));
  };

  // Handles updating the cart data
  const updateCart = (productID, quantity) => {
    fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ listingId: productID, quantity })
    })
    .then(res => res.json())
    .then(() => fetchCart())
    .catch(err => console.error('Error adding to cart:', err));

    
  }

  // Handles removing an item from the cart
  const removeFromCart = (productID) => {
    fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/cart`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ listingId: productID })
    })
    .then(res => res.json())
    .then(() => fetchCart())
    .catch(err => console.error('Error adding to cart:', err));
    
  }

  // Fetches the wishlist data from backend
  const fetchWishlist = () => {
    fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/wishlist`, {
      method: 'GET',
      credentials: 'include' // Important to include cookies for auth
    })
    .then(res => res.json())
    .then(data => setWishlist({ items: data.items }))
    .catch(error => console.log('Error in fetching cart', error));
  };

   // Handles adding an item to the wishlist
  const addToWishlist = async (productID) => {
    try {
      const res = await fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/wishlist/${productID}`, {
        method: 'POST',
        credentials: 'include', // includes cookies for authentication
      });

      const data = await res.json();
      if (res.status === 401 || res.status === 403 || data.message?.toLowerCase().includes('no token') || data.message?.toLowerCase().includes('access denied')) {
        alert('You must be logged in to add items to your wishlist.');
        return;
      }
      fetchWishlist(); // Refresh the wishlist in UI
      return data.message;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };


  // Handles removing an item from the wishlist
  const removeFromWishlist = (productID) => {
    fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/wishlist/${productID}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ items: productID })
    })
    .then(res => res.json())
    .then(() => fetchWishlist())
    .catch(err => console.error('Error adding to cart:', err));
    
  }

  // Handles user login and logout logic
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    fetchWishlist();
    fetchCart();
    
    // If there was a pending cart item, add it now
    if (pendingCartItem) {
      const { productID, quantity } = pendingCartItem;
      fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({listingId: productID, quantity})
      })
      .then(res => res.json())
      .then(() => {
        fetchCart();
        setPendingCartItem(null);
        // Return to the previous view
        setView(previousView);
      })
      .catch(err => console.error('Error adding to cart:', err));
    } else {
      setView('home');
    }
  };

  const handleSignupSuccess = () => {
    setView('login');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // Call the logout endpoint
      fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      .then(() => {
        localStorage.removeItem('user');
        setUser(null);
        setView('home');
      })
      .catch(err => {
        console.error('Error during logout:', err);
        // Still clear local state even if the API call fails
        localStorage.removeItem('user');
        setUser(null);
        setView('home');
      });
    }
  };

  // Handles selecting a phone to view its details
  const selectPhone = (phone) => {
    fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/listings/${phone._id}`)
    .then(res => res.json())
    .then(fullPhone => {
      const reviews = fullPhone.reviews || [];
      const rating = reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;
      setSelectedPhone({ ...fullPhone, reviews, rating });
    })
    setPreviousView(view); // Store current view before changing to item view
    setView('item');
  };

  // Handles filtering and searching for phones
  const filterPhones = () => {
    const queryParams = new URLSearchParams({
      q: searchQuery || '',
      brand: filterBrand || '',
      maxPrice,
      sortBy: 'price',
      sortOrder: 'asc'
    });
  
    fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/listings/searchListings?${queryParams.toString()}`)
      .then(res => res.json())
      .then((data) => {
        setPhones(data.listings || []);
      })
      .catch(err => console.error("Search fetch failed", err));
      setView('search');
  };

  // Navigation helper functions for changing views
  const BackToHome = () => {
    setView('home');
  }

  const BackToSearch = () => {
    setView('search');
  }

  const BackToCheckOut = () => {
    setView('checkout');
  }

  const BackToWishlist = () => {
    setView('wishlist');
  }

  const handleBack = () => {
    setView(previousView);
  }

  // Handles changing the current view and updates the URL
  const changeView = (newView) => {
    if (newView === 'login') {
      setPreviousView(view);
    }
    setView(newView);
    // Update URL based on the new view
    if (newView === 'admin-login') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', `/${newView}`);
    }
  };

  // Adds event listener for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1); // Remove leading slash
      if (path) {
        setView(path);
      } else {
        setView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sets initial URL on component mount
  useEffect(() => {
    if (view !== 'home') {
      window.history.pushState({}, '', `/${view}`);
    }
  }, [view]);

  // Loads all results by default when entering the search view
  useEffect(() => {
    if (view === 'search') {
      filterPhones();
    }
    // eslint-disable-next-line
  }, [view]);

  // Renders the main app UI and routes
  return (
    <div className="App">
      <div className="App-header">
        <img src={`http://localhost:${process.env.REACT_APP_API_PORT}/images/brandLogo-2.png`} className="brand-logo" alt="logo" />
        {user && (
          <div className="user-info">
            <div className="welcome-message">Welcome, {user.firstname} {user.lastname}</div>
            <button onClick={() => changeView('profile')} className="profile-btn">Profile</button>
            
            {user.role === 'admin' && (
              <button onClick={() => changeView('admin')} className="admin-btn">Admin</button>
            )}
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </div>
      <hr />

      {view === 'verify-email' && (
        <VerifyEmailView onVerificationComplete={() => changeView('login')}/>
      )}

      {view === 'login' && (
        <LoginView 
          onLoginSuccess={handleLoginSuccess}
          onSignupClick={() => changeView('signup')}
          onResetPasswordClick={() => changeView('reset-password')}
          onBackToHome={(view) => changeView(view)}
          previousView={previousView}
        />
      )}

      {view === 'signup' && (
        <SignupView 
          onSignupSuccess={handleSignupSuccess}
          onLoginClick={() => changeView('login')}
          onBackToHome={() => changeView('home')}
        />
      )}

      {view === 'reset-password' && (
        <ResetPasswordView 
          onBackToLogin={() => changeView('login')}
          onBackToHome={() => changeView('home')}
        />
      )}

      {view === 'reset-password-confirm' && (
        <ResetPasswordConfirmView 
          onBackToLogin={() => changeView('login')}
          onBackToHome={() => changeView('home')}
        />
      )}

      {view === 'profile' && (
        <ProfileView 
          onLogout={handleLogout}
          onUserUpdate={setUser}
          onBackToHome={() => changeView('home')}
        />
      )}

      {view === 'home' && (
        <HomeView soldOut={soldOutSoon} bestSeller={bestSellers} 
        selectPhone={selectPhone} handleSearch={filterPhones}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} BackToWishlist = {BackToWishlist}
        BackToSearch={BackToSearch} BackToCheckOut={BackToCheckOut} 
        user={user} onLoginClick={() => changeView('login')}/>
      )}

      {view === 'search' && (
        <SearchView 
        phones={currentItems} 
        totalPhones={phones}
        selectPhone={selectPhone} 
        handleSearch={filterPhones} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        filterBrand={filterBrand} 
        setFilterBrand={setFilterBrand} 
        maxPrice={maxPrice} 
        setMaxPrice={setMaxPrice} 
        BackToWishlist={BackToWishlist}
        BackToCheckOut={BackToCheckOut} 
        BackToHome={BackToHome} 
        user={user} 
        onLoginClick={() => changeView('login')}
        // Pagination props
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {view === 'item' && selectedPhone && (
        <ItemView selectedPhone={selectedPhone} setSearchQuery={setSearchQuery} 
        handleSearch={BackToSearch} addToCart={addToCart} BackToWishlist={BackToWishlist}
        BackToHome={BackToHome} BackToCheckOut={BackToCheckOut} addToWishlist={addToWishlist} 
        user={user} onLoginClick={() => changeView('login')} onBack={handleBack}/>
      )}

      {view === 'checkout' && (
        <CheckOut cart={cart} updateCart={updateCart} resetCart={resetCart}
        removeFromCart={removeFromCart} BackToSearch={BackToSearch} 
        BackToHome={BackToHome} user={user}/>      
      )}

      {view === 'wishlist' && (
        <WishList wishlist={wishlist} addToCart={addToCart} updateCart={updateCart}
        removeFromWishlist={removeFromWishlist} BackToCheckOut={BackToCheckOut} 
        BackToSearch={BackToSearch} BackToHome={BackToHome}/>
      )}

      {view === 'admin-login' && (
        <AdminLoginView onLoginSuccess={handleLoginSuccess}  onBackToHome={() => changeView('home')}/>
      )}

      {view === 'admin' && user?.role === 'admin' && (
        <AdminView onBackToHome={() => changeView('home')}/>
      )}
    </div>
  );

}

export default App;
