import { memo, useState, useCallback } from "react";
import styles from "./user.module.css";
import { useHomeContext } from "../homeComponent/HomeComponent";

const Search = () => {
  const { search } = useHomeContext();
  const [searchValue, setSearchValue] = useState("");

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleSearch = useCallback(
    debounce((value) => search(value), 300),
    [search]
  );

  const handleInput = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchValue(value);
      handleSearch(value);
    },
    [handleSearch]
  );

  return (
    <div className={styles.searchEl}>
      <input
        type="search"
        placeholder="Search"
        name="search"
        value={searchValue}
        onChange={handleInput}
      />
    </div>
  );
};

export default memo(Search);
