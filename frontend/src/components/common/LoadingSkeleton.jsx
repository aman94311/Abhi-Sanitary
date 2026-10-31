import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs animate-pulse flex flex-col justify-between">
    <div className="w-full aspect-square bg-slate-200 rounded-xl mb-3"></div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 rounded-md w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
      <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
      <div className="h-5 bg-slate-200 rounded-md w-1/3 pt-1"></div>
    </div>
    <div className="h-9 bg-slate-200 rounded-xl mt-4"></div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default ProductCardSkeleton;
