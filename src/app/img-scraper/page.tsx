'use client';
import { imgScraper } from '@/services/img-scraper';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleScapeImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a valid URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await imgScraper(url.trim());
      if (result) {
        setImage(result); // Set the single largest image
      } else {
        setImage(null);
        setError('No images found on the provided URL.');
      }
    } catch (error) {
      console.error('ERROR: ', error);
      setError('Failed to fetch content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-black">Simple URL Scraper</h1>
      <form className="w-full max-w-md flex flex-col gap-4" onSubmit={handleScapeImage}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          required
        />

        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center h-10"
          disabled={isLoading}
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Scrape Image'}
        </button>
        <button
          type="reset"
          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-500 transition"
          onClick={() => {
            setImage(null);
            setError(null);
            setUrl('');
          }}
          disabled={isLoading}
        >
          Clear Result
        </button>
      </form>

      <div className="mt-8 w-full max-w-4xl bg-white p-4 border rounded-lg shadow-md h-[70vh]">
        <h2 className="text-lg font-semibold mb-2 text-black">Fetched Image:</h2>
        <div className="p-4 bg-gray-50 border rounded-lg h-full overflow-y-auto text-black flex items-center justify-center">
          {isLoading && <p className="text-gray-500">Loading...</p>}
          {!isLoading && error && <p className="text-red-600">{error}</p>}
          {!isLoading && !error && !image && <p className="text-gray-500">No image found.</p>}
          {/* @next/next/no-img-element */}
          {!isLoading && image && <img src={image} alt="Largest Image" className="max-w-full max-h-full" />}
        </div>
      </div>
    </div>
  );
}
