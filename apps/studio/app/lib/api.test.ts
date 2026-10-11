import { describe, expect, it } from 'vitest';
import { normalizeBaseUrl } from './api';

describe('normalizeBaseUrl', () => {
    it('adds https:// to bare hosts and drops trailing slashes', () => {
        expect(normalizeBaseUrl('cortexapi-production.up.railway.app')).toBe('https://cortexapi-production.up.railway.app');
        expect(normalizeBaseUrl(' https://api.test/ ')).toBe('https://api.test');
        expect(normalizeBaseUrl('http://localhost:3001')).toBe('http://localhost:3001');
        expect(normalizeBaseUrl(undefined)).toBe('');
    });
});
