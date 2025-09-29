import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

// Custom pagination component
export const DataTablePagination = ({
    pageInfo,
    onPageUpdate,
    onSizeUpdate
}) => {
    const { currentPage, totalPages, totalRecords, pageSize } = pageInfo;
    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(currentPage * pageSize, totalRecords);

    const generatePageNumbers = () => {
        const pages = [];
        const showPages = 5; // Show 5 page numbers max

        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        let endPage = Math.min(totalPages, startPage + showPages - 1);

        if (endPage - startPage + 1 < showPages) {
            startPage = Math.max(1, endPage - showPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <div className="data-table__pagination table-pagination-wrapper flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="data-table__pagination-summary pagination-summary flex items-center gap-4 mb-4 sm:mb-0">
                <span className="data-table__pagination-text text-sm text-gray-700 dark:text-gray-300">
                    Records {startRecord}-{endRecord} of {totalRecords}
                </span>
                <select
                    value={pageSize}
                    onChange={(e) => onSizeUpdate(Number(e.target.value))}
                    className="data-table__page-size-selector page-size-selector px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value={5}>5 rows</option>
                    <option value={10}>10 rows</option>
                    <option value={25}>25 rows</option>
                    <option value={50}>50 rows</option>
                </select>
            </div>

            <div className="data-table__pagination-nav pagination-navigation flex items-center gap-2">
                <button
                    onClick={() => onPageUpdate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="data-table__nav-button nav-button p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>

                {generatePageNumbers().map(pageNum => (
                    <button
                        key={pageNum}
                        onClick={() => onPageUpdate(pageNum)}
                        className={`data-table__page-number page-number px-3 py-1 rounded-md text-sm ${pageNum === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        {pageNum}
                    </button>
                ))}

                <button
                    onClick={() => onPageUpdate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="data-table__nav-button nav-button p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Enhanced search and filter component
export const DataTableSearchFilter = ({
    searchValue,
    onSearchChange,
    filters = [],
    selectedFilters = {},
    onFilterChange,
    placeholder = 'Search records...',
    debounceMs = 400
}) => {
    // Local controlled input so typing is immediately responsive while we debounce
    const [localSearch, setLocalSearch] = React.useState(searchValue || '');
    const debounceRef = React.useRef(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef(null);

    // Keep local input in sync when parent updates searchValue (e.g., reset), but avoid
    // stomping the user's input while they're actively typing (focused).
    React.useEffect(() => {
        if (!isFocused) {
            setLocalSearch(searchValue || '');
        }
    }, [searchValue, isFocused]);

    const handleInputChange = (value) => {
        setLocalSearch(value);

        // debounce the parent callback
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            debounceRef.current = null;
            onSearchChange(value);
        }, debounceMs);
    };

    const clearSearch = () => {
        setLocalSearch('');
        // cancel any pending debounce and notify parent immediately
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
        }
        onSearchChange('');
        // restore focus to input
        if (inputRef.current) inputRef.current.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            clearSearch();
        }
    };

    // If the user blurs the input while typing, flush any pending debounced call so
    // the parent receives the final value immediately and we don't lose input.
    const handleBlur = () => {
        setIsFocused(false);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
            debounceRef.current = null;
            onSearchChange(localSearch);
        }
    };

    // cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = null;
        };
    }, []);

    return (
        <div className="data-table__search-filter table-search-filter-wrapper flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Search Input */}
            <div className="data-table__search-wrapper search-input-wrapper flex-1 relative">
                <div className="data-table__search-icon absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={localSearch}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="data-table__search-input search-input w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />

                {/* Clear button */}
                {localSearch && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Filter Dropdowns */}
            {filters.length > 0 && (
                <div className="data-table__filter-controls filter-controls flex flex-wrap gap-3">
                    <div className="data-table__filter-icon filter-icon-wrapper flex items-center">
                        <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    {filters.map((filter) => (
                        <select
                            key={filter.key}
                            value={selectedFilters[filter.key] || ''}
                            onChange={(e) => onFilterChange(filter.key, e.target.value)}
                            className="data-table__filter-select filter-select px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[120px]"
                        >
                            <option value="">{filter.label}</option>
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ))}
                </div>
            )}
        </div>
    );
};

// Hook for table data management
export const useTableData = (initialData = [], initialPageSize = 10) => {
    const data = initialData;
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filters, setFilters] = React.useState({});
    const [currentPage, setCurrentPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(initialPageSize);

    // Filter and search logic
    const filteredData = React.useMemo(() => {
        let result = data;

        // Apply search
        if (searchQuery.trim()) {
            result = result.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                result = result.filter(item => {
                    const itemValue = item[key];
                    return String(itemValue).toLowerCase() === String(value).toLowerCase();
                });
            }
        });

        return result;
    }, [data, searchQuery, filters]);

    // Pagination calculations
    const totalRecords = filteredData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    // Reset to first page when search/filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters]);

    const updateFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const updatePageSize = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    return {
        // Data
        paginatedData,
        totalRecords,

        // Search
        searchQuery,
        setSearchQuery,

        // Filters
        filters,
        updateFilter,

        // Pagination
        currentPage,
        setCurrentPage,
        pageSize,
        updatePageSize,
        totalPages,

        // Page info for pagination component
        pageInfo: {
            currentPage,
            totalPages,
            totalRecords,
            pageSize
        }
    };
};
