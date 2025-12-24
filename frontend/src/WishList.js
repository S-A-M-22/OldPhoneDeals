import './WishList.css';

// WishList component for displaying and managing the user's wishlist
function WishList({wishlist, addToCart, updateCart, removeFromWishlist, BackToCheckOut, BackToSearch, BackToHome}) {

    // Renders the wishlist table and actions
    return (
        <div className="List">
            <div className="list-results">
                <>
                    <hr/>
                    <table className="list-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wishlist.items.length > 0 ? (
                                wishlist.items.map((phone) => (
                                <tr key={phone.listingId}>
                                    <td>
                                        <img src={`http://localhost:${process.env.REACT_APP_API_PORT}${phone.image}`}
                                            alt={phone.title} className="displayPic"/>
                                    </td>
                                    <td>{phone.title}</td>
                                    <td>${phone.price.toFixed(2)}</td>
                                    <td>
                                        <button className="removeBtn"
                                            type="button" onClick={() => removeFromWishlist(phone.listingId)}
                                        >Remove?</button>

                                        <button className="addBtn" type="button" 
                                            onClick={() => {
                                                const input = prompt(`Enter quantity of the product between 1 to ${phone.stock} to add to cart!`);
                                                const quantity = Number(input);
                                                if (quantity > 0 && quantity <= phone.stock) {
                                                    addToCart(phone.listingId, quantity);
                                                    updateCart(phone.listingId, quantity);
                                                    removeFromWishlist(phone.listingId);
                                                } else {
                                                    alert(`Invalid quantity entered. ${phone.stock} left in stock!`);
                                                }
                                            }}
                                        >Add to Cart?</button>
                                    </td>
                                </tr>
                                ))
                            ) : (
                                <>
                                    <td></td>
                                    <td></td>
                                    <td>
                                        <h4>Empty Wishlist</h4>
                                    </td>
                                </>
                            )}
                            </tbody>

                    </table>
                    <hr/>
                    <div className="checkout-summary">
                        <button className="cartBtn" onClick={BackToCheckOut}>Go to Cart?</button>
                        <button className="backBtn" onClick={BackToSearch}>Back</button>
                        <button className="homeBtn" onClick={BackToHome}>Home</button>
                    </div>
                    <hr/>
                </>

            </div>
            
        </div>
    );
}

export default WishList;