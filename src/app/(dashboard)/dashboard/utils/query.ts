export function buildQuery(params: Record<string, (string | number)[] | string | number | undefined>) {
  const searchParams = new URLSearchParams();
 
  console.log('buildQuery input params:', params);
 
  for (const [key, rawValues] of Object.entries(params)) {
    if (rawValues === undefined) continue;
    const values = Array.isArray(rawValues) ? rawValues : [rawValues];
    if (values.length === 0) continue;
    for (const raw of values) {
      let value = String(raw);
      if (key === 'quarter') {
        // Accept either "Q1" style or plain number
        const quarterNumber = value.startsWith('Q') ? value.replace('Q', '') : value;
        const quarterInt = parseInt(quarterNumber);
        if (!Number.isNaN(quarterInt) && quarterInt >= 1 && quarterInt <= 4) {
          searchParams.append(key, String(quarterInt));
          console.log(`Added quarter: ${quarterInt}`);
        } else {
          console.warn(`Invalid quarter value: ${value}`);
        }
      } else {
        searchParams.append(key, value);
        console.log(`Added ${key}: ${value}`);
      }
    }
  }
 
  const queryString = searchParams.toString();
  console.log('buildQuery output:', queryString);
  return queryString;
}