import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [dialogOpen, setDialogOpen] = useState(false);

  // Example homepage content state (replace/extend with real homepage data)
  const [homepageTitle, setHomepageTitle] = useState("");
  const [homepageSubtitle, setHomepageSubtitle] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdminStatus(session.user.id);
      else navigate("/auth");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (data) {
      setIsAdmin(true);
      // Fetch all data concurrently
      Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
        fetchUsers(),
        fetchReviews(),
      ]).finally(() => setLoading(false));
    } else {
      navigate("/");
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    if (data) setCategories(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("*, user:user_id(email)")
      .order("id", { ascending: false });
    if (data) setUsers(data);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("customer_reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) toast.error("Failed to update order status");
    else {
      toast.success("Order status updated!");
      fetchOrders();
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    const fileArray = Array.from(files);
    setImageFiles((prev) => [...prev, ...fileArray]);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);
        if (error) throw error;
        const publicUrl = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName).data.publicUrl;
        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({ ...prev, image_url: uploadedUrls[0] }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
      }
    } catch (error: any) {
      toast.error("Error uploading images: " + error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImageFile = (index: number) =>
    setImageFiles((prev) => prev.filter((_, i) => i !== index));

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.original_price
        ? parseFloat(formData.original_price)
        : null,
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      size: formData.size || null,
      stock: parseInt(formData.stock),
      slug: formData.slug || null,
    } as any;

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
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
    await supabase.from("products").delete().eq("id", id);
    toast.success("Product deleted!");
    fetchProducts();
  };

  // Dummy homepage save handler (replace with actual logic)
  const handleHomepageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Homepage content saved!");
    // Add actual save/update logic here
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <main className="container mx-auto px-4 py-6 flex-1">
        <Tabs
          defaultValue="homepage"
          className="w-full overflow-x-auto sm:overflow-visible"
          aria-label="Admin dashboard tabs"
        >
          <TabsList className="flex flex-nowrap sm:flex-wrap gap-2 mb-6">
            <TabsTrigger value="homepage" className="whitespace-nowrap">
              Manage Homepage
            </TabsTrigger>
            <TabsTrigger value="products" className="whitespace-nowrap">
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="whitespace-nowrap">
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="whitespace-nowrap">
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="whitespace-nowrap">
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* --- Manage Homepage Tab --- */}
          <TabsContent value="homepage">
            <Card className="p-6 max-w-4xl mx-auto text-left">
              <h2 className="text-2xl font-bold mb-4">Manage Homepage Section</h2>
              <form
                onSubmit={handleHomepageSubmit}
                className="space-y-4 max-w-full"
                aria-label="Homepage management form"
              >
                <div>
                  <Label htmlFor="homepageTitle">Homepage Title</Label>
                  <Input
                    id="homepageTitle"
                    placeholder="Enter homepage title"
                    value={homepageTitle}
                    onChange={(e) => setHomepageTitle(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="homepageSubtitle">Homepage Subtitle</Label>
                  <Textarea
                    id="homepageSubtitle"
                    rows={3}
                    placeholder="Enter homepage subtitle or description"
                    value={homepageSubtitle}
                    onChange={(e) => setHomepageSubtitle(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full mt-4">
                  Save Changes
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* --- Products Tab --- */}
          <TabsContent value="products">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-xl font-bold">Manage Products</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    aria-label="Add a new product"
                  >
                    <Plus size={16} /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-full sm:max-w-lg w-full">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleProductSubmit}
                    className="space-y-4 mt-4"
                    aria-label="Product form"
                  >
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        required
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                          type="number"
                          id="price"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="original_price">Original Price</Label>
                        <Input
                          type="number"
                          id="original_price"
                          min="0"
                          step="0.01"
                          value={formData.original_price}
                          onChange={(e) =>
                            setFormData({ ...formData, original_price: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(val) =>
                          setFormData({ ...formData, category_id: val })
                        }
                        aria-labelledby="category-label"
                      >
                        <SelectTrigger aria-label="Select category">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="size">Size</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) =>
                            setFormData({ ...formData, size: e.target.value })
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          type="number"
                          id="stock"
                          min="0"
                          value={formData.stock}
                          onChange={(e) =>
                            setFormData({ ...formData, stock: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                          }
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="image">Image</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        aria-describedby="imageHelp"
                      />
                      <small id="imageHelp" className="text-muted-foreground text-xs">
                        You can upload multiple images. Click on X to remove.
                      </small>
                      {imageFiles.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {imageFiles.map((file, i) => (
                            <div
                              key={i}
                              className="relative w-20 h-20 border rounded overflow-hidden"
                              aria-label={`Image preview ${i + 1}`}
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="w-full h-full object-cover"
                              />
                              <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-1 right-1 p-1"
                                onClick={() => removeImageFile(i)}
                                aria-label={`Remove image ${i + 1}`}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full mt-4"
                      disabled={uploadingImages}
                      aria-busy={uploadingImages}
                    >
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {products.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-muted-foreground">No products found</p>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-md shadow-sm">
                <Table
                  className="min-w-[600px] sm:min-w-full"
                  role="grid"
                  aria-label="Products table"
                >
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
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.categories?.name || "N/A"}</TableCell>
                        <TableCell>₦{product.price.toLocaleString()}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.size || "-"}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Edit product ${product.name}`}
                            onClick={() => {
                              setEditingProduct(product);
                              setFormData({
                                name: product.name,
                                description: product.description,
                                price: String(product.price),
                                original_price: product.original_price
                                  ? String(product.original_price)
                                  : "",
                                category_id: product.category_id || "",
                                image_url: product.image_url || "",
                                size: product.size || "",
                                stock: String(product.stock),
                                slug: product.slug || "",
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            aria-label={`Delete product ${product.name}`}
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* --- Orders Tab --- */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-muted-foreground">No orders yet</p>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-md shadow-sm">
                <Table
                  className="min-w-[700px] sm:min-w-full"
                  role="grid"
                  aria-label="Orders table"
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Date</TableHead>
