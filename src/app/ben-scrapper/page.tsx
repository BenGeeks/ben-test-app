'use client';
import { fetchPageBody } from '@/services/ben-scrapper';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      const result = await fetchPageBody(url);
      if (result) {
        setContent(result.content);
        setLinks(result.links);
      } else {
        setError('Failed to fetch content.');
      }
    } catch (error) {
      console.log('ERROR: ', error);
      setError('Failed to fetch content.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-black">Simple URL Scraper</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          required
        />

        <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Fetch Content
        </button>
        <button
          type="button"
          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          onClick={() => {
            setContent([]);
            setLinks([]);
          }}
        >
          Clear Result
        </button>
      </form>

      <div className="mt-8 w-full max-w-4xl bg-white p-4 border rounded-lg shadow-md h-[70vh]">
        <h2 className="text-lg font-semibold mb-2 text-black">Fetched Content:</h2>
        <div className="p-4 bg-gray-50 border rounded-lg h-full overflow-y-auto text-black">
          {error ? (
            <p>{error}</p>
          ) : (
            <>
              <h3 className="mt-4 font-semibold">Page Content:</h3>
              {content.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
              <h3 className="mt-4 font-semibold">Links:</h3>
              {links.map((link, index) => (
                <p key={`link-${index}`}>{link}</p>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
