import React from 'react';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatSales = (num: number) => {
    if (!num) return '0';
    if (num > 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万+';
    return num.toString();
  };

  const positiveRatio = product.positive_ratio 
    ? product.positive_ratio.toFixed(0) + '%' 
    : '暂无';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden my-4">
      <div className="p-3 flex items-start space-x-3">
        {/* 商品图片 */}
        <div className="w-[88px] h-[88px] shrink-0 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center">
          {product.product_image_url ? (
            <img 
              src={product.product_image_url} 
              alt="product" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-zinc-300 text-xs">无图</span>
          )}
        </div>
        
        {/* 商品信息 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h4 className="text-sm font-bold text-zinc-800 leading-snug line-clamp-2 mb-1.5">
              {product.detailed_title || product.title || '未知商品'}
            </h4>
            
            <div className="flex items-center text-[11px] text-zinc-400 mb-1">
              {product.sales > 0 && <span>店铺已售{formatSales(product.sales)}</span>}
              {product.sales > 0 && <span className="mx-1.5 opacity-50">|</span>}
              <span>店铺好评率 {positiveRatio}</span>
            </div>
          </div>
          
          <div className="flex items-end justify-between mt-2">
            <div className="flex items-baseline text-red-500">
              <span className="text-[10px] font-bold mr-0.5">¥</span>
              <span className="text-lg font-bold leading-none">{product._price || product.price || '?'}</span>
            </div>
            <div className="text-[11px] text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded-sm">
              已售 {formatSales(product.sales)}
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部按钮 */}
      <div className="border-t border-zinc-50 py-2.5 flex justify-center items-center text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer transition-colors bg-zinc-50/50">
        查看更多商品 &gt;
      </div>
    </div>
  );
}
