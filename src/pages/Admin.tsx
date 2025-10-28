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

  // Fetch functions
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

  // Upload image from device
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

  // Submit product
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

          {/* --- Homepage Tab --- */}
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
            {/* --- Add/Edit Product Form --- */}
            <div className="flex justify-between items-center mb-4">
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
                    {/* Form inputs here... (same as your original code) */}
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {/* Product Table */}
            {products.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-xl text-muted-foreground">No products found</p>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <Table>
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
                        <TableCell>{product.categories?.name || 'N/A'}</TableCell>
                        <TableCell>₦{product.price.toLocaleString()}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.size || '-'}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
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
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
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

          {/* --- Orders, Users, Reviews Tabs --- */}
          {/* ...Keep your original code here... */}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
