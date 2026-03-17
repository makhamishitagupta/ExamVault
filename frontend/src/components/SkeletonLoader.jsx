// Card Skeleton Loader
export const SkeletonCardLoader = () => (
  <div className="bg-gray-900/50 border-2 border-gray-800 rounded-2xl p-6 animate-pulse">
    {/* Image Skeleton */}
    <div className="w-full h-48 bg-gray-800 rounded-xl mb-4"></div>
    
    {/* Title Skeleton */}
    <div className="h-5 bg-gray-800 rounded-full w-3/4 mb-3"></div>
    
    {/* Subtitle Skeleton */}
    <div className="h-4 bg-gray-800 rounded-full w-1/2 mb-4"></div>
    
    {/* Tags Skeleton */}
    <div className="flex gap-2 mb-4">
      <div className="h-6 bg-gray-800 rounded-full w-16"></div>
      <div className="h-6 bg-gray-800 rounded-full w-20"></div>
      <div className="h-6 bg-gray-800 rounded-full w-14"></div>
    </div>
    
    {/* Button Skeleton */}
    <div className="h-10 bg-gray-800 rounded-full w-full"></div>
  </div>
);

// Grid Skeleton Loader (3 columns)
export const SkeletonGridLoader = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCardLoader key={i} />
    ))}
  </div>
);

// Profile Header Skeleton
export const SkeletonProfileHeader = () => (
  <div className="bg-gray-900/50 border-2 border-gray-800 rounded-2xl p-8 animate-pulse">
    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
      {/* Avatar Skeleton */}
      <div className="w-32 h-32 bg-gray-800 rounded-2xl flex-shrink-0"></div>
      
      {/* Info Skeleton */}
      <div className="flex-1 w-full">
        {/* Name Skeleton */}
        <div className="h-8 bg-gray-800 rounded-full w-48 mb-3"></div>
        
        {/* Username Skeleton */}
        <div className="h-5 bg-gray-800 rounded-full w-32 mb-3"></div>
        
        {/* Email Skeleton */}
        <div className="h-4 bg-gray-800 rounded-full w-56 mb-4"></div>
        
        {/* Role Badge Skeleton */}
        <div className="h-8 bg-gray-800 rounded-full w-24"></div>
      </div>
    </div>
  </div>
);

// Tab Button Skeleton
export const SkeletonTabLoader = () => (
  <div className="flex gap-3 mb-8 animate-pulse">
    <div className="h-10 bg-gray-800 rounded-full w-24"></div>
    <div className="h-10 bg-gray-800 rounded-full w-20"></div>
  </div>
);
