import { beforeAll, afterAll, vi } from 'vitest'

// Mock environment variables
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/saf_rankings_test'
process.env.BLOB_READ_WRITE_TOKEN = 'test_token'

// Mock Vercel Blob
vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({
    url: 'https://test-blob.vercel.app/test-file.jpg',
    pathname: 'test-file.jpg',
  }),
  del: vi.fn().mockResolvedValue(undefined),
}))

beforeAll(() => {
  // Global setup before all tests
})

afterAll(() => {
  // Global cleanup after all tests
})
