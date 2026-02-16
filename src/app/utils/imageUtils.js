/**
 * Utility functions for handling images in the application
 */

const BASE_DOMAIN = "https://api.flow108.in";

/**
 * Converts relative image URLs to absolute URLs and handles edge cases
 * @param {string} url - The image URL (can be relative or absolute)
 * @returns {string} - The processed image URL
 */
export const getImageUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGY5ZmEiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjZTllY2VmIiBzdHJva2U9IiNkZWUyZTYiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIyMCIgZmlsbD0iI2FkYjViZCIvPjxwYXRoIGQ9Ik03MCAxMjAgUTEwMCAxMDAgMTMwIDEyMCBRMTMwIDE0MCAxMDAgMTUwIFE3MCAxNDAgNzAgMTIwIFoiIGZpbGw9IiNhZGI1YmQiLz48dGV4dCB4PSIxMDAiIHk9IjE4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZjNzU3ZCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
  }

  // If already absolute URL, return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Convert relative URL to absolute
  if (url.startsWith('/')) {
    return BASE_DOMAIN + url;
  }

  // If it's a relative path without leading slash, add it
  return BASE_DOMAIN + '/' + url;
};

/**
 * Creates an image element with proper error handling
 * @param {Object} props - Image props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text
 * @param {string} props.className - CSS classes
 * @param {Object} props.style - Inline styles
 * @param {Function} props.onError - Custom error handler
 * @returns {JSX.Element} - Image element with error handling
 */
export const createImageWithFallback = ({
  src,
  alt = "",
  className = "",
  style = {},
  onError,
  ...otherProps
}) => {
  const handleError = (e) => {
    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGY5ZmEiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjZTllY2VmIiBzdHJva2U9IiNkZWUyZTYiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIyMCIgZmlsbD0iI2FkYjViZCIvPjxwYXRoIGQ9Ik03MCAxMjAgUTEwMCAxMDAgMTMwIDEyMCBRMTMwIDE0MCAxMDAgMTUwIFE3MCAxNDAgNzAgMTIwIFoiIGZpbGw9IiNhZGI1YmQiLz48dGV4dCB4PSIxMDAiIHk9IjE4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZjNzU3ZCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
    if (onError) onError(e);
  };

  return (
    <img
      src={getImageUrl(src)}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      {...otherProps}
    />
  );
};

/**
 * Checks if a given URL or filename represents a video file
 * @param {string} url - The URL or filename to check
 * @returns {boolean} - True if it's a video file
 */
export const isVideoFile = (url) => {
  if (!url || typeof url !== 'string') return false;

  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
  const lowerUrl = url.toLowerCase();

  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

/**
 * Checks if a given URL or filename represents an audio file
 * @param {string} url - The URL or filename to check
 * @returns {boolean} - True if it's an audio file
 */
export const isAudioFile = (url) => {
  if (!url || typeof url !== 'string') return false;

  const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.wma'];
  const lowerUrl = url.toLowerCase();

  return audioExtensions.some(ext => lowerUrl.includes(ext));
};

/**
 * Processes workout data to ensure image URLs are properly formatted
 * @param {Object|Array} data - Workout data (single object or array)
 * @returns {Object|Array} - Processed data with formatted image URLs
 */
export const processWorkoutImages = (data) => {
  if (!data) return data;

  const processItem = (item) => {
    if (!item) return item;

    const processed = { ...item };
    if (item.Image) {
      processed.Image = getImageUrl(item.Image);
    }
    return processed;
  };

  if (Array.isArray(data)) {
    return data.map(processItem);
  }

  return processItem(data);
};
