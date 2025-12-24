import Notification from '../models/Notification.js';


export async function getNotifications(req, res) {
  try {
    const { since, limit = 30 } = req.query;
    //if since exists, change the query to notifs newer than the last one seen
    //else query everything
    let query = {};                

    if (since) {                   
        query = {
            createdAt: { $gt: new Date(since) }
        };
    }

    const notifications = await Notification
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit);

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
}