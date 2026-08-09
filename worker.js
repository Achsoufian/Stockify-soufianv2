// Enhanced search worker with performance optimizations for large datasets

let workerInventoryData = [];
let searchIndex = null;
let isLargeDataset = false;

// Performance constants
const LARGE_DATASET_THRESHOLD = 5000;
const MAX_SEARCH_RESULTS = 100;
const BATCH_SIZE = 1000;

self.addEventListener("message", function(e) {
    const { action, data, query, category, stockFilter, stockMin, stockMax, priceFilterEnabled, priceMin, priceMax } = e.data;

    switch (action) {
        case "loadData":
            workerInventoryData = data || [];
            isLargeDataset = workerInventoryData.length > LARGE_DATASET_THRESHOLD;
            
            // Build search index for large datasets
            if (isLargeDataset) {
                buildSearchIndex();
            }
            
            console.log("Worker: Inventory data loaded.", workerInventoryData.length, "items. Large dataset:", isLargeDataset);
            break;

        case "search":
            performOptimizedSearch(query, category, stockFilter, stockMin, stockMax, priceFilterEnabled, priceMin, priceMax);
            break;
    }
});

function buildSearchIndex() {
    console.log("Worker: Building search index for performance...");
    searchIndex = new Map();
    
    workerInventoryData.forEach((item, index) => {
        // Create searchable text combining all searchable fields
        const searchableText = [
            item.name || "",
            String(item.id || ""),
            String(item.code_article || ""),
            item.category || "",
            item.supplier || ""
        ].join(" ").toLowerCase();
        
        // Store the searchable text with the item index
        searchIndex.set(index, {
            text: searchableText, // This was the issue, it was missing the assignment
            name: (item.name || "").toLowerCase(),
            id: String(item.id || "").toLowerCase(),
            code_article: String(item.code_article || "").toLowerCase(),
            category: item.category || "Uncategorized",
            stock: item.stock || 0,
            price: item.price || 0
        });
    });
    
    console.log("Worker: Search index built successfully");
}

function performOptimizedSearch(query, category, stockFilter, stockMin, stockMax, priceFilterEnabled, priceMin, priceMax) {
    let results = [];
    
    try {
        if (isLargeDataset && searchIndex) {
            results = performIndexedSearch(query, category, stockFilter, stockMin, stockMax, priceFilterEnabled, priceMin, priceMax);
        } else {
            results = performStandardSearch(query, category, stockFilter, stockMin, stockMax, priceFilterEnabled, priceMin, priceMax);
        }
        
        // Limit results for better performance
        if (results.length > MAX_SEARCH_RESULTS) {
            results = results.slice(0, MAX_SEARCH_RESULTS);
        }
        
    } catch (error) {
        console.error("Worker: Search error:", error);
        results = [];
    }
    
    // Send the results back to the main thread
    self.postMessage({
        status: "searchComplete",
        results: results,
        totalFound: results.length,
        isLimited: results.length === MAX_SEARCH_RESULTS
    });
}

function performIndexedSearch(query, category, stockFilter, stockMin, stockMax, priceFilterEnabled, priceMin, priceMax) {
    const results = [];
    const lowerCaseQuery = query ? query.toLowerCase().trim() : "";
    
    // Early exit if no search criteria
    if (!lowerCaseQuery && !category && !stockFilter && !priceFilterEnabled) {
        return [];
    }
    
    let processedCount = 0;
    
    for (const [index, indexedItem] of searchIndex) {
        // Batch processing to prevent blocking
        if (processedCount % BATCH_SIZE === 0 && processedCount > 0) {
            // Allow other operations to run
            if (results.length >= MAX_SEARCH_RESULTS) break;
        }
        
        let matches = true;
        
        // Category filter (most selective, check first)
        if (category && indexedItem.category !== category) {
            matches = false;
        }
        
        // Stock filter
        if (matches && stockFilter) {
            switch (stockFilter) {
                case "in-stock":
                    if (indexedItem.stock <= 0) matches = false;
                    break;
                case "out-of-stock":
                    if (indexedItem.stock !== 0) matches = false;
                    break;
                case "custom-range":
                    if (stockMin !== null && indexedItem.stock < stockMin) matches = false;
                    if (matches && stockMax !== null && indexedItem.stock > stockMax) matches = false;
                    break;
            }
        }
        
        // Price filter
        if (matches && priceFilterEnabled) {
            if (priceMin !== null && indexedItem.price < priceMin) matches = false;
            if (matches && priceMax !== null && indexedItem.price > priceMax) matches = false;
        }
        
        // Text search (most expensive, check last)
        if (matches && lowerCaseQuery) {
            // Optimized text matching
            matches = indexedItem.text.includes(lowerCaseQuery);
        }
        
        if (matches) {
            results.push(workerInventoryData[index]);
            
            // Early exit if we have enough results
            if (results.length >= MAX_SEARCH_RESULTS) {
                break;
            }
        }
        
        processedCount++;
    }
    
    return results;
}

function performStandardSearch(query, category, stockFilter, stockMin, stockMax, priceFilterEnabled, priceMin, priceMax) {
    let filteredData = workerInventoryData;
    
    // Early exit if no search criteria
    if (!query && !category && !stockFilter && !priceFilterEnabled) {
        return [];
    }
    
    // Apply filters in order of selectivity (most selective first)
    
    // Category filter (usually most selective)
    if (category) {
        filteredData = filteredData.filter(item => (item.category || "Uncategorized") === category);
    }
    
    // Stock filter
    if (stockFilter && filteredData.length > 0) {
        switch (stockFilter) {
            case "in-stock":
                filteredData = filteredData.filter(item => (item.stock || 0) > 0);
                break;
            case "out-of-stock":
                filteredData = filteredData.filter(item => (item.stock || 0) === 0);
                break;
            case "custom-range":
                if (stockMin !== null || stockMax !== null) {
                    filteredData = filteredData.filter(item => {
                        const stock = item.stock || 0;
                        const minCheck = stockMin !== null ? stock >= stockMin : true;
                        const maxCheck = stockMax !== null ? stock <= stockMax : true;
                        return minCheck && maxCheck;
                    });
                }
                break;
        }
    }
    
    // Price filter
    if (priceFilterEnabled && (priceMin !== null || priceMax !== null) && filteredData.length > 0) {
        filteredData = filteredData.filter(item => {
            const price = item.price || 0;
            const minCheck = priceMin !== null ? price >= priceMin : true;
            const maxCheck = priceMax !== null ? price <= priceMax : true;
            return minCheck && maxCheck;
        });
    }
    
    // Text search (most expensive, do last)
    if (query && filteredData.length > 0) {
        const lowerCaseQuery = query.toLowerCase().trim();
        filteredData = filteredData.filter(item => {
            // Optimized string matching
            const name = item.name || "";
            const id = String(item.id || "");
            const codeArticle = String(item.code_article || "");
            
            return name.toLowerCase().includes(lowerCaseQuery) ||
                   id.toLowerCase().includes(lowerCaseQuery) ||
                   codeArticle.toLowerCase().includes(lowerCaseQuery);
        });
    }
    
    return filteredData;
}

