import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, retailer = 'walmart' } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let products = [];

    if (retailer === 'walmart') {
      const WALMART_API_KEY = Deno.env.get('WALMART_API_KEY');
      
      if (!WALMART_API_KEY) {
        console.error('Missing Walmart API key');
        return new Response(
          JSON.stringify({ error: 'Walmart API not configured' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Searching Walmart for:', query);
      
      const walmartUrl = `https://developer.api.walmart.com/api-proxy/service/affil/product/v2/search?query=${encodeURIComponent(query)}&format=json&categoryId=976759`;
      
      const response = await fetch(walmartUrl, {
        headers: {
          'WM_SEC.ACCESS_TOKEN': WALMART_API_KEY,
        }
      });

      if (response.ok) {
        const data = await response.json();
        products = data.items?.slice(0, 10).map((item: any) => ({
          id: item.itemId,
          name: item.name,
          brand: item.brandName || 'Unknown',
          price: item.salePrice || item.msrp,
          image: item.mediumImage || item.thumbnailImage,
          retailer: 'Walmart',
          upc: item.upc,
          category: item.categoryPath,
          url: item.productUrl
        })) || [];
      }
    }

    // If no products found or retailer not supported, return sample data
    if (products.length === 0) {
      products = [
        {
          id: 'sample-1',
          name: `${query} - Sample Product`,
          brand: 'Sample Brand',
          price: 2.99,
          image: null,
          retailer: 'Sample Store',
          upc: '123456789012',
          category: 'Food & Grocery',
          url: '#'
        }
      ];
    }

    return new Response(
      JSON.stringify({ products }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in search-products function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});