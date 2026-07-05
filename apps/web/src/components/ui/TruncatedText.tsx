interface TruncatedTextProps {
  text: string | undefined | null;
  maxLength?: number; // Optional limit to force cut off text early
  className?: string; // Lets you pass down custom Tailwind text sizes or colors
}

export function TruncatedText({
  text,
  maxLength = 50,
  className = "",
}: TruncatedTextProps) {
  if (!text) return null;

  // 1. Clean the string up
  const cleanedText = text.trim();

  // 2. Check if the text is considered "too long"
  const isTooLong = cleanedText.length > maxLength;

  return (
    <span
      // 3. The native HTML 'title' attribute creates a clean browser tooltip on hover
      title={isTooLong ? cleanedText : undefined}
      className={`truncate block ${className}`}
    >
      {cleanedText}
    </span>
  );
}
