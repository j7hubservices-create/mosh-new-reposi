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
  const [sections, setSections] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
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
      fetchSections();
      fetchReviews();
    } else {
      navigate('/');
    }
  };

  const fetchSections = async () => {
    const { data } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setSections(data);
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('customer_reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSection) {
      await supabase
        .from('homepage_sections')
        .update(sectionForm)
        .eq('id', editingSection.id);
      toast.success("Section updated!");
    } else {
      await supabase.from('homepage_sections').insert(sectionForm);
      toast.success("Section added!");
    }

    setSectionForm({ section_type: 'latest', title: '', description: '', is_active: true, display_order: 0 });
    setEditingSection(null);
    setDialogOpen(false);
    fetchSections();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingReview) {
      await supabase
        .from('customer_reviews')
        .update(reviewForm)
        .eq('id', editingReview.id);
      toast.success("Review updated!");
    } else {
      await supabase.from('customer_reviews').insert(reviewForm);
      toast.success("Review added!");
    }

    setReviewForm({ customer_name: '', rating: 5, review_text: '', is_featured: true });
    setEditingReview(null);
    setReviewDialogOpen(false);
    fetchReviews();
  };

  const handleDeleteSection = async (id: string) => {
    await supabase.from('homepage_sections').delete().eq('id', id);
    toast.success("Section deleted!");
    fetchSections();
  };

  const handleDeleteReview = async (id: string) => {
    await supabase.from('customer_reviews').delete().eq('id', id);
    toast.success("Review deleted!");
    fetchReviews();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Settings className="w-10 h-10 text-primary" />
            Homepage Management
          </h1>
          <p className="text-muted-foreground">Manage homepage sections and customer reviews</p>
        </div>

        {/* Homepage Sections */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Sections</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSectionSubmit} className="space-y-4">
                  <div>
                    <Label>Section Type</Label>
                    <Select
                      value={sectionForm.section_type}
                      onValueChange={(value) => setSectionForm({ ...sectionForm, section_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Latest Products</SelectItem>
                        <SelectItem value="best_sellers">Best Sellers</SelectItem>
                        <SelectItem value="random">Random Products</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={sectionForm.title}
                      onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={sectionForm.description}
                      onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={sectionForm.display_order}
                      onChange={(e) => setSectionForm({ ...sectionForm, display_order: parseInt(e.target.value) })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingSection ? 'Update Section' : 'Add Section'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {sections.map((section) => (
              <Card key={section.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">{section.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{section.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        {section.section_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={section.is_active ? 'text-green-600' : 'text-red-600'}>
                        {section.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-muted-foreground">Order: {section.display_order}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingSection(section);
                        setSectionForm(section);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Customer Reviews */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
              Customer Reviews
            </h2>
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingReview ? 'Edit Review' : 'Add New Review'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <Label>Customer Name</Label>
                    <Input
                      value={reviewForm.customer_name}
                      onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Rating (1-5)</Label>
                    <Select
                      value={reviewForm.rating.toString()}
                      onValueChange={(value) => setReviewForm({ ...reviewForm, rating: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Review Text</Label>
                    <Textarea
                      value={reviewForm.review_text}
                      onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingReview ? 'Update Review' : 'Add Review'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex gap-1 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm mb-2 italic">"{review.review_text}"</p>
                    <div className="flex gap-3 text-sm">
                      <span className="font-semibold">- {review.customer_name}</span>
                      {review.is_featured && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingReview(review);
                        setReviewForm(review);
                        setReviewDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminSections;
