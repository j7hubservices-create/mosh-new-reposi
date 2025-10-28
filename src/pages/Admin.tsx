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
import { Pencil, Trash2, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
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
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category_id: '', image_url: '', size: '', stock: '', slug: '', original_price: ''
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);

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

  const toggleOrderExpand = (id: string) => setExpandedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleReviewExpand = (id: string) => setExpandedReviews(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <Tabs defaultValue="homepage" className="w-full overflow-x-auto touch-pan-x">
          <TabsList className="mb-6 flex-nowrap">
            <TabsTrigger value="homepage">Manage Homepage</TabsTrigger>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          {/* --- Homepage Tab --- */}
          <TabsContent value="homepage">
            <Card className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Manage Homepage Section</h2>
              <Button variant="outline" onClick={() => navigate('/admin/sections')}>Go to Manage Homepage</Button>
            </Card>
          </TabsContent>

          {/* --- Products Tab --- */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-xl font-bold">Manage Products</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus size={16} /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Form fields as in original code */}
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {products.length === 0 ? (
              <Card className="p-12 text-center"><p className="text-xl text-muted-foreground">No products found</p></Card>
            ) : (
              <div className="overflow-x-auto md:overflow-x-hidden">
                <Table className="min-w-full">
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
                    {products.map(product => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.categories?.name || 'N/A'}</TableCell>
                        <TableCell>₦{product.price.toLocaleString()}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.size || '-'}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
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
                          }}><Pencil size={16} /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}><Trash2 size={16} /></Button>
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
              <Card className="p-12 text-center"><p className="text-xl text-muted-foreground">No orders yet</p></Card>
            ) : (
              <div className="grid gap-2">
                {orders.map(order => {
                  const isExpanded = expandedOrders.includes(order.id);
                  return (
                    <Card key={order.id} className="p-4 md:table md:overflow-x-auto">
                      <div className="flex justify-between items-center md:hidden cursor-pointer" onClick={() => toggleOrderExpand(order.id)}>
                        <span className="font-mono">{order.id.substring(0, 8)}</span>
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </div>
                      <div className={`${isExpanded ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>
                        <p>Customer: {order.customer_name}</p>
                        <p>Email: {order.customer_email}</p>
                        <p>Phone: {order.customer_phone}</p>
                        <p>Total: ₦{order.total.toLocaleString()}</p>
                        <p>Delivery: {order.delivery_method}</p>
                        <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)} className="w-full mt-2">
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* --- Users Tab --- */}
          <TabsContent value="users">
            {/* Keep original Users table code as is */}
          </TabsContent>

          {/* --- Reviews Tab --- */}
          <TabsContent value="reviews">
            {reviews.length === 0 ? (
              <Card className="p-12 text-center"><p className="text-xl text-muted-foreground">No reviews yet</p></Card>
            ) : (
              <div className="grid gap-2">
                {reviews.map(review => {
                  const isExpanded = expandedReviews.includes(review.id);
                  return (
                    <Card key={review.id} className="p-4 md:table md:overflow-x-auto">
                      <div className="flex justify-between items-center md:hidden cursor-pointer" onClick={() => toggleReviewExpand(review.id)}>
                        <span className="font-semibold">{review.products?.name || 'N/A'}</span>
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </div>
                      <div className={`${isExpanded ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>
                        <p>Review: {review.review_text}</p>
                        <p>Rating: {review.rating}</p>
                        <p>Date: {new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </Card>
                  )
                })}
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
