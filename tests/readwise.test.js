const axios = require('axios');
const { getHighlights } = require('../src/readwise');

// Mock axios
jest.mock('axios');

describe('Readwise Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getHighlights', () => {
    it('should fetch highlights with correct authorization', async () => {
      const mockHighlights = [
        { title: 'Book 1', text: 'Highlight 1' },
        { title: 'Book 2', text: 'Highlight 2' }
      ];

      axios.get.mockResolvedValueOnce({
        data: { highlights: mockHighlights }
      });

      const highlights = await getHighlights();

      expect(axios.get).toHaveBeenCalledWith(
        'https://readwise.io/api/v2/review',
        {
          headers: {
            Authorization: 'Token test_readwise_token'
          }
        }
      );
      expect(highlights).toEqual(mockHighlights);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(getHighlights()).rejects.toThrow(errorMessage);
    });
  });
}); 