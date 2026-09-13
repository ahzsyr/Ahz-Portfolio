import React from "react";

const CategoryChip = ({ category, onClick, allActive, active }) => {
  const isActive = Boolean(active || allActive);
  const styles = {
    active:
      "px-4 py-2 rounded-full text-white bg-[var(--color-brand)] font-bold text-sm flex align-center w-max cursor-pointer transition duration-300 ease focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]",
    inactive:
      "px-4 py-2 rounded-full text-gray-600 bg-gray-200 font-semibold text-sm flex align-center w-max cursor-pointer transition duration-300 ease hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]",
  };

  return (
    <button type="button" onClick={onClick} className={isActive ? styles.active : styles.inactive}>
      {category}
    </button>
  );
};

export default CategoryChip;
