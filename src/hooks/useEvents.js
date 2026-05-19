import { useCallback, useEffect, useState } from 'react';

import eventbriteService from '../services/eventbriteService';

export const useEvents = (
  searchQuery = '',
  source = 'all',
  filters = {}
) => {
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [total, setTotal] =
    useState(0);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [hasNext, setHasNext] =
    useState(false);

  const [hasPrevious, setHasPrevious] =
    useState(false);

  const limit = filters.limit || 12;

  const fetchEvents = useCallback(
    async (customPage = page) => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await eventbriteService.searchEvents({
            query: searchQuery,
            source,
            page: customPage,
            limit,

            category:
              filters.category,

            region:
              filters.region,

            eventType:
              filters.event_type,

            sort:
              filters.sort,
          });

        setEvents(data.events || []);

        setTotal(data.total || 0);

        setTotalPages(
          data.total_pages || 1
        );

        setHasNext(
          data.has_next || false
        );

        setHasPrevious(
          data.has_previous || false
        );
      } catch (err) {
        console.error(
          'Event fetch error:',
          err
        );

        setError(
          err.message ||
            'Failed to fetch events.'
        );

        setEvents([]);
      } finally {
        setLoading(false);
      }
    },
    [
      searchQuery,
      source,
      page,
      limit,
      filters.category,
      filters.region,
      filters.event_type,
      filters.sort,
    ]
  );

  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    source,
    filters.category,
    filters.region,
    filters.event_type,
    filters.sort,
  ]);

  useEffect(() => {
    fetchEvents(page);
  }, [fetchEvents, page]);

  const nextPage = () => {
    if (
      hasNext &&
      page < totalPages
    ) {
      setPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (
      hasPrevious &&
      page > 1
    ) {
      setPage((prev) => prev - 1);
    }
  };

  const goToPage = (
    targetPage
  ) => {
    if (
      targetPage >= 1 &&
      targetPage <= totalPages
    ) {
      setPage(targetPage);
    }
  };

  const refetch = async () => {
    await fetchEvents(page);
  };

  return {
    events,
    loading,
    error,

    total,

    page,
    limit,

    totalPages,

    hasNext,
    hasPrevious,

    nextPage,
    previousPage,
    goToPage,

    refetch,
  };
};