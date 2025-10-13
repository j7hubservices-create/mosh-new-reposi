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
import { Pencil, Trash2, Plus } from "lucide-react";
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
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    toast.success("Product deleted!");
    fetchProducts();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-6"><Plus className="mr-2 h-4 w-4" />Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
              <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
              <div><Label>Price</Label><Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required /></div>
              <div><Label>Category</Label><Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Image URL</Label><Input value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} required /></div>
              <div><Label>Size</Label><Input value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} /></div>
              <div><Label>Stock</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required /></div>
              <Button type="submit" className="w-full">{editingProduct ? 'Update' : 'Add'} Product</Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4">
          {products.map(product => (
            <Card key={product.id} className="p-4 flex gap-4">
              <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-muted-foreground">{product.categories?.name}</p>
                <p className="text-xl font-bold text-primary">₦{product.price.toLocaleString()}</p>
                <p className="text-sm">Stock: {product.stock}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => { setEditingProduct(product); setFormData({...product, price: product.price.toString(), stock: product.stock.toString()}); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4" /></Button>
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
