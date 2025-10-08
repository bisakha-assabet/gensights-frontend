export function buildQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
 
  console.log('buildQuery input params:', params);
 
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "Product" && value !== "Country" && value !== "Quarter" && value !== "Year") {
      if (key === 'quarter') {
        // Convert "Q1", "Q2", etc. to integers 1, 2, etc.
        const quarterNumber = value.replace('Q', '');
        // Validate quarter is between 1-4
        const quarterInt = parseInt(quarterNumber);
        if (quarterInt >= 1 && quarterInt <= 4) {
          searchParams.set(key, quarterNumber);
          console.log(`Added quarter: ${quarterNumber}`);
        } else {
          console.warn(`Invalid quarter value: ${value}`);
        }
      } else {
        searchParams.set(key, value);
        console.log(`Added ${key}: ${value}`);
      }
    }
  }
 
  const queryString = searchParams.toString();
  console.log('buildQuery output:', queryString);
  return queryString;
}