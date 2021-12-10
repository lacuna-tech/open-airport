const escapeCsvEntry = (entry: string): string => {
  const escapedEntry = entry.replace(/"/g, '""').replace(/\n/g, '\\n')
  return `"${escapedEntry}"`
}

const serializeCsvEntry = (value: unknown): string => {
  const serializedEntry = typeof value === 'string' ? value : JSON.stringify(value)
  return escapeCsvEntry(serializedEntry)
}

export const stringifyCsv = <Key extends string>(headers: Key[], rows: Array<Record<Key, unknown>>): Blob => {
  if (headers.length === 0) {
    throw new Error('no headers were passed, which would generate an empty CSV')
  }

  let csvData = headers.map(escapeCsvEntry).join(',')
  const [firstColumn, ...restOfColumns] = headers
  for (const row of rows) {
    let csvRow: string = serializeCsvEntry(row[firstColumn])
    for (const col of restOfColumns) {
      const entry = row[col]
      csvRow += `,${serializeCsvEntry(entry)}`
    }
    csvData += `\n${csvRow}`
  }
  return new Blob([csvData], { type: 'text/csv' })
}
