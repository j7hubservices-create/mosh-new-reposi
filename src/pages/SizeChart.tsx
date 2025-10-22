import { Card, CardContent } from "@/components/ui/card";

const SizeChart = () => {
  const sizeData = [
    { size: "XS", bust: "31-32", waist: "24-25", hips: "33-34" },
    { size: "S", bust: "33-34", waist: "26-27", hips: "35-36" },
    { size: "M", bust: "35-36", waist: "28-29", hips: "37-38" },
    { size: "L", bust: "37-39", waist: "30-32", hips: "39-41" },
    { size: "XL", bust: "40-42", waist: "33-35", hips: "42-44" },
    { size: "XXL", bust: "43-45", waist: "36-38", hips: "45-47" },
  ];

  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">
        Size Chart
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Find your perfect fit using the size guide below.
      </p>

      <div className="overflow-x-auto">
        <Card className="max-w-3xl mx-auto shadow-md border rounded-2xl">
          <CardContent>
            <table className="w-full border-collapse text-sm md:text-base">
              <thead>
                <tr className="bg-primary text-white text-left">
                  <th className="py-3 px-4 rounded-tl-lg">Size</th>
                  <th className="py-3 px-4">Bust (inches)</th>
                  <th className="py-3 px-4">Waist (inches)</th>
                  <th className="py-3 px-4 rounded-tr-lg">Hips (inches)</th>
                </tr>
              </thead>
              <tbody>
                {sizeData.map((row, index) => (
                  <tr
                    key={row.size}
                    className={`border-b hover:bg-muted/30 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold">{row.size}</td>
                    <td className="py-3 px-4">{row.bust}</td>
                    <td className="py-3 px-4">{row.waist}</td>
                    <td className="py-3 px-4">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Note: Measurements are approximate and may vary slightly depending on the brand.
      </p>
    </section>
  );
};

export default SizeChart;
