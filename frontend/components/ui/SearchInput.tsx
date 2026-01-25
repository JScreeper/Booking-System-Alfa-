'use client';

import { useState } from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  className?: string;
}

export default function SearchInput({
  placeholder = 'Search...',
  onSearch,
  className = '',
}: SearchInputProps) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  return (
    <div className={`${styles.searchWrapper} ${className}`}>
      <span className={styles.searchIcon}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      {value && (
        <button
          onClick={() => {
            setValue('');
            onSearch('');
          }}
          className={styles.clearButton}
        >
          ×
        </button>
      )}
    </div>
  );
}
