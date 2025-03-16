import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, AreaChart, Area, Cell } from 'recharts'
import { Loader2, TrendingUp, ThumbsUp, ThumbsDown, Minus, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

// Create chart components based on shadcn pattern
const ChartConfig = {
  positive: {
    label: "Positive",
    color: "hsl(var(--chart-1))",
  },
  negative: {
    label: "Negative",
    color: "hsl(var(--chart-2))",
  },
  neutral: {
    label: "Neutral",
    color: "hsl(var(--chart-3))",
  },
  mentions: {
    label: "Mentions",
    color: "hsl(var(--chart-4))",
  },
  importance: {
    label: "Importance Score",
    color: "hsl(var(--chart-5))",
  }
}

const ChartContainer = ({ children, config, className }) => {
  // Create CSS variables for chart colors
  const style = Object.entries(config || {}).reduce((acc, [key, value]) => {
    if (value.color) {
      acc[`--color-${key}`] = value.color;
    }
    return acc;
  }, {});

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

const ChartTooltipContent = ({ active, payload, label, indicator = "dashed", hideLabel = false }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      {!hideLabel && <div className="font-medium">{label}</div>}
      <div className="flex flex-col gap-1 pt-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="size-2 rounded-full" 
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="font-medium">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SingleProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // In a real app, replace this with an actual API call
        // const response = await axios.get(`/api/products/${id}`);
        
        // Simulate API call with mock data
        // Check if ID is valid (for demo purposes)
        if (id !== 'P12345') {
          toast.error('Product not found with the specified ID');
          navigate('/dashboard'); // Redirect to dashboard
          return;
        }
        
        // Mock data - in real app this would come from the API
        const mockData = {
          "product_id": "P12345",
          "product_name": "Smartphone X",
          "feedback_summary": {
            "positive": [
              "Battery life is great and lasts all day.",
              "The display is sharp and bright.",
              "Performance is smooth with no lag."
            ],
            "negative": [
              "Battery drains quickly while gaming.",
              "Charging takes longer than expected.",
              "The camera struggles in low light."
            ],
            "neutral": [
              "The design is okay, nothing special."
            ]
          },
          "sentiment_distribution": {
            "positive": 65,
            "negative": 25,
            "neutral": 10
          },
          "features": [
            {
              "feature": "Battery",
              "positive": [
                "Battery life is great and lasts all day."
              ],
              "negative": [
                "Battery drains quickly while gaming.",
                "Charging takes longer than expected."
              ],
              "sentiment_score": {
                "positive": 55,
                "negative": 45
              }
            },
            {
              "feature": "Display",
              "positive": [
                "The display is sharp and bright."
              ],
              "negative": [
                "Screen scratches easily."
              ],
              "sentiment_score": {
                "positive": 70,
                "negative": 30
              }
            },
            {
              "feature": "Camera",
              "positive": [
                "Great photos in daylight."
              ],
              "negative": [
                "The camera struggles in low light."
              ],
              "sentiment_score": {
                "positive": 60,
                "negative": 40
              }
            }
          ],
          "feature_importance": [
            {
              "feature": "Battery",
              "mentions": 120,
              "importance_score": 80
            },
            {
              "feature": "Camera",
              "mentions": 100,
              "importance_score": 75
            },
            {
              "feature": "Display",
              "mentions": 90,
              "importance_score": 65
            }
          ],
          "competitor_analysis": {
            "Battery": [
              {
                "product_name": "Smartphone X",
                "positive": 55,
                "negative": 45
              },
              {
                "product_name": "Smartphone Y (Competitor A)",
                "positive": 60,
                "negative": 40
              },
              {
                "product_name": "Smartphone Z (Competitor B)",
                "positive": 50,
                "negative": 50
              }
            ],
            "Camera": [
              {
                "product_name": "Smartphone X",
                "positive": 60,
                "negative": 40
              },
              {
                "product_name": "Smartphone Y (Competitor A)",
                "positive": 65,
                "negative": 35
              },
              {
                "product_name": "Smartphone Z (Competitor B)",
                "positive": 55,
                "negative": 45
              }
            ]
          }
        };

        setProduct(mockData);
        toast.success('Product data loaded successfully');
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-xl">Loading product data...</p>
      </div>
    );
  }

  if (!product) return null;

  // Prepare data for the sentiment pie chart
  const sentimentData = [
    { name: "Positive", value: product.sentiment_distribution.positive, fill: "var(--color-positive)" },
    { name: "Negative", value: product.sentiment_distribution.negative, fill: "var(--color-negative)" },
    { name: "Neutral", value: product.sentiment_distribution.neutral, fill: "var(--color-neutral)" }
  ];
  
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  // Prepare data for the feature importance chart
  const featureImportanceData = product.feature_importance.map(item => ({
    name: item.feature,
    mentions: item.mentions,
    importance: item.importance_score
  }));

  // Total sentiment calculation
  const totalSentiment = sentimentData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{product.product_name}</h1>
            <Badge variant="outline" className="ml-2">ID: {product.product_id}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
              Positive: {product.sentiment_distribution.positive}%
            </Badge>
            <Badge variant="destructive" className="bg-destructive/20 text-destructive hover:bg-destructive/30">
              Negative: {product.sentiment_distribution.negative}%
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" /> Sentiment Analysis
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> Feedback Data
          </Badge>
        </div>
      </div>

      {/* Overview Section - Two Cards Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Sentiment Overview */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sentiment Overview</CardTitle>
                <CardDescription>Customer feedback distribution</CardDescription>
              </div>
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ChartConfig} className="mx-auto aspect-square max-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x="50%"
                        y="50%"
                        className="fill-foreground text-xl font-bold"
                      >
                        {totalSentiment}
                      </tspan>
                      <tspan
                        x="50%"
                        y="50%"
                        dy="1.5em"
                        className="fill-muted-foreground text-xs"
                      >
                        Total
                      </tspan>
                    </text>
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <div className="mt-2 grid grid-cols-3 gap-1">
              <div className="flex flex-col items-center p-2 rounded-md bg-primary/5">
                <div className="flex items-center gap-1 text-sm mb-1">
                  <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-1))]" />
                  <span className="font-medium">Positive</span>
                </div>
                <span className="text-lg font-bold">{product.sentiment_distribution.positive}%</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-md bg-destructive/5">
                <div className="flex items-center gap-1 text-sm mb-1">
                  <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />
                  <span className="font-medium">Negative</span>
                </div>
                <span className="text-lg font-bold">{product.sentiment_distribution.negative}%</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
                <div className="flex items-center gap-1 text-sm mb-1">
                  <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-3))]" />
                  <span className="font-medium">Neutral</span>
                </div>
                <span className="text-lg font-bold">{product.sentiment_distribution.neutral}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Feedback Summary</CardTitle>
            <CardDescription>Key points from customer reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="positive">
              <TabsList className="w-full">
                <TabsTrigger value="positive" className="flex-1">
                  <ThumbsUp className="h-3.5 w-3.5 mr-1.5" /> Positive
                </TabsTrigger>
                <TabsTrigger value="negative" className="flex-1">
                  <ThumbsDown className="h-3.5 w-3.5 mr-1.5" /> Negative
                </TabsTrigger>
                <TabsTrigger value="neutral" className="flex-1">
                  <Minus className="h-3.5 w-3.5 mr-1.5" /> Neutral
                </TabsTrigger>
              </TabsList>
              <div className="mt-3 h-[208px] overflow-y-auto">
                <TabsContent value="positive" className="mt-0">
                  <ul className="space-y-2">
                    {product.feedback_summary.positive.map((feedback, index) => (
                      <li key={index} className="flex items-start border-l-2 border-primary/50 pl-3 py-1">
                        <span>{feedback}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="negative" className="mt-0">
                  <ul className="space-y-2">
                    {product.feedback_summary.negative.map((feedback, index) => (
                      <li key={index} className="flex items-start border-l-2 border-destructive/50 pl-3 py-1">
                        <span>{feedback}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="neutral" className="mt-0">
                  <ul className="space-y-2">
                    {product.feedback_summary.neutral.map((feedback, index) => (
                      <li key={index} className="flex items-start border-l-2 border-muted-foreground/50 pl-3 py-1">
                        <span>{feedback}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Feature Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Feature Analysis</CardTitle>
          <CardDescription>Sentiment breakdown by product feature</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.features.map((feature, index) => (
              <div key={index} className="border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">{feature.feature}</h3>
                  <Badge variant={feature.sentiment_score.positive > 60 ? "outline" : "secondary"} className="text-xs">
                    {feature.sentiment_score.positive > 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1 text-xs font-medium">
                    <span className="text-primary">{feature.sentiment_score.positive}%</span>
                    <span className="text-destructive">{feature.sentiment_score.negative}%</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary"
                      style={{ width: `${feature.sentiment_score.positive}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm mb-1">
                      <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">Positive</span>
                    </div>
                    <ul className="text-xs pl-5 list-disc space-y-1">
                      {feature.positive.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5 text-sm mb-1">
                      <ThumbsDown className="h-3.5 w-3.5 text-destructive" />
                      <span className="font-medium">Negative</span>
                    </div>
                    <ul className="text-xs pl-5 list-disc space-y-1">
                      {feature.negative.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Importance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Feature Importance</CardTitle>
          <CardDescription>Most discussed features in customer feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ChartConfig} className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportanceData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="var(--color-mentions)" />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-importance)" />
                <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'var(--muted)', opacity: 0.1}} />
                <Legend />
                <Bar yAxisId="left" dataKey="mentions" name="Mentions" fill="var(--color-mentions)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="importance" name="Importance Score" fill="var(--color-importance)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm border-t pt-4">
          <div className="flex gap-2 font-medium leading-none">
            <TrendingUp className="h-4 w-4 text-primary" /> Battery is the most discussed feature
          </div>
          <div className="leading-none text-muted-foreground">
            Shows frequency of mentions and calculated importance score
          </div>
        </CardFooter>
      </Card>

      {/* Competitor Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Analysis</CardTitle>
          <CardDescription>How we compare to competitors</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Battery">
            <TabsList className="mb-4">
              {Object.keys(product.competitor_analysis).map((feature) => (
                <TabsTrigger key={feature} value={feature}>{feature}</TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(product.competitor_analysis).map(([feature, competitors]) => (
              <TabsContent key={feature} value={feature}>
                <div className="space-y-4">
                  {competitors.map((comp, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{comp.product_name}</span>
                        <div className="flex gap-2">
                          <Badge variant={idx === 0 ? "default" : "outline"} className="text-xs">
                            {idx === 0 ? "Our Product" : "Competitor"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>Positive: {comp.positive}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-destructive" />
                          <span>Negative: {comp.negative}%</span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-primary"
                          style={{ width: `${comp.positive}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default SingleProduct