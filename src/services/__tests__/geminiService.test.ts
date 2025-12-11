import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Sample base64 test data (1x1 transparent PNG)
const VALID_BASE64_IMAGE = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const EMPTY_BASE64 = '';

// Mock successful image generation response (Gemini 3 Pro format)
const createMockSuccessResponse = (imageBase64: string = 'generated-image-base64-data') => ({
    candidates: [{
        content: {
            parts: [{
                inlineData: {
                    data: imageBase64
                }
            }]
        }
    }]
});

// Mock error responses
const createMockErrorResponse = () => ({
    candidates: []
});

// Create mock functions
const mockGenerateContent = vi.fn();

// Mock the @google/genai module
vi.mock('@google/genai', async (importOriginal) => {
    const actual = await importOriginal() as any;

    return {
        ...actual, // Keep all original exports like Type, Schema, etc.
        GoogleGenAI: class MockGoogleGenAI {
            models = {
                generateContent: mockGenerateContent
            };
            chats = {
                create: vi.fn()
            };
            constructor(config: any) {
                // Mock constructor
            }
        }
    };
});

// Mock featureFlagService
vi.mock('../featureFlagService', () => ({
    getAIModelVersion: vi.fn(() => 'gemini-2.0-flash'),
    getFeatureFlag: vi.fn()
}));

describe('generateVehicleIcon', () => {
    // Import after mocks are set up
    let generateVehicleIcon: any;

    beforeEach(async () => {
        // Reset all mocks
        vi.clearAllMocks();
        mockGenerateContent.mockReset();

        // Dynamically import the module after mocks are set
        const module = await import('../geminiService');
        generateVehicleIcon = module.generateVehicleIcon;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Image Validation', () => {
        it('should return null for empty base64 string', async () => {
            const result = await generateVehicleIcon(EMPTY_BASE64, 0);
            expect(result).toBeNull();
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });

        it('should return null for excessively large images', async () => {
            // Create a string larger than 4MB (base64 encoded)
            const largeBase64 = 'A'.repeat(6 * 1024 * 1024); // ~6MB
            const result = await generateVehicleIcon(largeBase64, 0);
            expect(result).toBeNull();
            expect(mockGenerateContent).not.toHaveBeenCalled();
        });

        it('should accept valid base64 image data', async () => {
            mockGenerateContent.mockResolvedValueOnce(createMockSuccessResponse());
            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 0);
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        });
    });

    describe('API Integration', () => {
        it('should call Imagen API with correct parameters', async () => {
            mockGenerateContent.mockResolvedValueOnce(createMockSuccessResponse());

            await generateVehicleIcon(VALID_BASE64_IMAGE, 0);

            // Verify the API was called
            expect(mockGenerateContent).toHaveBeenCalledTimes(1);

            // Get the actual call arguments
            const callArgs = mockGenerateContent.mock.calls[0][0];

            // Verify model
            expect(callArgs.model).toBe('gemini-3-pro-image-preview');

            // Verify contents structure (text + image)
            expect(callArgs.contents).toBeDefined();
            expect(callArgs.contents).toHaveLength(2);
            expect(callArgs.contents[0]).toHaveProperty('text');
            expect(callArgs.contents[1].inlineData.data).toBe(VALID_BASE64_IMAGE);
            expect(callArgs.contents[1].inlineData.mimeType).toBe('image/jpeg');

            // Verify config
            expect(callArgs.config).toBeDefined();
            expect(callArgs.config.responseModalities).toEqual(['IMAGE']);
            expect(callArgs.config.imageConfig.aspectRatio).toBe('1:1');
            expect(callArgs.config.imageConfig.imageSize).toBe('1K');
        });

        it('should return base64 image data on success', async () => {
            const expectedImageData = 'generated-icon-base64-xyz';
            mockGenerateContent.mockResolvedValueOnce(createMockSuccessResponse(expectedImageData));

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 0);

            expect(result).toBe(expectedImageData);
        });

        it('should return null when API returns empty images array', async () => {
            mockGenerateContent.mockResolvedValueOnce(createMockErrorResponse());

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 0);

            expect(result).toBeNull();
        });

        it('should return null when API returns malformed response', async () => {
            mockGenerateContent.mockResolvedValueOnce({ images: [{ image: null }] });

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 0);

            expect(result).toBeNull();
        });
    });

    describe('Error Handling & Retry Logic', () => {
        it('should retry on API failure', async () => {
            const retryCount = 2;
            mockGenerateContent
                .mockRejectedValueOnce(new Error('API Error 1'))
                .mockRejectedValueOnce(new Error('API Error 2'))
                .mockResolvedValueOnce(createMockSuccessResponse('success-after-retry'));

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, retryCount);

            expect(mockGenerateContent).toHaveBeenCalledTimes(3);
            expect(result).toBe('success-after-retry');
        });

        it('should return null after exhausting all retries', async () => {
            const retryCount = 1;
            mockGenerateContent
                .mockRejectedValueOnce(new Error('API Error 1'))
                .mockRejectedValueOnce(new Error('API Error 2'));

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, retryCount);

            expect(mockGenerateContent).toHaveBeenCalledTimes(2); // Initial + 1 retry
            expect(result).toBeNull();
        });

        it('should handle network timeout errors gracefully', async () => {
            mockGenerateContent.mockRejectedValueOnce(new Error('ETIMEDOUT'));

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 0);

            expect(result).toBeNull();
        });

        it('should handle rate limiting errors', async () => {
            const rateLimitError = new Error('429 Too Many Requests');
            mockGenerateContent.mockRejectedValueOnce(rateLimitError);

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 0);

            expect(result).toBeNull();
        });

        it('should wait with exponential backoff between retries', async () => {
            vi.useFakeTimers();

            const retryCount = 2;
            mockGenerateContent
                .mockRejectedValueOnce(new Error('Fail 1'))
                .mockRejectedValueOnce(new Error('Fail 2'))
                .mockResolvedValueOnce(createMockSuccessResponse());

            const promise = generateVehicleIcon(VALID_BASE64_IMAGE, retryCount);

            // Fast-forward through backoff periods
            await vi.advanceTimersByTimeAsync(1000); // First retry after 1s
            await vi.advanceTimersByTimeAsync(2000); // Second retry after 2s

            const result = await promise;

            expect(result).toBe('generated-image-base64-data');
            expect(mockGenerateContent).toHaveBeenCalledTimes(3);

            vi.useRealTimers();
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined return from API', async () => {
            mockGenerateContent.mockResolvedValueOnce(undefined);

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 0);

            expect(result).toBeNull();
        });

        it('should handle missing imageBytes in response', async () => {
            mockGenerateContent.mockResolvedValueOnce({
                images: [{ image: { someOtherField: 'data' } }]
            });

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 0);

            expect(result).toBeNull();
        });

        it('should work with retryCount of 0 (no retries)', async () => {
            mockGenerateContent.mockResolvedValueOnce(createMockSuccessResponse());

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 0);

            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
            expect(result).toBe('generated-image-base64-data');
        });

        it('should work with high retryCount', async () => {
            mockGenerateContent.mockResolvedValueOnce(createMockSuccessResponse());

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 10);

            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
            expect(result).toBe('generated-image-base64-data');
        });
    });

    describe('Integration with Real-World Scenarios', () => {
        it('should handle typical JPEG photo base64 data', async () => {
            // Simulated JPEG header in base64
            const jpegBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD...';
            mockGenerateContent.mockResolvedValueOnce(createMockSuccessResponse());

            const result = await generateVehicleIcon(jpegBase64, 1);

            expect(mockGenerateContent).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });

        it('should handle PNG photo base64 data', async () => {
            mockGenerateContent.mockResolvedValueOnce(createMockSuccessResponse());

            const result = await generateVehicleIcon(VALID_BASE64_IMAGE, 1);

            expect(mockGenerateContent).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });
    });
});

describe('Image Validation Helper', () => {
    let generateVehicleIcon: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockGenerateContent.mockReset();
        const module = await import('../geminiService');
        generateVehicleIcon = module.generateVehicleIcon;
    });

    // Testing the internal validation logic through the public API
    it('should reject images over 4MB', async () => {
        const oversizedImage = 'A'.repeat(6 * 1024 * 1024);
        const result = await generateVehicleIcon(oversizedImage, 0);
        expect(result).toBeNull();
    });

    it('should accept images under 4MB', async () => {
        mockGenerateContent.mockResolvedValueOnce(createMockSuccessResponse());

        const validSizedImage = 'A'.repeat(1024); // ~1KB
        const result = await generateVehicleIcon(validSizedImage, 0);

        expect(mockGenerateContent).toHaveBeenCalled();
    });
});
