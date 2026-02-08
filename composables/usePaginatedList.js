import { ref, onMounted, onUnmounted, watch } from "vue";
import { useAsyncData } from "#app";
import qs from 'qs';

/**
 * Composable for paginated list fetching with infinite scroll.
 * 
 * @param {Object} options
 * @param {import('vue').Ref<string>|string} options.apiUrl - API endpoint URL
 * @param {import('vue').Ref<Object>|Object} options.query - Query parameters to merge
 * @param {import('vue').Ref<string>|string} options.cacheKey - Cache key for useAsyncData
 * @param {Object} options.defaultParams - Default params merged into every request (e.g. { populate, depth, sort })
 * @param {string} options.paginationField - Field used for cursor-based pagination (default: 'lastActivity')
 */
export function usePaginatedList(options = {}) {
  const {
    apiUrl = '/api/entradas',
    query = {},
    cacheKey = null,
    defaultParams = {
      populate: 'entradas,comentarios',
      depth: 2,
      sort: '-lastActivity',
    },
    paginationField = 'lastActivity',
  } = options;

  // Resolve reactive or plain values
  const getApiUrl = () => typeof apiUrl === 'object' && apiUrl.value !== undefined ? apiUrl.value : apiUrl;
  const getQuery = () => typeof query === 'object' && query.value !== undefined ? query.value : query;
  const getCacheKey = () => typeof cacheKey === 'object' && cacheKey !== null && cacheKey.value !== undefined ? cacheKey.value : cacheKey;

  // States
  const items = ref([]);
  const hasNextPage = ref(false);
  const loading = ref(false);
  const initialLoading = ref(true);
  const observerTarget = ref(null);

  // Fetch function
  const fetchItems = async () => {
    const queryParams = qs.stringify({
      ...defaultParams,
      ...getQuery(),
    }, { encode: false });

    const res = await useAPI(`${getApiUrl()}?${queryParams}`);
    return res;
  };

  // Initial fetch
  const initialFetch = async () => {
    const { data } = await useAsyncData(getCacheKey(), fetchItems);
    if (data.value) {
      items.value = data.value.docs;
      hasNextPage.value = data.value.hasNextPage;
    }
    initialLoading.value = false;
  };

  // Refetch (clears data and fetches fresh)
  const refetch = async () => {
    items.value = [];
    hasNextPage.value = false;
    initialLoading.value = true;

    try {
      const res = await fetchItems();
      items.value = res.docs;
      hasNextPage.value = res.hasNextPage;
    } catch (error) {
      console.error('Error refetching items:', error);
    } finally {
      initialLoading.value = false;
    }
  };

  // Fetch next page (infinite scroll)
  const fetchNextItems = async () => {
    loading.value = true;

    const lastItem = items.value[items.value.length - 1];
    const lastCursorValue = lastItem ? lastItem[paginationField] : null;

    const baseQuery = {
      ...defaultParams,
      createdLessThan: lastCursorValue, // For custom feed endpoints
      ...getQuery(),
    };

    if (lastCursorValue) {
      const cursorCondition = { [paginationField]: { less_than: lastCursorValue } };

      if (baseQuery.where) {
        if (Array.isArray(baseQuery.where.and)) {
          baseQuery.where.and = baseQuery.where.and.filter(
            cond => !cond[paginationField]
          );
          baseQuery.where.and.push(cursorCondition);
        } else {
          baseQuery.where = { and: [baseQuery.where, cursorCondition] };
        }
      } else {
        baseQuery.where = cursorCondition;
      }
    }

    const queryParams = qs.stringify(baseQuery, { encode: false });

    try {
      const res = await useAPI(`${getApiUrl()}?${queryParams}`);
      hasNextPage.value = res.hasNextPage;
      items.value = [...items.value, ...res.docs];
    } catch (error) {
      console.error('Error fetching next items:', error);
    } finally {
      loading.value = false;
    }
  };

  // Intersection Observer
  const handleIntersect = async (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && hasNextPage.value && !loading.value) {
      await fetchNextItems();
    }
  };

  let observer;

  const setupObserver = () => {
    observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '100px',
      threshold: 0.1,
    });

    if (observerTarget.value) {
      observer.observe(observerTarget.value);
    }
  };

  const cleanupObserver = () => {
    if (observer) {
      observer.disconnect();
    }
  };

  // Remove item by id
  const removeItem = (id) => {
    items.value = items.value.filter(item => item.id !== id);
  };

  onMounted(() => {
    setupObserver();
  });

  onUnmounted(() => {
    cleanupObserver();
  });

  return {
    items,
    hasNextPage,
    loading,
    initialLoading,
    observerTarget,
    fetchItems,
    fetchNextItems,
    refetch,
    removeItem,
    initialFetch,
  };
}
