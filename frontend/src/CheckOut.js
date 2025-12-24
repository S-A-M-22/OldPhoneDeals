import './CheckOut.css';
import { useState, useEffect } from 'react';

// CheckOut component for handling the shopping cart and checkout process
function CheckOut({cart= { items: [], totalQuantity: 0, totalPrice: 0 }, updateCart, removeFromCart, resetCart, BackToSearch, BackToHome, user}) {
    // State to track if the user is authenticated
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    // Checks user authentication status on mount
    useEffect(() => {
        // Check if user is authenticated
        fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/auth/check`, {
            credentials: 'include'
        })
        .then(res => {
            setIsAuthenticated(res.ok);
        })
        .catch(() => {
            setIsAuthenticated(false);
        });
    }, []);

    // Handles confirming and placing the order
    const ConfirmTransaction = () => {
        if (!user) {
            alert('Please log in to complete your purchase');
            return;
        }

        fetch(`http://localhost:${process.env.REACT_APP_API_PORT}/orders/checkout`, {
          method: 'POST',
          credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
          if (data.message === 'Order placed successfully.') {
            alert(data.message);
            resetCart();
            BackToHome();
          } else {
            alert(data.message || 'Unexpected response');
          }
        })
        .catch(err => {
          alert('Failed to place order. Try again later.');
        });
    };

    // Handles changing the quantity of an item in the cart
    const quantityChange = (productId, newQty, stock) => {
        if (newQty > 0 && newQty <= stock) {
            updateCart(productId, newQty);
        } 
        else if (newQty <= 0){
            if(window.confirm('Want to remove item?')){
                removeFromCart(productId);
            }
            
        }
    
      };

    // Renders the checkout UI and cart table
    return (
        <div className="checkOut">
            {/* <div className="header">
                <h2>CART</h2>
            </div>
            <hr/> */}
            <div className="cart-results">
                <>
                    <hr/>
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.items.length > 0 ? 
                                (cart.items.map(phone => (
                                    <tr key={phone.listingId}>
                                        <td>
                                            <img src={`http://localhost:${process.env.REACT_APP_API_PORT}${phone.image}`} alt={phone.title} className='displayPic'/>
                                        </td>
                                        <td>{phone.title}</td>
                                        <td>${phone.price.toFixed(2)}</td>
                                        <td>
                                            <input type="number" value={phone.quantity} min="0" max={phone.stock}
                                                onChange={(e) =>
                                                    {   if (e.target.value >= 0 && e.target.value <= phone.stock) {
                                                            quantityChange(phone.listingId, Number(e.target.value), phone.stock);
                                                            
                                                        }
                                                        else {
                                                            alert("Invalid quantity entered. Only " + phone.stock + " left in stock! Please try again.");
                                                        } 
                                                    }
                                                }/>
                                        </td>
                                        <td>Subtotal: ${phone.subtotal.toFixed(2)}</td>
                                        <td>
                                            <button className="removeBtn" type="submit" onClick={() => removeFromCart(phone.listingId)}>Remove</button>
                                        </td>
                                    </tr>
                                ))) : (
                                    <>
                                        <td> </td>
                                        <td> </td>
                                        <td> </td>
                                        <h4>Empty Cart</h4>
                                    </>
                                    
                                )
                            }
                        </tbody>
                    </table>
                    <hr/>
                    <div className="checkout-summary">
                        <h5>Total: ${cart.totalPrice.toFixed(2)}</h5>
                        {!user && (
                            <div style={{color: 'red', marginBottom: '1rem'}}>
                                Please log in to complete your purchase
                            </div>
                        )}
                        <button 
                            className="orderBtn" 
                            onClick={ConfirmTransaction}
                            disabled={!user || cart.items.length === 0}
                            style={{opacity: (!user || cart.items.length === 0) ? 0.5 : 1}}
                        >
                            Place Order
                        </button>
                        <button className="backBtn" onClick={BackToSearch}>Back</button>
                        <button className="homeBtn" onClick={BackToHome}>Home</button>
                    </div>
                    <hr/>
                </>

            </div>
            
        </div>
    );
}

export default CheckOut;