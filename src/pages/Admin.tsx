import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileProductCard } from "@/components/MobileProductCard";
import { MobileOrderCard } from "@/components/MobileOrderCard";
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
import { Pencil, Trash2, Plus, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

const Admin = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    size: '',
    stock: '',
    slug: '',
    original_price: '',
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdminStatus(session.user.id);
      else navigate('/auth');
    });
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    if (data) {
      setIsAdmin(true);
      fetchProducts();
      fetchCategories();
      fetchOrders();
      fetchUsers();
      fetchReviews();
    } else {
      navigate('/');
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('*, user:user_id(email)')
      .order('id', { ascending: false });
    if (data) setUsers(data);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('customer_reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) toast.error('Failed to update order status');
    else {
      toast.success('Order status updated!');
      fetchOrders();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    const fileArray = Array.from(files);
    setImageFiles((prev) => [...prev, ...fileArray]);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from('product-images').upload(fileName, file);
        if (error) throw error;
        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(fileName);
        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({ ...prev, image_url: uploadedUrls[0] }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
      }
    } catch (error: any) {
      toast.error('Error uploading images: ' + error.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImageFile = (index: number) => setImageFiles((prev) => prev.filter((_, i) => i !== index));

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
    } as any;

    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated!');
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        toast.success('Product added!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save product');
      return;
    }

    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      image_url: '',
      size: '',
      stock: '',
      slug: '',
      original_price: '',
    });
    setEditingProduct(null);
    setImageFiles([]);
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    toast.success('Product deleted!');
    fetchProducts();
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      original_price: product.original_price ? String(product.original_price) : '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      size: product.size || '',
      stock: String(product.stock),
      slug: product.slug || '',
    });
    setDialogOpen(true);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <main className="container mx-auto px-4 py-4 sm:py-8 flex-1">
        <Tabs defaultValue="homepage" className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="homepage" className="text-xs sm:text-sm px-2 sm:px-4">
              Homepage
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm px-2 sm:px-4">
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm px-2 sm:px-4">
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2 sm:px-4">
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm px-2 sm:px-4">
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Homepage Tab */}
          <TabsContent value="homepage">
            <Card className="p-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Manage Homepage Section</h2>
              <Button variant="outline" onClick={() => navigate('/admin/sections')} className="mt-4">
                Go to Manage Homepage
              </Button>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Manage Products</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto flex items-center gap-2">
                    <Plus size={16} /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div key={i} className="relative w-16 h-16 sm:w-20 sm:h-20 border rounded overflow-hidden">
                              <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute top-0.5 right-0.5 h-5 w-5 p-0"
                                onClick={() => removeImageFile(i)}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={uploadingImages}>
                      {uploadingImages ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : editingProduct ? (
                        'Update Product'
                      ) : (
                        'Add Product'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {products.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <p className="text-lg sm:text-xl text-muted-foreground">No products found</p>
              </Card>
            ) : (
              <>
                {/* Mobile View */}
                {isMobile ? (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <MobileProductCard
                        key={product.id}
                        product={product}
                        onEdit={() => handleEdit(product)}
                        onDelete={() => handleDelete(product.id)}
                      />
                    ))}
                  </div>
                ) : (
                  /* Desktop View */
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.categories?.name || 'N/A'}</TableCell>
                            <TableCell>₦{product.price.toLocaleString()}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>{product.size || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                  <Pencil size={16} />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                                  <Trash2 size={16} />
                                </Button>
                              </div>
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

          {/* Orders Tab */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <p className="text-lg sm:text-xl text-muted-foreground">No orders yet</p>
              </Card>
            ) : (
              <>
                {isMobile ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <MobileOrderCard
                        key={order.id}
                        order={order}
                        onStatusChange={(status) => updateOrderStatus(order.id, status)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
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
                            <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}</TableCell>
                            <TableCell>{order.customer_name}</TableCell>
                            <TableCell>{order.customer_email}</TableCell>
                            <TableCell>{order.customer_phone}</TableCell>
                            <TableCell>₦{order.total.toLocaleString()}</TableCell>
                            <TableCell>{order.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'}</TableCell>
                            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(val) => updateOrderStatus(order.id, val)}
                              >
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
              </>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            {users.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <p className="text-lg sm:text-xl text-muted-foreground">No users yet</p>
              </Card>
            ) : (
              <>
                {isMobile ? (
                  <div className="space-y-4">
                    {users.map((user, index) => (
                      <Card key={user.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-mono text-xs text-muted-foreground">
                                USER-{String(index + 1).padStart(4, '0')}
                              </p>
                              <p className="font-medium mt-1">{user.user?.email || 'N/A'}</p>
                            </div>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user, index) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-mono text-xs">
                              USER-{String(index + 1).padStart(4, '0')}
                            </TableCell>
                            <TableCell>{user.user?.email || 'N/A'}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
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

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            {reviews.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <p className="text-lg sm:text-xl text-muted-foreground">No reviews yet</p>
              </Card>
            ) : (
              <>
                {isMobile ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{review.products?.name || 'N/A'}</h3>
                            <span className="font-bold">⭐ {review.rating}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.review_text}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Review</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell>{review.products?.name || 'N/A'}</TableCell>
                            <TableCell>{review.review_text}</TableCell>
                            <TableCell>⭐ {review.rating}</TableCell>
                            <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
