import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface Props {
  categories: Array<{ id: string; name: string }>;
  count: number;
  onApply: (updates: Partial<{ price: number; stock: number; category_id: string; size: string }>) => Promise<void> | void;
  onClear: () => void;
}

export default function BulkEditPanel({ categories, count, onApply, onClear }: Props) {
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [size, setSize] = useState<string>("");

  const handleApply = () => {
    const updates: any = {};
    if (price !== "") updates.price = parseFloat(price);
    if (stock !== "") updates.stock = parseInt(stock);
    if (categoryId) updates.category_id = categoryId;
    if (size) updates.size = size;
    if (Object.keys(updates).length === 0) return;
    onApply(updates);
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Bulk editing</p>
          <p className="text-sm font-medium">{count} product(s) selected</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
          <div>
            <Label>New Price (₦)</Label>
            <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Leave empty to skip" />
          </div>
          <div>
            <Label>New Stock</Label>
            <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Leave empty to skip" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="No change" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Size</Label>
            <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g., S, M, L" />
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" onClick={handleApply}>Apply</Button>
            <Button type="button" variant="outline" onClick={onClear}>Clear</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
