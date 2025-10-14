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
import { Pencil, Trash2, Plus, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category_id: '', image_url: '', size: '', stock: ''
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
        navigate('/auth');
      }
    });
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
    if (data) {
      setIsAdmin(true);
      fetchProducts();
      fetchCategories();
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

  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) };

    if (editingProduct) {
      await supabase.from('products').update(productData).eq('id', editingProduct.id);
      toast.success("Product updated!");
    } else {
      await supabase.from('products').insert(productData);
      toast.success("Product added!");
    }

    setFormData({ name: '', description: '', price: '', category_id: '', image_url: '', size: '', stock: '' });
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Product Management</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6" size="lg">
              <Plus className="mr-2 h-4 w-4" />Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Product Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enter product name" required />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe your product" rows={3} />
                </div>

                <div>
                  <Label>Price (₦)</Label>
                  <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00" required />
                </div>

                <div>
                  <Label>Stock Quantity</Label>
                  <Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} placeholder="0" required />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Size</Label>
                  <Input value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} placeholder="e.g., S, M, L, XL" />
                </div>

                <div className="md:col-span-2">
                  <Label>Product Images</Label>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" className="relative" disabled={uploadingImages}>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadingImages ? 'Uploading...' : 'Upload Images'}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={uploadingImages}
                        />
                      </Button>
                      <span className="text-sm text-muted-foreground">or enter URL below</span>
                    </div>
                    
                    {imageFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-20 h-20 object-cover rounded border" />
                            <button
                              type="button"
                              onClick={() => removeImageFile(index)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Input 
                      value={formData.image_url} 
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                      placeholder="Or paste image URL here" 
                    />
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded border" />
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={uploadingImages}>
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4">
          {products.map(product => (
            <Card key={product.id} className="p-6 flex flex-col md:flex-row gap-4 hover:shadow-lg transition-shadow">
              <img src={product.image_url} alt={product.name} className="w-full md:w-32 h-32 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-xl mb-1">{product.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">{product.categories?.name}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <p className="text-2xl font-bold text-primary">₦{product.price.toLocaleString()}</p>
                  {product.size && <span className="text-muted-foreground">Size: {product.size}</span>}
                  <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
              <div className="flex md:flex-col gap-2">
                <Button variant="outline" size="icon" onClick={() => { setEditingProduct(product); setFormData({...product, price: product.price.toString(), stock: product.stock.toString()}); setDialogOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
