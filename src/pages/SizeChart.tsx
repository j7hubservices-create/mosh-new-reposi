import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer"; // ✅ Make sure you have this component
import sizeChartImage from "@/assets/sizechart.jpg"; // optional: add your image file here

const SizeChart = () => {
  const sizeData = [
    { size: "XXS–XS", uk: "4", bust: "30–31", waist: "24–25", hips: "33–35", leg: "28", sleeve: "23" },
    { size: "XS", uk: "6", bust: "31–32", waist: "25–26", hips: "35–36", leg: "28", sleeve: "23" },
    { size: "S", uk: "8", bust: "33–34", waist: "26–28", hips: "37–37", leg: "28", sleeve: "24" },
    { size: "M", uk: "10", bust: "34–35", waist: "28–29", hips: "38–39", leg: "29", sleeve: "24" },
    { size: "L", uk: "12", bust: "35–36", waist: "30–30", hips: "39–40", leg: "29", sleeve: "25" },
    { size: "XL", uk: "14", bust: "37–37", waist: "31–31", hips: "40–41", leg: "30", sleeve: "25" },
    { size: "XXL", uk: "16", bust: "37–38", waist: "31–32", hips: "41–42", leg: "31", sleeve: "26" },
  ];

  return (
    <>
      <Navbar />

      <section className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          Size Chart
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Use the chart below to find your perfect fit before making a purchase.
        </p>

        {/* Optional image section */}
        <div className="flex justify-center mb-10">
          <img
            src={sizeChartImage}
            alt="Size chart guide"
            className="max-w-md rounded-xl shadow-md"
          />
        </div>

        <div className="overflow-x-auto">
          <Card className="max-w-5xl mx-auto shadow-lg border rounded-2xl">
            <CardContent>
              <table className="w-full border-collapse text-sm md:text-base">
                <thead>
                  <tr className="bg-primary text-white text-left">
                    <th className="py-3 px-4 rounded-tl-lg">Size</th>
                    <th className="py-3 px-4">UK</th>
                    <th className="py-3 px-4">Bust (inches)</th>
                    <th className="py-3 px-4">Waist (inches)</th>
                    <th className="py-3 px-4">Hips (inches)</th>
                    <th className="py-3 px-4">Inside Leg (inches)</th>
                    <th className="py-3 px-4 rounded-tr-lg">Sleeve (inches)</th>
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
                      <td className="py-3 px-4">{row.uk}</td>
                      <td className="py-3 px-4">{row.bust}</td>
                      <td className="py-3 px-4">{row.waist}</td>
                      <td className="py-3 px-4">{row.hips}</td>
                      <td className="py-3 px-4">{row.leg}</td>
                      <td className="py-3 px-4">{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          *All measurements are approximate and may slightly vary depending on fabric or style.
        </p>
      </section>

      <Footer />
    </>
  );
};

export default SizeChart;
