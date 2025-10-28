import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Admin = () => {
  const navigate = useNavigate();

  // auth / data
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // product form + images
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_url: "",
    size: "",
    stock: "",
    slug: "",
    original_price: "",
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // UI state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  // collapsed states for orders and reviews (mobile)
  const [collapsedOrders, setCollapsedOrders] = useState<Record<string, boolean>>({});
  const [collapsedReviews, setCollapsedReviews] = useState<Record<string, boolean>>({});

  // refs
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------------------------------------------------------
  // Helpers: resize, mobile detection
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = viewportWidth < 768;
  const isSmall = viewportWidth < 520;

  // ---------------------------------------------------------------------------
  // Auth + data fetching
  // ---------------------------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        navigate("/auth");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (error) {
      console.error("checkAdminStatus error:", error);
      navigate("/");
      return;
    }
    if (data) {
      setIsAdmin(true);
      await Promise.all([fetchProducts(), fetchCategories(), fetchOrders(), fetchUsers(), fetchReviews()]);
    } else {
      navigate("/");
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
    if (error) {
      console.error("fetchProducts error:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error("fetchCategories error:", error);
    else setCategories(data || []);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) console.error("fetchOrders error:", error);
    else setOrders(data || []);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("user_roles").select("*, user:user_id(email)").order("id", { ascending: false });
    if (error) console.error("fetchUsers error:", error);
    else setUsers(data || []);
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase.from("customer_reviews").select("*, products(name)").order("created_at", { ascending: false });
    if (error) console.error("fetchReviews error:", error);
    else setReviews(data || []);
  };

  // ---------------------------------------------------------------------------
  // Order update
  // ---------------------------------------------------------------------------
  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast.error("Failed to update order status");
      console.error(error);
    } else {
      toast.success("Order status updated!");
      fetchOrders();
    }
  };

  // ---------------------------------------------------------------------------
  // Image upload (keeps your file upload flow)
  // ---------------------------------------------------------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    const fileArray = Array.from(files);
    setImageFiles((prev) => [...prev, ...fileArray]);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
        // supabase storage getPublicUrl returns { data: { publicUrl } } in older clients, or { publicUrl } — keep robust
        // handle both shapes
        const publicUrl = (data as any)?.publicUrl || (data as any)?.public_url || (data as any)?.publicUrl;
        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({ ...prev, image_url: uploadedUrls[0] || "" }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
      }
    } catch (error: any) {
      toast.error("Error uploading images: " + (error?.message || String(error)));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    // If user removes the first uploaded image, clear image_url so they can upload a new primary
    if (index === 0) setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  // ---------------------------------------------------------------------------
  // Create / update product
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation (prevent NaN)
    const price = parseFloat(formData.price || "0");
    const stock = parseInt(formData.stock || "0", 10);
    const productData: any = {
      name: formData.name,
      description: formData.description,
      price: isNaN(price) ? 0 : price,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      size: formData.size || null,
      stock: isNaN(stock) ? 0 : stock,
      slug: formData.slug || null,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
        if (error) throw error;
        toast.success("Product updated!");
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        toast.success("Product added!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save product");
      return;
    }

    // reset
    setFormData({
      name: "",
      description: "",
      price: "",
      category_id: "",
      image_url: "",
      size: "",
      stock: "",
      slug: "",
      original_price: "",
    });
    setEditingProduct(null);
    setImageFiles([]);
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Error deleting product");
      console.error(error);
    } else {
      toast.success("Product deleted!");
      fetchProducts();
    }
  };

  // ---------------------------------------------------------------------------
  // UI helpers for mobile lists and collapsibles
  // ---------------------------------------------------------------------------
  const toggleOrderCollapse = (id: string) => {
    setCollapsedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleReviewCollapse = (id: string) => {
    setCollapsedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // When opening dialog to edit a product, ensure dialogOpen true AND set formData properly
  useEffect(() => {
    if (!dialogOpen) {
      // cleanup when dialog closed
      setEditingProduct(null);
      // don't clear form entirely to avoid user frustration if they accidentally close; we DO clear when submission occurs
    }
  }, [dialogOpen]);

  // Force focus into dialog on open (minor UX improvement)
  useEffect(() => {
    if (dialogOpen && dialogRef.current) {
      const el = dialogRef.current.querySelector("input, textarea, select, button");
      if (el && (el as HTMLElement).focus) (el as HTMLElement).focus();
    }
  }, [dialogOpen]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  // ---------------------------------------------------------------------------
  // Render helpers: product grid (mobile), product table (desktop)
  // ---------------------------------------------------------------------------
  const ProductCard: React.FC<{ product: any }> = ({ product }) => {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-3 flex gap-3 w-full">
        <div className="w-28 h-28 flex-shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-xs text-muted-foreground px-2">No image</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="truncate">
              <h3 className="text-sm font-semibold truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground truncate mt-1">{product.categories?.name || "N/A"}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">₦{Number(product.price || 0).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Stock: {product.stock}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              title="Edit product"
              onClick={() => {
                setEditingProduct(product);
                setFormData({
                  name: product.name || "",
                  description: product.description || "",
                  price: String(product.price || ""),
                  original_price: product.original_price ? String(product.original_price) : "",
                  category_id: product.category_id || "",
                  image_url: product.image_url || "",
                  size: product.size || "",
                  stock: String(product.stock || ""),
                  slug: product.slug || "",
                });
                setDialogOpen(true);
              }}
              aria-label={`Edit ${product.name}`}
            >
              <Pencil size={14} />
            </Button>

            <Button
              variant="destructive"
              size="sm"
              title="Delete product"
              onClick={() => handleDelete(product.id)}
              aria-label={`Delete ${product.name}`}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // JSX output
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-1">
        <Tabs defaultValue="homepage" className="w-full">
          <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="mb-4 flex gap-2 overflow-x-auto touch-pan-x">
              <TabsTrigger value="homepage" className="whitespace-nowrap">Manage Homepage</TabsTrigger>
              <TabsTrigger value="products" className="whitespace-nowrap">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="orders" className="whitespace-nowrap">Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap">Users ({users.length})</TabsTrigger>
              <TabsTrigger value="reviews" className="whitespace-nowrap">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>
          </div>

          {/* --- Manage Homepage Tab --- */}
          <TabsContent value="homepage">
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Manage Homepage Section</h2>
              <Button variant="outline" onClick={() => navigate("/admin/sections")}>
                Go to Manage Homepage
              </Button>
            </Card>
          </TabsContent>

          {/* --- Products Tab --- */}
          <TabsContent value="products">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold">Manage Products</h2>

              {/* Add Product Button (opens dialog) */}
              <div className="flex items-center gap-2">
                <Dialog open={dialogOpen} onOpenChange={(v) => setDialogOpen(v)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Plus size={16} /> {editingProduct ? "Edit Product" : "Add Product"}
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-lg w-full" ref={dialogRef as any}>
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[80vh] overflow-auto pr-2">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Price</Label>
                          <Input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Original Price</Label>
                          <Input
                            type="number"
                            value={formData.original_price}
                            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Category</Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Size</Label>
                          <Input
                            value={formData.size}
                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Slug</Label>
                        <Input
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Image</Label>
                        <Input type="file" accept="image/*" onChange={handleImageUpload} />
                        {imageFiles.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {imageFiles.map((file, i) => (
                              <div key={i} className="relative w-20 h-20 border rounded overflow-hidden">
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute top-1 right-1 p-1"
                                  onClick={() => removeImageFile(i)}
                                  title="Remove preview"
                                >
                                  <X size={12} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Preview of already uploaded image_url */}
                        {formData.image_url && !imageFiles.length && (
                          <div className="mt-2">
                            <img src={formData.image_url} alt="uploaded" className="w-28 h-28 object-cover rounded" />
                          </div>
                        )}
                      </div>

                      <Button type="submit" className="w-full mt-2" disabled={uploadingImages}>
                        {editingProduct ? "Update Product" : "Add Product"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Products content */}
            {products.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-muted-foreground">No products found</p>
              </Card>
            ) : (
              <>
                {/* mobile: card list */}
                {isMobile ? (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  /* desktop/tablet: classic table with horizontal scroll wrapper */
                  <div className="overflow-x-auto touch-pan-x">
                    <Table className="min-w-[720px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="max-w-xs">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                                  {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-xs text-muted-foreground px-2">No image</div>
                                  )}
                                </div>
                                <div className="truncate">
                                  <div className="font-medium truncate">{product.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">{product.slug || ""}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{product.categories?.name || "N/A"}</TableCell>
                            <TableCell>₦{Number(product.price || 0).toLocaleString()}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>{product.size || "-"}</TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setFormData({
                                    name: product.name || "",
                                    description: product.description || "",
                                    price: String(product.price || ""),
                                    original_price: product.original_price ? String(product.original_price) : "",
                                    category_id: product.category_id || "",
                                    image_url: product.image_url || "",
                                    size: product.size || "",
                                    stock: String(product.stock || ""),
                                    slug: product.slug || "",
                                  });
                                  setDialogOpen(true);
                                }}
                                title={`Edit ${product.name}`}
                                aria-label={`Edit ${product.name}`}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)} title="Delete">
                                <Trash2 size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* --- Orders Tab --- */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-muted-foreground">No orders yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* On small devices: collapsible rows */}
                {isMobile ? (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-xs">#{String(order.id).substring(0, 8)}</div>
                          <div>
                            <div className="font-semibold">{order.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{order.customer_phone} • {order.customer_email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm font-medium">₦{Number(order.total || 0).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
                          </div>

                          <Button size="sm" variant="ghost" onClick={() => toggleOrderCollapse(order.id)} title="Show details">
                            {collapsedOrders[order.id] ? "Hide" : "Details"}
                          </Button>
                        </div>
                      </div>

                      {collapsedOrders[order.id] && (
                        <div className="mt-3 border-t pt-3 text-sm space-y-2">
                          <div>
                            <strong>Delivery:</strong> {order.delivery_method === "delivery" ? "Delivery" : "Pickup"}
                          </div>
                          <div>
                            <strong>Address:</strong> {order.customer_address || "—"}
                          </div>
                          <div>
                            <strong>Status:</strong>
                            <div className="mt-2">
                              <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  /* Desktop: table */
                  <div className="overflow-x-auto touch-pan-x">
                    <Table className="min-w-[900px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Delivery</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{String(order.id).substring(0, 8)}</TableCell>
                            <TableCell>{order.customer_name}</TableCell>
                            <TableCell>{order.customer_email}</TableCell>
                            <TableCell>{order.customer_phone}</TableCell>
                            <TableCell>₦{Number(order.total || 0).toLocaleString()}</TableCell>
                            <TableCell>{order.delivery_method === "delivery" ? "Delivery" : "Pickup"}</TableCell>
                            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* --- Users Tab --- */}
          <TabsContent value="users">
            {users.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-muted-foreground">No users yet</p>
              </Card>
            ) : (
              <div className="overflow-x-auto touch-pan-x">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u: any, index: number) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono text-xs">USER-{String(index + 1).padStart(4, "0")}</TableCell>
                        <TableCell className="text-sm">{u.user?.email || "N/A"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* --- Reviews Tab --- */}
          <TabsContent value="reviews">
            {reviews.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-muted-foreground">No reviews yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {isMobile ? (
                  reviews.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{r.products?.name || "N/A"}</div>
                          <div className="text-xs text-muted-foreground">Rating: {r.rating}</div>
                        </div>

                        <div>
                          <Button size="sm" variant="ghost" onClick={() => toggleReviewCollapse(r.id)} title="Show review">
                            {collapsedReviews[r.id] ? "Hide" : "View"}
                          </Button>
                        </div>
                      </div>

                      {collapsedReviews[r.id] && (
                        <div className="mt-3 text-sm border-t pt-3">
                          <div className="whitespace-pre-line">{r.review_text}</div>
                          <div className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="overflow-x-auto touch-pan-x">
                    <Table className="min-w-[700px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Review</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{r.products?.name || "N/A"}</TableCell>
                            <TableCell style={{ maxWidth: 400 }}>
                              <div className="truncate">{r.review_text}</div>
                            </TableCell>
                            <TableCell>{r.rating}</TableCell>
                            <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
