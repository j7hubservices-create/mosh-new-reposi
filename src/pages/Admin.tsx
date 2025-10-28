import React, { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  // Dummy fetchData (replace with your real API calls)
  const fetchAllData = useCallback(async () => {
    // Example placeholder data
    setProducts([
      { id: 1, name: "The Town Graphic Hoodie", category: "Unisex" },
      { id: 2, name: "Gray Shorts", category: "Kids - Girl" },
      { id: 3, name: "Leopard Print Sweater", category: "Ladies - Tops" },
      { id: 4, name: "White Fuzzy Sweater", category: "Ladies - Tops" },
    ]);
    setOrders([]);
    setUsers([]);
    setReviews([]);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-10 bg-primary text-white py-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4">
          <h1 className="text-lg sm:text-2xl font-semibold">Mosh Apparels</h1>
          <p className="text-sm opacity-80">Quality Thrift Store</p>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 container mx-auto px-4 py-6 space-y-8">
        <Tabs defaultValue="products" className="w-full">

          {/* ✅ Scrollable Tab Header */}
          <TabsList className="flex w-full sm:w-auto overflow-x-auto scrollbar-hide gap-2 px-2 py-1 rounded-lg bg-muted/50">
            <TabsTrigger value="homepage" className="min-w-[140px] text-sm whitespace-nowrap">
              Manage Homepage
            </TabsTrigger>
            <TabsTrigger value="products" className="min-w-[140px] text-sm whitespace-nowrap">
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="min-w-[140px] text-sm whitespace-nowrap">
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="min-w-[140px] text-sm whitespace-nowrap">
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="min-w-[140px] text-sm whitespace-nowrap">
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* ✅ Homepage Tab */}
          <TabsContent value="homepage">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Manage Homepage</h2>
              <Button onClick={() => navigate("/admin/sections")}>Go to Homepage Settings</Button>
            </Card>
          </TabsContent>

          {/* ✅ Products Tab */}
          <TabsContent value="products">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
              <Button className="mb-4">+ Add Product</Button>
              <div className="overflow-x-auto rounded-md border">
                <Table className="min-w-[600px] text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.category}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* ✅ Orders Tab */}
          <TabsContent value="orders">
            <Card className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Manage Orders</h2>
              {orders.length === 0 ? (
                <p className="text-muted-foreground">No orders found</p>
              ) : (
                <Table>…</Table>
              )}
            </Card>
          </TabsContent>

          {/* ✅ Users Tab */}
          <TabsContent value="users">
            <Card className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
              {users.length === 0 ? (
                <p className="text-muted-foreground">No users found</p>
              ) : (
                <Table>…</Table>
              )}
            </Card>
          </TabsContent>

          {/* ✅ Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Manage Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet</p>
              ) : (
                <Table>…</Table>
              )}
            </Card>
          </TabsContent>

        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
