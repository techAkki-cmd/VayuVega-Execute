  import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
  import React, { useEffect, useState } from "react";
  import { Routes, Route, useNavigate, useParams } from "react-router-dom";
  import DashboardLayout from "../components/DashboardLayout.jsx";
  import { Button } from "@/components/ui/button.jsx";
  import { supabase } from "@/lib/supabase";
  import axios from "axios";

  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
  import { BarChart as BarChartIcon, LineChart, Pencil, ChevronDown, ChevronUp, ArrowLeft, Star, ThumbsUp, ThumbsDown } from "lucide-react";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { toast } from "sonner";
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
  } from 'chart.js';
  import { Bar, Pie } from 'react-chartjs-2';

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
  );

  // Mock sentiment data
  const mockSentimentData = {
    "products": [
      {
        "_id": "97HJWQ8347SDFG",
        "product_name": "Smart X Fit",
        "positive_count": 640,
        "negative_count": 160,
        "neutral_count": 200,
        "positive": {
          "features": ["Battery Life", "Comfort", "Price"],
          "counts": [230, 190, 150]
        },
        "negative": {
          "features": ["Build Quality", "Accuracy", "App Sync"],
          "counts": [60, 55, 45]
        },
        "competitor_analysis": [
          {
            "product_name": "Smart X Fit",
            "ratings": [
              { "stars": 1, "amount": 30 },
              { "stars": 2, "amount": 55 },
              { "stars": 3, "amount": 110 },
              { "stars": 4, "amount": 250 },
              { "stars": 5, "amount": 455 }
            ],
            "filters": [
              { "label": "Battery Life", "count": 290 },
              { "label": "Comfort", "count": 260 },
              { "label": "Price", "count": 230 },
              { "label": "Accuracy", "count": 180 },
              { "label": "Build Quality", "count": 150 },
              { "label": "App Sync", "count": 140 }
            ]
          },
          {
            "product_name": "FitBand Pro",
            "ratings": [
              { "stars": 1, "amount": 40 },
              { "stars": 2, "amount": 70 },
              { "stars": 3, "amount": 130 },
              { "stars": 4, "amount": 280 },
              { "stars": 5, "amount": 400 }
            ]
          },
          {
            "product_name": "ActiveFit 3",
            "ratings": [
              { "stars": 1, "amount": 25 },
              { "stars": 2, "amount": 45 },
              { "stars": 3, "amount": 120 },
              { "stars": 4, "amount": 290 },
              { "stars": 5, "amount": 410 }
            ]
          }
        ],
        "reviews": [
          {
            "review": "Battery lasts much longer than expected. Great value for money!",
            "sentiment": "positive",
            "confidence": 0.92
          },
          {
            "review": "Comfortable to wear all day, but the step count accuracy seems a bit off.",
            "sentiment": "neutral",
            "confidence": 0.80
          },
          {
            "review": "The app frequently disconnects, making it unreliable for tracking workouts.",
            "sentiment": "negative",
            "confidence": 0.87
          },
          {
            "review": "Very stylish and lightweight. I love the display quality.",
            "sentiment": "positive",
            "confidence": 0.94
          },
          {
            "review": "Build quality isn't great. Mine developed scratches within a week.",
            "sentiment": "negative",
            "confidence": 0.85
          }
        ]
      }
    ]
  }
  

  // Dashboard home component
  const DashboardHome = () => {
    const { user } = useSupabaseAuth();
    return (
      <div>
        <h2 className="text-2xl font-semibold">Hello {user?.email || "User"}</h2>
        <p className="mt-2">Welcome to your dashboard</p>
      </div>
    );
  };

  // Products component
  const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const navigate = useNavigate();
    const [newProduct, setNewProduct] = useState({
      p_name: '',
      p_description: '',
      p_price: ''
    });

    useEffect(() => {
      fetchProducts();
    }, []);

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) throw error;
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewProduct(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleAddProduct = async (productData) => {
      try {
        // First, call the AI service to register the product
        console.log("Passing to /addproduct", productData);
        const aiResponse = await fetch(`${import.meta.env.VITE_AI_URL}/add-product`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            product_name: productData.p_name,
          })
        });

        if (!aiResponse.ok) {
          throw new Error('Failed to register product with AI service');
        }

        const aiData = await aiResponse.json();
        const aiProductId = aiData.product_id; // Get the product ID from AI service

        // Then add to Supabase with both original data and AI product ID
        const { data, error } = await supabase
          .from('products')
          .insert({
            ...productData,
            p_id: aiProductId // Store the AI-provided product ID
          })
          .select()
          .single();

        if (error) throw error;

        setProducts(prevProducts => [...prevProducts, data]);
        setIsDialogOpen(false);
        toast.success('Product added successfully!');
      } catch (err) {
        console.error('Error adding product:', err);
        toast.error('Failed to add product');
      }
    };

    if (loading) return <div>Loading products...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Products</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                // Validate price is a number
                const price = parseFloat(newProduct.p_price);
                if (isNaN(price)) {
                  toast.error("Price must be a valid number");
                  return;
                }
                handleAddProduct(newProduct);
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p_name">Product Name</Label>
                  <Input
                    id="p_name"
                    name="p_name"
                    value={newProduct.p_name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p_description">Description</Label>
                  <Input
                    id="p_description"
                    name="p_description"
                    value={newProduct.p_description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p_price">Price</Label>
                  <Input
                    id="p_price"
                    name="p_price"
                    type="number"
                    step="0.01"
                    value={newProduct.p_price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Product
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{product.p_name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.p_description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-2xl font-bold text-primary">
                  ${product.p_price}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/dashboard/products/${product.id}`)}
                  className="flex items-center gap-2"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Individual Product Analytics Component
  const ProductAnalytics = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sentimentData, setSentimentData] = useState(null);
    const [selectedCompetitor, setSelectedCompetitor] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          // First try to get the product from Supabase
          const { data: supabaseProduct, error: supabaseError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

          if (supabaseError) throw supabaseError;
          setProduct(supabaseProduct);

          // Use p_id for sentiment analysis
          if (!supabaseProduct.p_id) {
            throw new Error('Product not registered with AI service');
          }

          // First, send reviews for analysis one by one
          const reviewsForAnalysis = (supabaseProduct.p_reviews || []).map(review => ({
            product_id: supabaseProduct.p_id,
            review: review.review
          }));

          if (reviewsForAnalysis.length > 0) {
            console.log('Starting analysis of reviews:', reviewsForAnalysis.length);
            setLoading(true);

            // Process reviews sequentially
            for (const reviewData of reviewsForAnalysis) {
              try {
                console.log('Analyzing review:', reviewData);
                const response = await fetch(`${import.meta.env.VITE_AI_URL}/analyze-feedback`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                  },
                  body: JSON.stringify(reviewData)
                });

                if (!response.ok) {
                  console.error('Error analyzing review:', reviewData);
                  continue;
                }

                const result = await response.json();
                console.log('Review analysis result:', result);

                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (reviewError) {
                console.error('Error processing review:', reviewError);
              }
            }
          }

          // Then, fetch the analyzed sentiment data using p_id
          try {
            const sentimentResponse = await axios.get(
              `${import.meta.env.VITE_AI_URL}/product-sentiment/${supabaseProduct.p_id}`,
              {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'ngrok-skip-browser-warning': 'true'
                }
              }
            );

            // Transform API data to match our component's expected format
            const transformedSentimentData = {
              _id: productId,
              product_name: sentimentResponse.data.product_name,
              positive_count: sentimentResponse.data.positive_count,
              negative_count: sentimentResponse.data.negative_count,
              neutral_count: sentimentResponse.data.neutral_count,
              positive: sentimentResponse.data.positive,
              negative: sentimentResponse.data.negative,
              competitor_analysis: sentimentResponse.data.competitor_analysis,
              reviews: sentimentResponse.data.reviews || sentimentResponse.data.summaries?.map(summary => ({
                review: summary.summary,
                sentiment: summary.sentiment,
                confidence: 1.0
              })) || []
            };

            setSentimentData(transformedSentimentData);

          } catch (apiError) {
            // Fallback to mock data on error
            const mockProduct = mockSentimentData.products.find(p => 
              p.product_name.toLowerCase() === product?.p_name?.toLowerCase()
            ) || mockSentimentData.products[0];
            
            setSentimentData(mockProduct);
          }

        } catch (apiError) {
          console.error('Error with AI analysis:', apiError);
          // Fallback to mock data on error
          const mockProduct = mockSentimentData.products.find(p => 
            p.product_name.toLowerCase() === product?.p_name?.toLowerCase()
          ) || mockSentimentData.products[0];  // Use first mock product as default fallback
          
          setSentimentData(mockProduct);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [productId]);

    const getCompetitorChartData = () => {
      if (!sentimentData?.competitor_analysis) return null;

      const competitors = sentimentData.competitor_analysis
        .filter(c => c.ratings && c.ratings.length > 0)
        .slice(0, 5);

      const labels = competitors.map(c => c.product_name.substring(0, 20) + '...');
      const ratings = competitors.map(c => {
        const totalRatings = c.ratings.reduce((acc, r) => acc + r.amount, 0);
        const weightedSum = c.ratings.reduce((acc, r) => acc + (r.stars * r.amount), 0);
        return totalRatings > 0 ? (weightedSum / totalRatings).toFixed(1) : 0;
      });

      return {
        labels,
        datasets: [
          {
            label: 'Average Rating',
            data: ratings,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
    };

    const getRatingDistributionData = (competitor) => {
      if (!competitor?.ratings) return null;

      return {
        labels: ['1★', '2★', '3★', '4★', '5★'],
        datasets: [
          {
            label: 'Number of Ratings',
            data: competitor.ratings.map(r => r.amount),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(255, 205, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(54, 162, 235, 0.5)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    };

    if (loading) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading product analytics...</div>
      </div>
    );
    
    if (!product || !sentimentData) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">No data available for this product</div>
      </div>
    );

    const competitorChartData = getCompetitorChartData();
    const selectedCompetitorData = selectedCompetitor ? 
      sentimentData?.competitor_analysis?.find(c => c.product_name === selectedCompetitor) : null;
    const ratingDistributionData = getRatingDistributionData(selectedCompetitorData);

    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard/analyze')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          <h2 className="text-2xl font-semibold">Analytics for {product.p_name}</h2>
        </div>

        <div className="grid gap-6">
          {/* Sentiment Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Overview</CardTitle>
              <CardDescription>Analysis of customer reviews and sentiments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Positive Reviews</CardTitle>
                    <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5" />
                      {sentimentData.positive_count}
                    </div>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Negative Reviews</CardTitle>
                    <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
                      <ThumbsDown className="h-5 w-5" />
                      {sentimentData.negative_count}
                    </div>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Neutral Reviews</CardTitle>
                    <div className="text-2xl font-bold text-gray-600">
                      {sentimentData.neutral_count}
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle>Key Features Analysis</CardTitle>
              <CardDescription>Most discussed features in reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-green-700">Positive Features</h3>
                  {sentimentData.positive.features.map((feature, index) => (
                    <div key={feature} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-700">{feature}</span>
                      <span className="text-sm text-green-600">Mentioned {sentimentData.positive.counts[index]} times</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-red-700">Negative Features</h3>
                  {sentimentData.negative.features.map((feature, index) => (
                    <div key={feature} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <span className="font-medium text-red-700">{feature}</span>
                      <span className="text-sm text-red-600">Mentioned {sentimentData.negative.counts[index]} times</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competitor Analysis */}
          {competitorChartData && (
            <Card>
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>Click on a competitor to see detailed rating distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar
                    data={competitorChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 5,
                          title: {
                            display: true,
                            text: 'Average Rating'
                          }
                        }
                      },
                      onClick: (event, elements) => {
                        if (elements.length > 0) {
                          const idx = elements[0].index;
                          setSelectedCompetitor(sentimentData.competitor_analysis[idx].product_name);
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rating Distribution */}
          {ratingDistributionData && (
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution for {selectedCompetitor}</CardTitle>
                <CardDescription>Breakdown of ratings from 1 to 5 stars</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar
                    data={ratingDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Reviews'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest customer feedback and sentiments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentimentData.reviews.map((review, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      review.sentiment === 'positive' ? 'bg-green-50 border-green-200' :
                      review.sentiment === 'negative' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className="text-sm mb-2">{review.review}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${
                        review.sentiment === 'positive' ? 'text-green-600' :
                        review.sentiment === 'negative' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                      </span>
                      <span className="text-gray-500">
                        Confidence: {Math.round(review.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Analyze Feedback component
  const AnalyzeFeedback = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      fetchProducts();
    }, []);

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) throw error;
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (loading) return <div>Loading products...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Products Analytics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{product.p_name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.p_description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-2xl font-bold text-primary">
                  ${product.p_price}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="default"
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => navigate(`/dashboard/analyze/${product.id}`)}
                >
                  <BarChartIcon className="h-4 w-4" />
                  View Analytics
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Product Details Component
  const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [newReview, setNewReview] = useState({
      username: '',
      stars: 5,
      review: ''
    });

    useEffect(() => {
      const fetchProductDetails = async () => {
        try {
          setLoading(true);
          // Fetch product details including reviews in a single query
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select(`
              *,
              p_reviews
            `)
            .eq('id', productId)
            .single();

          if (productError) throw productError;
          
          setProduct(productData);
          // Parse reviews if they exist, otherwise use empty array
          const productReviews = productData.p_reviews || [];
          console.log('Fetched reviews:', productReviews); // Debug log
          setReviews(productReviews);

        } catch (err) {
          console.error('Error fetching product details:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchProductDetails();
    }, [productId]);

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? (reviews.reduce((acc, review) => acc + review.stars, 0) / reviews.length).toFixed(1)
      : 0;

    // Group reviews by star rating
    const ratingCounts = reviews.reduce((acc, review) => {
      acc[review.stars] = (acc[review.stars] || 0) + 1;
      return acc;
    }, {});

    const handleReviewInputChange = (e) => {
      const { name, value } = e.target;
      setNewReview(prev => ({
        ...prev,
        [name]: name === 'stars' ? parseInt(value) : value
      }));
    };

    const handleReviewSubmit = async (e) => {
      e.preventDefault();
      try {
        if (!product) {
          toast.error("Product not found");
          return;
        }

        // Create the new review object
        const newReviewObj = {
          username: newReview.username,
          stars: parseInt(newReview.stars),
          review: newReview.review,
          product_id: productId,
          date: new Date().toISOString() // Add timestamp for sorting
        };

        // Get existing reviews and append new review
        const updatedReviews = [...(product.p_reviews || []), newReviewObj];

        // Update the product with new reviews array
        const { data, error: updateError } = await supabase
          .from('products')
          .update({ 
            p_reviews: updatedReviews 
          })
          .eq('id', productId)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        // Update local state with the returned data
        setProduct(data);
        setReviews(data.p_reviews);
        
        // Show success message
        toast.success("Review added successfully!");
        
        // Reset form and close dialog
        setNewReview({ username: '', stars: 5, review: '' });
        setIsReviewDialogOpen(false);

      } catch (err) {
        console.error('Error adding review:', err);
        toast.error(err.message || "Failed to add review");
      }
    };

    if (loading) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading product details...</div>
      </div>
    );

    if (error) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );

    if (!product) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Product not found</div>
      </div>
    );

    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          <h2 className="text-2xl font-semibold">{product.p_name}</h2>
        </div>

        <div className="grid gap-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{product.p_name}</CardTitle>
              <CardDescription className="text-lg mt-2">
                {product.p_description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${product.p_price}
              </div>
            </CardContent>
          </Card>

          {/* Product Reviews Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.floor(averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{averageRating} out of 5</span>
                    <span className="text-gray-500">({reviews.length} reviews)</span>
                  </CardDescription>
                </div>
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Write a Review</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Your Name</Label>
                        <Input
                          id="username"
                          name="username"
                          value={newReview.username}
                          onChange={handleReviewInputChange}
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stars">Rating</Label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview(prev => ({ ...prev, stars: star }))}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= newReview.stars
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="review">Your Review</Label>
                        <textarea
                          id="review"
                          name="review"
                          value={newReview.review}
                          onChange={handleReviewInputChange}
                          placeholder="Write your review here..."
                          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Post Review
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Rating Distribution */}
              <div className="space-y-2 mb-6">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <div className="w-12 text-sm">{stars} stars</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: reviews.length ? `${(ratingCounts[stars] || 0) / reviews.length * 100}%` : '0%'
                        }}
                      />
                    </div>
                    <div className="w-12 text-sm text-gray-500">
                      {ratingCounts[stars] || 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.username}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.stars
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.review}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No reviews yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const Dashboardpage = () => {
    return (
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/analyze" element={<AnalyzeFeedback />} />
          <Route path="/analyze/:productId" element={<ProductAnalytics />} />
        </Routes>
      </DashboardLayout>
    );
  };

  export default Dashboardpage;