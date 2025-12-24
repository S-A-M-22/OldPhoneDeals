import CheckoutLog from '../models/CheckoutLog.js';
import { Parser } from 'json2csv'; 

export async function getCheckoutLogs(req, res) {
  try {
    const {page = 1, limit = 10} = req.query;

    const parsePage = parseInt(page, 10);
    const parseLimit = parseInt(limit, 10);
    const skip = (parsePage - 1) * parseLimit;

    //populate to get the actual Users and project the relevant fields, sort by newest first                            
    const [totalLogs, logs] = await Promise.all([
      CheckoutLog.countDocuments(),
      CheckoutLog.find()
      .populate('user', 'firstname lastname')               
      .populate('items.listing', 'title brand')              
      .sort({ timestamp: -1 })
    ]);
    
    const totalPages = Math.ceil(totalLogs / parseLimit);

    return res.json({
      logs,
      pagination: {
        totalLogs,
        totalPages,
        currentPage: parsePage,
        pageSize: parseLimit
      }
    });
  } catch (err) {
    console.error('Error fetching checkout logs:', err);
    res.status(500).json({ message: 'Failed to fetch checkout logs' });
  }
}

export async function exportCheckoutLogsCSV(req, res) {
  try {
    const logs = await CheckoutLog.find()
      .populate('user', 'firstname lastname')
      .populate('items.listing', 'title')
      .lean();

    const csvData = [];

    logs.forEach(log => {
      log.items.forEach(item => {
        csvData.push({
          timestamp: log.timestamp.toISOString(),
          buyerName: `${log.user.firstname} ${log.user.lastname}`,
          itemTitle: item.listing.title,
          quantity: item.quantity,
          price: item.price,
          total: log.total,
        });
      });
    });

    // Define fields for CSV columns
    const fields = ['timestamp', 'buyerName', 'itemTitle', 'quantity', 'price', 'total'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    // Set headers for file download
    res.header('Content-Type', 'text/csv');
    res.attachment('checkout_logs.csv');
    return res.send(csv);

  } catch (error) {
    console.error('Failed to export checkout logs CSV:', error);
    return res.status(500).json({ message: 'Failed to export checkout logs.' });
  }
}
