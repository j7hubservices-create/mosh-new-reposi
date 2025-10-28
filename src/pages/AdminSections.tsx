import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tab, TabsList, TabsTrigger, TabsContent, Tabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, Star, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      fetchSections();
      fetchOrders();
    } else navigate('/');
  };

  const fetchSections = async () => {
    const { data } = await supabase.from('homepage_sections').select('*').order('display_order', { ascending: true });
    if (data) setSections(data);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const handleDeleteOrder = async (id: string) => {
    await supabase.from('orders').delete().eq('id', id);
    toast.success("Order deleted!");
    fetchOrders();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            Admin Dashboard
          </h1>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="homepage" className="space-y-4">
          <TabsList className="flex space-x-4 border-b pb-2">
            <TabsTrigger value="homepage">Manage Homepage</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Homepage Section */}
          <TabsContent value="homepage">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Order</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map(section => (
                    <tr key={section.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{section.title}</td>
                      <td className="p-2 border">{section.section_type.replace('_', ' ').toUpperCase()}</td>
                      <td className={`p-2 border ${section.is_active ? 'text-green-600' : 'text-red-600'}`}>{section.is_active ? 'Active' : 'Inactive'}</td>
                      <td className="p-2 border">{section.display_order}</td>
                      <td className="p-2 border flex gap-2">
                        <Button variant="outline" size="icon"><Pencil className="h-4 w-4"/></Button>
                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4"/></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Order ID</th>
                    <th className="p-2 border">Customer</th>
                    <th className="p-2 border">Delivery</th>
                    <th className="p-2 border">Payment</th>
                    <th className="p-2 border">Total</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{order.id}</td>
                      <td className="p-2 border">{order.customer_name}</td>
                      <td className="p-2 border">{order.delivery_method}</td>
                      <td className="p-2 border">{order.payment_method}</td>
                      <td className="p-2 border">{order.total}</td>
                      <td className="p-2 border">{order.status}</td>
                      <td className="p-2 border flex gap-2">
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteOrder(order.id)}><Trash2 className="h-4 w-4"/></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Other tabs can be added similarly */}
          <TabsContent value="products"><p className="text-gray-500">Products management coming soon...</p></TabsContent>
          <TabsContent value="customers"><p className="text-gray-500">Customers management coming soon...</p></TabsContent>
          <TabsContent value="reviews"><p className="text-gray-500">Reviews management coming soon...</p></TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
