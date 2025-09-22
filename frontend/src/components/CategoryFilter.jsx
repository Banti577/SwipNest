import { useEffect, useState } from "react";
import styles from "./CategoryFilter.module.css";

function CategoryFilter({ onCategorySelect, className }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${BASE_URL}/video/categories`, {
          credentials: "include",
        });
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, []);

  const handleSelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === "releted") {
      onCategorySelect(null, true);
    } else {
      onCategorySelect(cat, false);
    }
  };

  return (
    <div className={styles.categoryFilterWrapper}>
      <div className={`${styles.categoryFilter} ${className}`}>
        <button
          className={`${styles.button} ${selectedCategory === "" ? styles.active : ""}`}
          onClick={() => handleSelect("")}
        >
          All
        </button>

        <button
          className={`${styles.button} ${selectedCategory === "releted" ? styles.active : ""}`}
          onClick={() => handleSelect("releted")}
        >
          Releted
        </button>

        {categories?.map((cat) => (
          <button
            key={cat._id || cat}
            className={`${styles.button} ${selectedCategory === (cat.name || cat) ? styles.active : ""}`}
            onClick={() => handleSelect(cat.name || cat)}
          >
            {cat.name || cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryFilter;
