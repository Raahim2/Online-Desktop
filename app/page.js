'use client';

import { useEffect, useState, useCallback } from 'react';
import Desktop from '../components/Desktop';

export default function Home() {
  const [history, setHistory] = useState(['/']); 
  const [historyIndex, setHistoryIndex] = useState(0);

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 

  const currentPath = history[historyIndex];

  useEffect(() => {
    setIsLoading(true); 
    setError(null); 
    const path = history[historyIndex]; 

    fetch(`/api/projects?root=${encodeURIComponent(path)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setFolders(data.folders || []); 
        setFiles(data.files || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to load project data for path "${path}":`, err);
        setError(`Failed to load contents for ${path}. Please try again.`);
        setFolders([]); 
        setFiles([]);
        setIsLoading(false);
      });
  }, [history, historyIndex]);


  const navigateTo = useCallback((newPath) => {
    if (newPath === currentPath) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPath);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1); 
  }, [history, historyIndex, currentPath]); 

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prevIndex => prevIndex - 1);
    }
  }, [historyIndex]); 

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prevIndex => prevIndex + 1);
    }
  }, [historyIndex, history]); 

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <Desktop
      folders={folders}
      files={files}
      currentPath={currentPath}
      navigateTo={navigateTo}
      goBack={goBack}
      goForward={goForward}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
      isLoading={isLoading}
      error={error}
    />
  );
}