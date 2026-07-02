import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProductCard from './ProductCard';

interface MessageRendererProps {
  content: string;
  productCards: any[];
}

export default function MessageRenderer({ content, productCards }: MessageRendererProps) {
  // Regex to match <data-cb...>...</data-cb> or <product...></product> or <product.../>
  const tagRegex = /(<data-cb[\s\S]*?<\/data-cb>|<product[\s\S]*?<\/product>|<product[\s\S]*?\/>)/gi;
  
  const parts = content.split(tagRegex);
  
  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (!part) return null;
        
        // If it's a matched tag
        if (part.toLowerCase().startsWith('<data-cb') || part.toLowerCase().startsWith('<product')) {
          let product = null;
          
          // Try to extract product_id or id
          const pidMatch = part.match(/product_id="([^"]+)"/i) || part.match(/id="([^"]+)"/i);
          if (pidMatch) {
            const pid = pidMatch[1];
            for (const card of productCards) {
              const p = card.products?.find((p: any) => p.product_id === pid || p.id === pid);
              if (p) {
                product = p;
                break;
              }
            }
          }
          
          // If not found by product_id, try card_id
          if (!product) {
            const cidMatch = part.match(/card_id="([^"]+)"/i);
            if (cidMatch) {
              const cid = parseInt(cidMatch[1], 10);
              // Assuming card_id corresponds to 1-based index in productCards
              const card = productCards[cid - 1];
              if (card && card.products && card.products.length > 0) {
                product = card.products[0];
              }
            }
          }
          
          if (product) {
            return <ProductCard key={index} product={product} />;
          }
          
          // If product not found, you can return a placeholder or nothing
          // return <div key={index} className="text-xs text-zinc-400 italic">[商品卡片占位: 缺少数据]</div>;
          return null;
        }
        
        // It's normal text, render as markdown
        return (
          <div key={index} className="prose prose-sm prose-zinc max-w-none text-[13px] leading-relaxed text-zinc-700 prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-li:my-1 prose-strong:text-zinc-900 prose-strong:font-bold">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {part}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}
