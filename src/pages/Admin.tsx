import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SafeImage from "@/components/ui/safe-image";

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
    name: '', description: '', price: '', category_id: '', image_url: '', size: '', stock: '', slug: '', original_price: ''
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
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
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
    const { data } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
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
    const { data } = await supabase.from('user_roles').select('*, user:user_id(email)').order('id', { ascending: false });
    if (data) setUsers(data);
  };

  const fetchReviews = async () => {
    const { data } = await supabase.from('customer_reviews').select('*, products(name)').order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
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
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from('product-images').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
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

  const removeImageFile = (index: number) => setImageFiles(prev => prev.filter((_, i) => i !== index));

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
        toast.success("Product updated!");
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        toast.success("Product added!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save product");
      return;
    }

    setFormData({ name: '', description: '', price: '', category_id: '', image_url: '', size: '', stock: '', slug: '', original_price: '' });
    setEditingProduct(null);
    setImageFiles([]);
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    toast.success("Product deleted!");
    fetchProducts();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <Tabs defaultValue="homepage" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="homepage">Manage Homepage</TabsTrigger>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          {/* --- Manage Homepage Tab --- */}
          <TabsContent value="homepage">
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Manage Homepage Section</h2>
              <Button variant="outline" onClick={() => navigate('/admin/sections')}>
                Go to Manage Homepage
              </Button>
            </Card>
          </TabsContent>

          {/* --- Products Tab --- */}
          <TabsContent value="products">
            {/* Keep your Products code intact, including Dialogs, Cards, Images */}
            {/* ...Same as your current Products code... */}
          </TabsContent>

          {/* --- Orders Tab --- */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-muted-foreground">No orders yet</p>
              </Card>
            ) : (
              <div className="overflow-x-auto">
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
                    {orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}</TableCell>
                        <TableCell className="text-sm">{order.customer_name}</TableCell>
                        <TableCell className="text-sm">{order.customer_email}</TableCell>
                        <TableCell className="text-sm">{order.customer_phone}</TableCell>
                        <TableCell className="text-sm">₦{order.total.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{order.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'}</TableCell>
                        <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">
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
          </TabsContent>

          {/* --- Users Tab --- */}
          <TabsContent value="users">
            {users.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-muted-foreground">No users yet</p>
              </Card>
            ) : (
              <div className="overflow-x-auto">
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
                        <TableCell className="font-mono text-xs">USER-{String(index + 1).padStart(4,'0')}</TableCell>
                        <TableCell className="text-sm">{user.user?.email || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{review.customer_name}</h3>
                        <p className="text-sm text-muted-foreground">{review.products?.name || 'Product not found'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{review.review_text}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        review.is_featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {review.is_featured ? 'Featured' : 'Not Featured'}
                      </span>
                    </div>
                  </Card>
                ))}
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
