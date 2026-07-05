export const getProjectInitials = (title: string) => {
  if (!title) return "P"; // Fallback if name is empty

  return title
    .split(" ") // Split the name into an array of words
    .map((word) => word[0]) // Take the first letter of each word
    .join("") // Combine them back together
    .toUpperCase() // Make them capitalized
    .slice(0, 2); // Limit it to a maximum of 2 letters
};
