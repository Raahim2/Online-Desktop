'use client';

import { useEffect, useState, useCallback } from 'react';
import Desktop from '../components/Desktop';

export default function Home() {
  // History state: array of visited paths
  const [history, setHistory] = useState(['/']); // Start at root
  // Index state: current position in the history array
  const [historyIndex, setHistoryIndex] = useState(0);

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  // Derive current path from history state
  const currentPath = history[historyIndex];

  // Fetch data effect
  useEffect(() => {
    setIsLoading(true); // Start loading
    setError(null); // Reset error
    const path = history[historyIndex]; // Get path for the current index

    // console.log(`Fetching for: ${path}, Index: ${historyIndex}, History:`, history);

    fetch(`/api/projects?root=${encodeURIComponent(path)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setFolders(data.folders || []); // Ensure arrays even if null/undefined
        setFiles(data.files || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to load project data for path "${path}":`, err);
        setError(`Failed to load contents for ${path}. Please try again.`);
        setFolders([]); // Clear data on error
        setFiles([]);
        setIsLoading(false);
      });
      // Depend on historyIndex AND the history array content itself (though index change is the primary trigger)
  }, [history, historyIndex]);

  // --- Navigation Functions ---

  const navigateTo = useCallback((newPath) => {
    // Prevent navigating to the exact same path if it's already the current one
    if (newPath === currentPath) return;

    // console.log(`Navigating to: ${newPath}`);

    // If we navigate forward from a past state, truncate the future history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPath);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1); // Move index to the new end
  }, [history, historyIndex, currentPath]); // Include currentPath dependency

  const goBack = useCallback(() => {
    // console.log(`Going back. Index: ${historyIndex}`);
    if (historyIndex > 0) {
      setHistoryIndex(prevIndex => prevIndex - 1);
    }
  }, [historyIndex]); // Depend only on index

  const goForward = useCallback(() => {
    // console.log(`Going forward. Index: ${historyIndex}, Length: ${history.length}`);
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prevIndex => prevIndex + 1);
    }
  }, [historyIndex, history]); // Depend on index and history length

  // Determine if back/forward is possible
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <Desktop
      folders={folders}
      files={files}
      currentPath={currentPath} // Pass current path instead of Root
      navigateTo={navigateTo}    // Pass navigation function
      goBack={goBack}            // Pass back function
      goForward={goForward}        // Pass forward function
      canGoBack={canGoBack}        // Pass boolean for button state
      canGoForward={canGoForward}    // Pass boolean for button state
      isLoading={isLoading}        // Pass loading state (optional, for UI feedback)
      error={error}              // Pass error state (optional, for UI feedback)
    />
  );
}