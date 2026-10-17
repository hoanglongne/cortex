/**
 * Books in the "Ngoài đời" corpus: public-domain titles on Project
 * Gutenberg, chosen for plain, modern-enough English. Novels written in heavy
 * dialect (Huckleberry Finn, Treasure Island…) and plays are left out, since
 * their lines make poor examples. Ids are Gutenberg ebook numbers.
 */
export interface CorpusBook {
  /** Gutenberg ebook number. */
  id: number;
  title: string;
  author: string;
}

export const CORPUS_BOOKS: readonly CorpusBook[] = [
  { id: 1342, title: 'Pride and Prejudice', author: 'Jane Austen' },
  { id: 158, title: 'Emma', author: 'Jane Austen' },
  { id: 161, title: 'Sense and Sensibility', author: 'Jane Austen' },
  { id: 105, title: 'Persuasion', author: 'Jane Austen' },
  { id: 121, title: 'Northanger Abbey', author: 'Jane Austen' },
  { id: 141, title: 'Mansfield Park', author: 'Jane Austen' },
  { id: 84, title: 'Frankenstein', author: 'Mary Shelley' },
  { id: 345, title: 'Dracula', author: 'Bram Stoker' },
  { id: 1260, title: 'Jane Eyre', author: 'Charlotte Brontë' },
  { id: 768, title: 'Wuthering Heights', author: 'Emily Brontë' },
  { id: 1400, title: 'Great Expectations', author: 'Charles Dickens' },
  { id: 98, title: 'A Tale of Two Cities', author: 'Charles Dickens' },
  { id: 730, title: 'Oliver Twist', author: 'Charles Dickens' },
  { id: 766, title: 'David Copperfield', author: 'Charles Dickens' },
  { id: 145, title: 'Middlemarch', author: 'George Eliot' },
  { id: 174, title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
  { id: 2701, title: 'Moby Dick', author: 'Herman Melville' },
  { id: 33, title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne' },
  { id: 514, title: 'Little Women', author: 'Louisa May Alcott' },
  {
    id: 1661,
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
  },
  {
    id: 2852,
    title: 'The Hound of the Baskervilles',
    author: 'Arthur Conan Doyle',
  },
  {
    id: 43,
    title: 'The Strange Case of Dr Jekyll and Mr Hyde',
    author: 'Robert Louis Stevenson',
  },
  { id: 219, title: 'Heart of Darkness', author: 'Joseph Conrad' },
  { id: 35, title: 'The Time Machine', author: 'H. G. Wells' },
  { id: 36, title: 'The War of the Worlds', author: 'H. G. Wells' },
  { id: 215, title: 'The Call of the Wild', author: 'Jack London' },
  { id: 910, title: 'White Fang', author: 'Jack London' },
  { id: 541, title: 'The Age of Innocence', author: 'Edith Wharton' },
  { id: 4517, title: 'Ethan Frome', author: 'Edith Wharton' },
  { id: 2641, title: 'A Room with a View', author: 'E. M. Forster' },
  { id: 2891, title: 'Howards End', author: 'E. M. Forster' },
  { id: 160, title: 'The Awakening', author: 'Kate Chopin' },
  { id: 5200, title: 'Metamorphosis', author: 'Franz Kafka' },
  { id: 2500, title: 'Siddhartha', author: 'Hermann Hesse' },
  { id: 2376, title: 'Up from Slavery', author: 'Booker T. Washington' },
  { id: 408, title: 'The Souls of Black Folk', author: 'W. E. B. Du Bois' },
  { id: 34901, title: 'On Liberty', author: 'John Stuart Mill' },
  { id: 11224, title: 'Utilitarianism', author: 'John Stuart Mill' },
  { id: 5827, title: 'The Problems of Philosophy', author: 'Bertrand Russell' },
  { id: 2680, title: 'Meditations', author: 'Marcus Aurelius' },
  { id: 1232, title: 'The Prince', author: 'Niccolò Machiavelli' },
  { id: 147, title: 'Common Sense', author: 'Thomas Paine' },
];

export const bookKey = (id: number) => `pg${id}`;

/** Plain-text file on gutenberg.org (UTF-8, with the START/END markers). */
export const bookTextUrl = (id: number) =>
  `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;

export const bookPageUrl = (id: number) =>
  `https://www.gutenberg.org/ebooks/${id}`;

export const bookSource = (b: CorpusBook) => `${b.title} — ${b.author}`;
