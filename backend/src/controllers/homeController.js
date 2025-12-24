// File: backend/src/controllers/cartController.js

import Listing from '../models/Listing.js';

export async function getHomeListings(req, res) {
    try {
        const sosFind = {
            stock: {$gt: 0},
            disabled: {$ne :true}
        };

        const sosSort = {
            stock: 1
        };

        const sosLimit = 5;
        const sosSelect = '_id image price title brand stock'

        const soldOutSoon = await Listing.find(sosFind)
                                        .sort(sosSort)
                                        .limit(sosLimit)
                                        .select(sosSelect);

        const bsAggregate = [
            {$match: {disabled: {$ne: true}}},
            {$project: {
                image: 1,
                price: 1,
                title: 1,
                brand: 1,
                reviews: 1,
                avgRate: {$avg: "$reviews.rating"}, //look inside the ratings field for each item of reviews
                ratings: {$size: "$reviews"} //show number of ratings so aggregate can filter out those with < 2
            }},
            {$match: {ratings: {$gte: 2}}}, //match and sort by the projected values
            {$sort: {avgRate: -1}},
            {$limit: 5},
            {$project: {_id:1, image: 1, price: 1, title: 1, brand: 1, avgRate: 1}} //project these as the final output
        ];

        const bestSellers = await Listing.aggregate(bsAggregate);

        res.json({soldOutSoon, bestSellers});
                                        
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to load home listings.' });
    }
}

export function logoutUser(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,     
    sameSite: 'strict',
    path: '/' 
  });
  console.log("asdasd");
  res.status(200).json({ message: 'Logged out successfully' });
}
