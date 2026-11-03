import { checkRewrite, retiredIds } from './card-fixes';

describe('checkRewrite', () => {
  it('accepts a sentence with the word, in any case', () => {
    expect(checkRewrite('Resilient', 'A resilient town.')).toBeNull();
  });
  it('rejects empty, too long and word-less sentences', () => {
    expect(checkRewrite('x', '  ')).toMatch(/trống/);
    expect(checkRewrite('x', 'x'.repeat(201))).toMatch(/dài/);
    expect(checkRewrite('abundant', 'Plenty of food.')).toMatch(/abundant/);
  });
});

describe('retiredIds', () => {
  it('joins retired and hidden cards once, sorted', () => {
    expect(retiredIds(['t2', 'v1'], ['v1', 'v9'])).toEqual(['t2', 'v1', 'v9']);
  });
});
