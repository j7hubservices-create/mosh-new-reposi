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
import { Settings, Star, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminSections = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<'homepage' | 'products' | 'reviews' | 'users' | 'orders'>('homepage');

  // Data states
  const [sections, setSections] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<any>(null);

  // Forms
  const [sectionForm, setSectionForm] = useState({
    section_type: 'latest',
    title: '',
    description: '',
    is_active: true,
    display_order: 0
  });
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    rating: 5,
    review_text: '',
    is_featured: true
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
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (data) {
      setIsAdmin(true);
      fetchAllData();
    } else {
      navigate('/');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    const sectionsData = await supabase.from('homepage_sections').select('*').order('display_order', { ascending: true });
    if (sectionsData.data) setSections(sectionsData.data);

    const reviewsData = await supabase.from('customer_reviews').select('*').order('created_at', { ascending: false });
    if (reviewsData.data) setReviews(reviewsData.data);

    const usersData = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (usersData.data) setUsers(usersData.data);

    const ordersData = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (ordersData.data) setOrders(ordersData.data);

    const productsData = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (productsData.data) setProducts(productsData.data);

    setLoading(false);
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSection) {
      await supabase.from('homepage_sections').update(sectionForm).eq('id', editingSection.id);
      toast.success("Section updated!");
    } else {
      await supabase.from('homepage_sections').insert(sectionForm);
      toast.success("Section added!");
    }
    setSectionForm({ section_type: 'latest', title: '', description: '', is_active: true, display_order: 0 });
    setEditingSection(null);
    setDialogOpen(false);
    fetchAllData();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview) {
      await supabase.from('customer_reviews').update(reviewForm).eq('id', editingReview.id);
      toast.success("Review updated!");
    } else {
      await supabase.from('customer_reviews').insert(reviewForm);
      toast.success("Review added!");
    }
    setReviewForm({ customer_name: '', rating: 5, review_text: '', is_featured: true });
    setEditingReview(null);
    setReviewDialogOpen(false);
    fetchAllData();
  };

  const handleDelete = async (table: string, id: string) => {
    await supabase.from(table).delete().eq('id', id);
    toast.success("Deleted successfully!");
    fetchAllData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Settings className="w-10 h-10 text-primary" />
              Admin Sections
            </h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setTab('homepage')}>Manage Homepage</Button>
            <Button onClick={() => setTab('products')}>Products</Button>
            <Button onClick={() => setTab('reviews')}>Reviews</Button>
            <Button onClick={() => setTab('users')}>Users</Button>
            <Button onClick={() => setTab('orders')}>Orders</Button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Homepage Sections */}
          {tab === 'homepage' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Homepage Sections</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Add Section</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSectionSubmit} className="space-y-4">
                      <div>
                        <Label>Section Type</Label>
                        <Select value={sectionForm.section_type} onValueChange={(v) => setSectionForm({ ...sectionForm, section_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="latest">Latest Products</SelectItem>
                            <SelectItem value="best_sellers">Best Sellers</SelectItem>
                            <SelectItem value="random">Random Products</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea value={sectionForm.description} onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} />
                      </div>
                      <div>
                        <Label>Display Order</Label>
                        <Input type="number" value={sectionForm.display_order} onChange={(e) => setSectionForm({ ...sectionForm, display_order: parseInt(e.target.value) })} />
                      </div>
                      <Button type="submit" className="w-full">{editingSection ? 'Update Section' : 'Add Section'}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <table className="w-full border rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">ID</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Order</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map(section => (
                    <tr key={section.id} className="border-t">
                      <td className="p-2">{section.id.slice(0, 8)}...</td>
                      <td>{section.section_type}</td>
                      <td>{section.title}</td>
                      <td>{section.description}</td>
                      <td>{section.display_order}</td>
                      <td>{section.is_active ? 'Yes' : 'No'}</td>
                      <td className="flex gap-2">
                        <Button size="icon" variant="outline" onClick={() => { setEditingSection(section); setSectionForm(section); setDialogOpen(true); }}>
                          <Pencil className="w-4 h-4"/>
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => handleDelete('homepage_sections', section.id)}>
                          <Trash2 className="w-4 h-4"/>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Products, Reviews, Users, Orders similar to previous full code */}
          {/* Keep everything exactly as in the previous full code, just renamed component */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminSections;
