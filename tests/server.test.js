const request = require('supertest');
const axios = require('axios');
const { app, startServer } = require('../src/server');

jest.mock('axios');

describe('Delete Proxy Server', () => {
  let server;

  beforeAll(async () => {
    server = await startServer();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    process.env.READWISE_AUTH_TOKEN = 'test-token';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a highlight and return success page', async () => {
    axios.delete.mockResolvedValue({ status: 200 });

    const response = await request(app)
      .get('/delete-highlight/12345');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Highlight Deleted');
    expect(response.text).toContain('successfully deleted');
    
    expect(axios.delete).toHaveBeenCalledWith(
      'https://readwise.io/api/v2/highlights/12345/',
      {
        headers: {
          Authorization: 'Token test-token'
        }
      }
    );
  });

  it('should handle deletion errors', async () => {
    axios.delete.mockRejectedValue(new Error('API Error'));

    const response = await request(app)
      .get('/delete-highlight/12345');

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error');
    expect(response.text).toContain('Failed to delete highlight');
    expect(response.text).toContain('API Error');
  });
}); 