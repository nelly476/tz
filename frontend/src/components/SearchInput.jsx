import { useEffect } from 'react';

export function SearchInput({
  placeholder = 'Поиск…',
  delay = 400,             // дебаунс в мс
  onSearch,                // (query: string) => void
  autoFocus = false,
  searchVal, 
  setSearchVal
}) {

  // Дебаунс через setTimeout
  useEffect(() => {
    const id = setTimeout(() => {
      onSearch?.(searchVal.trim());
    }, delay);
    return () => clearTimeout(id);
  }, [searchVal, delay, onSearch]);

  const clear = () => {
    setSearchVal('');
    onSearch?.('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(searchVal.trim());
    }
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      maxWidth: 420
    }}>
      <input
        type="search"
        value={searchVal}
        onChange={(e) => setSearchVal(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Поиск"
        style={{
          flex: 1,
          padding: '10px 36px 10px 12px',
          borderRadius: 10,
          border: '1px solid #d0d7de',
          outline: 'none',
        }}
      />
      {searchVal && (
        <button
          type="button"
          onClick={clear}
          aria-label="Очистить"
          title="Очистить"
          style={{
            position: 'absolute',
            right: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
          }}
        >
        </button>
      )}
    </div>
  );
}
