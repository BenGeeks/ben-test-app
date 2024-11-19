'use client';
import { scrapePageBody, scrapeHeaderFooter } from '@/services/ben-scrapper';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  console.log('MARK DOWN RESULT: ', markdown);

  const handleScapeBody = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    if (!url) return;

    try {
      const result = await scrapePageBody(url);
      if (result) {
        setMarkdown(result.markdown);
      } else {
        setError('Failed to fetch content.');
      }
    } catch (error) {
      console.error('ERROR: ', error);
      setError('Failed to fetch content.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrapeHeaderFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!url) return;

    try {
      const result = await scrapeHeaderFooter(url);
      if (result) {
        setMarkdown(result.markdown);
      } else {
        setError('Failed to fetch content.');
      }
    } catch (error) {
      console.error('ERROR: ', error);
      setError('Failed to fetch content.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-black">Simple URL Scraper</h1>
      <form className="w-full max-w-md flex flex-col gap-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          required
        />

        <button
          type="button"
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center h-10"
          onClick={handleScapeBody}
          disabled={isLoading}
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Scrape BODY Content'}
        </button>
        <button
          type="button"
          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center h-10"
          onClick={handleScrapeHeaderFooter}
          disabled={isLoading}
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Scrape HEADER FOOTER Content'}
        </button>
        <button
          type="reset"
          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-500 transition"
          onClick={() => {
            setMarkdown(null);
            setError(null);
          }}
          disabled={isLoading}
        >
          Clear Result
        </button>
      </form>

      <div className="mt-8 w-full max-w-4xl bg-white p-4 border rounded-lg shadow-md h-[70vh]">
        <h2 className="text-lg font-semibold mb-2 text-black">Fetched Content:</h2>
        <div className="p-4 bg-gray-50 border rounded-lg h-full overflow-y-auto text-black">
          {error ? <p>{error}</p> : markdown ? <ReactMarkdown>{markdown}</ReactMarkdown> : <p>No content fetched yet.</p>}
        </div>
      </div>
    </div>
  );
}
