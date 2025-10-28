import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Pencil, Trash2, Plus, Upload, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SafeImage from "@/components/ui/safe-image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import "@/styles/admin.css";

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
    name: "", description: "", price: "", category_id: "", image_url: "", size: "", stock: "", slug: "", original_price: ""
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (data) {
      setIsAdmin(true);
      fetchProducts();
      fetchCategories();
      fetchOrders();
      fetchUsers();
      fetchReviews();
    } else {
      navigate("/");
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    if (data) setCategories(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`*, order_items (*, products (*))`)
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("user_roles").select("*, user:user_id(email)").order("id", { ascending: false });
    if (data) setUsers(data);
  };

  const fetchReviews = async () => {
    const { data } = await supabase.from("customer_reviews").select("*, products(name)").order("created_at", { ascending: false });
    if (data) setReviews(data);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast.error("Failed to update order status");
    else {
      toast.success("Order status updated!");
      fetchOrders();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const fileArray = Array.from(files);
    setImageFiles(prev => [...prev, ...fileArray]);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from("product-images").upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({ ...prev, image_url: uploadedUrls[0] }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
      }
    } catch (error: any) {
      toast.error("Error uploading images: " + error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      size: formData.size || null,
      stock: parseInt(formData.stock),
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

    setFormData({ name: "", description: "", price: "", category_id: "", image_url: "", size: "", stock: "", slug: "", original_price: "" });
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8 flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => navigate("/admin/sections")}>
            Manage Homepage
          </Button>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-6 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide rounded-lg border bg-muted p-1">
            <TabsTrigger value="products" className="tabs-trigger">Products</TabsTrigger>
            <TabsTrigger value="orders" className="tabs-trigger">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="users" className="tabs-trigger">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="reviews" className="tabs-trigger">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          {/* ✅ Products Tab */}
          <TabsContent value="products">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mb-6" size="lg"><Plus className="mr-2 h-4 w-4" /> Add New Product</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Product Name</Label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter name" required />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" />
                    </div>
                    <div><Label>Price</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} /></div>
                    <div><Label>Stock</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} /></div>
                    <div>
                      <Label>Category</Label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">{editingProduct ? "Update" : "Add Product"}</Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.categories?.name}</TableCell>
                      <TableCell>₦{product.price.toLocaleString()}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" onClick={() => {
                            setEditingProduct(product);
                            setFormData({ ...product, price: product.price.toString(), stock: product.stock.toString() });
                            setDialogOpen(true);
                          }}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ✅ Orders Tab */}
          <TabsContent value="orders">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>₦{order.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

                    {/* ✅ Users Tab */}
          <TabsContent value="users">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.user?.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>
                      <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ✅ Reviews Tab */}
          <TabsContent value="reviews">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Featured</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.customer_name}</TableCell>
                      <TableCell>{r.products?.name}</TableCell>
                      <TableCell>{"★".repeat(r.rating)}</TableCell>
                      <TableCell className="max-w-xs truncate">{r.review_text}</TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            r.is_featured
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {r.is_featured ? "Yes" : "No"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
