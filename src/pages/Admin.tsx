import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", category_id: "",
    image_url: "", size: "", stock: "", slug: "", original_price: ""
  });

  /** ✅ INITIALIZE USER SESSION */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user;
      if (!currentUser) return navigate("/auth");
      setUser(currentUser);
      checkAdminStatus(currentUser.id);
    });
  }, [navigate]);

  /** ✅ CHECK ADMIN PRIVILEGE */
  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!data) return navigate("/");
    setIsAdmin(true);
    fetchAllData();
  };

  /** ✅ FETCH ALL DATA PARALLELIZED */
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const [prodRes, catRes, ordRes, usrRes, revRes] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*, user:user_id(email)").order("id", { ascending: false }),
      supabase.from("customer_reviews").select("*, products(name)").order("created_at", { ascending: false }),
    ]);

    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
    setOrders(ordRes.data || []);
    setUsers(usrRes.data || []);
    setReviews(revRes.data || []);
    setLoading(false);
  }, []);

  /** ✅ UPDATE ORDER STATUS */
  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) return toast.error("Failed to update order status");
    toast.success("Order status updated!");
    fetchAllData();
  };

  /** ✅ IMAGE UPLOAD */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploadingImages(true);
    const fileArray = Array.from(files);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const ext = file.name.split(".").pop();
        const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(name, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(name);
        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, image_url: urls[0] }));
      setImageFiles(prev => [...prev, ...fileArray]);
      toast.success(`${urls.length} image(s) uploaded successfully`);
    } catch (err: any) {
      toast.error("Image upload failed: " + err.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImageFile = (index: number) =>
    setImageFiles(prev => prev.filter((_, i) => i !== index));

  /** ✅ ADD / EDIT PRODUCT */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      stock: parseInt(formData.stock),
    };

    try {
      if (editingProduct) {
        await supabase.from("products").update(payload).eq("id", editingProduct.id);
        toast.success("Product updated!");
      } else {
        await supabase.from("products").insert(payload);
        toast.success("Product added!");
      }
      resetForm();
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Error saving product");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", category_id: "", image_url: "", size: "", stock: "", slug: "", original_price: "" });
    setEditingProduct(null);
    setImageFiles([]);
    setDialogOpen(false);
  };

  /** ✅ DELETE PRODUCT */
  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast.success("Product deleted!");
    fetchAllData();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-6 py-6 flex-1 w-full">
        <Tabs defaultValue="homepage" className="w-full">
          <TabsList className="flex flex-wrap justify-start sm:justify-center gap-2 mb-6 overflow-x-auto scrollbar-hide">
            {[
              { val: "homepage", label: "Homepage" },
              { val: "products", label: `Products (${products.length})` },
              { val: "orders", label: `Orders (${orders.length})` },
              { val: "users", label: `Users (${users.length})` },
              { val: "reviews", label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <TabsTrigger key={tab.val} value={tab.val} className="text-sm sm:text-base whitespace-nowrap px-3 py-2">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* 🏠 Homepage */}
          <TabsContent value="homepage">
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Manage Homepage Section</h2>
              <Button variant="outline" onClick={() => navigate("/admin/sections")}>
                Go to Manage Homepage
              </Button>
            </Card>
          </TabsContent>

          {/* 🛍️ Products */}
          <TabsContent value="products">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
              <h2 className="text-xl font-bold">Manage Products</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus size={16} /> Add Product
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Price</Label>
                          <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                        </div>
                        <div>
                          <Label>Original Price</Label>
                          <Input type="number" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: e.target.value })} />
                        </div>
                      </div>

                      <div>
                        <Label>Category</Label>
                        <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Size</Label>
                        <Input value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} />
                      </div>

                      <div>
                        <Label>Stock</Label>
                        <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                      </div>

                      <div>
                        <Label>Slug</Label>
                        <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
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
                                >
                                  <X size={12} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button type="submit" className="w-full mt-2" disabled={uploadingImages}>
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="overflow-x-auto rounded-md border">
              {products.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-lg text-muted-foreground">No products found</p>
                </Card>
              ) : (
                <Table className="min-w-[700px] text-sm">
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
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.categories?.name || "N/A"}</TableCell>
                        <TableCell>₦{p.price.toLocaleString()}</TableCell>
                        <TableCell>{p.stock}</TableCell>
                        <TableCell>{p.size || "-"}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(p);
                              setFormData({
                                name: p.name,
                                description: p.description,
                                price: String(p.price),
                                original_price: p.original_price ? String(p.original_price) : "",
                                category_id: p.category_id || "",
                                image_url: p.image_url || "",
                                size: p.size || "",
                                stock: String(p.stock),
                                slug: p.slug || "",
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* 🧾 Orders */}
          <TabsContent value="orders">
            <div className="overflow-x-auto rounded-md border">
              {orders.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-lg text-muted-foreground">No orders yet</p>
                </Card>
              ) : (
                <Table className="min-w-[800px] text-sm">
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
                    {orders.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                        <TableCell>{o.customer_name}</TableCell>
                        <TableCell>{o.customer_email}</TableCell>
                        <TableCell>{o.customer_phone}</TableCell>
                        <TableCell>₦{o.total.toLocaleString()}</TableCell>
                        <TableCell>{o.delivery_method === "delivery" ? "Delivery" : "Pickup"}</TableCell>
                        <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Select value={o.status} onValueChange={(val) => updateOrderStatus(o.id, val)}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["pending", "processing", "completed", "cancelled"].map(st => (
                                <SelectItem key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* 👥 Users */}
          <TabsContent value="users">
            <div className="overflow-x-auto rounded-md border">
              {users.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-lg text-muted-foreground">No users yet</p>
                </Card>
              ) : (
                <Table className="min-w-[600px] text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u, i) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono text-xs">USER-{String(i + 1).padStart(4, "0")}</TableCell>
                        <TableCell>{u.user?.email || "N/A"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* ⭐ Reviews */}
          <TabsContent value="reviews">
            <div className="overflow-x-auto rounded-md border">
              {reviews.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-lg text-muted-foreground">No reviews yet</p>
                </Card>
              ) : (
                <Table className="min-w-[600px] text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map(r => (
                      <TableRow key={r.id}>
                        <TableCell>{r.products?.name || "N/A"}</TableCell>
                        <TableCell>{r.review_text}</TableCell>
                        <TableCell>{r.rating}</TableCell>
                        <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
