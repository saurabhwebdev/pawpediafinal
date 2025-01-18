import axios from 'axios';
import crypto from 'crypto';

const AMAZON_API_URL = process.env.AMAZON_API_URL;
const AMAZON_ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
const AMAZON_SECRET_KEY = process.env.AMAZON_SECRET_KEY;
const AMAZON_ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG;

// Helper function to generate signature
const generateSignature = (stringToSign, secretKey) => {
  return crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('base64');
};

export const amazonApi = {
  async getRelatedProducts(asin) {
    try {
      const timestamp = new Date().toISOString();
      const headers = {
        'Content-Type': 'application/json',
        'X-Amz-Date': timestamp,
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
      };

      // Request payload
      const payload = {
        "ItemIds": [asin],
        "Resources": [
          "Images.Primary.Large",
          "ItemInfo.Title",
          "Offers.Listings.Price",
          "ItemInfo.Features",
          "ItemInfo.ByLineInfo"
        ],
        "PartnerTag": AMAZON_ASSOCIATE_TAG,
        "PartnerType": "Associates",
        "Marketplace": "www.amazon.in"
      };

      // Generate signature
      const stringToSign = `${headers['X-Amz-Target']}\n${timestamp}`;
      const signature = generateSignature(stringToSign, AMAZON_SECRET_KEY);

      // Add authorization header
      headers.Authorization = `AWS4-HMAC-SHA256 Credential=${AMAZON_ACCESS_KEY}, SignedHeaders=content-type;x-amz-date;x-amz-target, Signature=${signature}`;

      const response = await axios.post(AMAZON_API_URL, payload, { headers });

      // Transform response to our format
      return response.data.ItemsResult.Items.map(item => ({
        id: item.ASIN,
        title: item.ItemInfo.Title.DisplayValue,
        price: item.Offers?.Listings[0]?.Price?.DisplayAmount || 'Price not available',
        image: item.Images.Primary.Large.URL,
        affiliateLink: item.DetailPageURL,
        category: item.ItemInfo.Classifications?.Binding?.DisplayValue || 'General'
      }));
    } catch (error) {
      console.error('Error fetching Amazon products:', error);
      return [];
    }
  },

  // Get similar products
  async getSimilarProducts(asin) {
    // Similar implementation but use GetSimilarityProducts operation
  },

  // Search products
  async searchProducts(keyword) {
    // Similar implementation but use SearchItems operation
  }
}; 