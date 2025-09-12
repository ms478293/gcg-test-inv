import { useState, useEffect } from 'react';
import { collectionsAPI } from '../services/api';

export const useCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await collectionsAPI.getActiveCollections();
        setCollections(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch collections');
        console.error('Error fetching collections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return { collections, loading, error, refetch: () => fetchCollections() };
};

export const useCollection = (collectionId) => {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionId) {
      setLoading(false);
      return;
    }

    const fetchCollection = async () => {
      try {
        setLoading(true);
        const response = await collectionsAPI.getCollection(collectionId);
        setCollection(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch collection');
        console.error('Error fetching collection:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId]);

  return { collection, loading, error };
};